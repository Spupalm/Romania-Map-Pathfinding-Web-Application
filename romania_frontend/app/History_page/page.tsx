"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import Sidebar from "../../components/Sidebar";
import Searcher from "../../components/Searchbar";
import AlgorithmSelector from "../../components/AlgorithmSelector";
import SmallMap from "../../components/SmallMap";

import History, {
  type SavedRoute,
} from "../../components/History";

import {
  CITY_NAMES,
  isValidRoutePath,
  type AlgorithmName,
  type CityName,
} from "../../components/Map";

/* ============================================================
   ALGORITHMS
   ============================================================ */

const ALGORITHM_IDS: Record<string, AlgorithmName> = {
  "Depth First": "DFS",
  "Breadth First": "BFS",
  "Greedy Best-First": "Greedy",
  "A* Search": "A*",
  "Hub and Spoke": "HubAndSpoke",
  "Adaptive A*": "Cheby_A_Star",
};

const ALGORITHMS = Object.keys(ALGORITHM_IDS);

const CALCULATION_URL = "/Calculation_page";

/* ============================================================
   VALIDATION
   ============================================================ */

type SearchResult = {
  path: CityName[];
  cost: number;
  execution_time_ms: number;
  peak_memory_kb: number;
  steps_log: unknown[];
};

function isCity(value: unknown): value is CityName {
  return (
    typeof value === "string" &&
    CITY_NAMES.includes(value as CityName)
  );
}

function isMetric(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
}

function parseResult(
  value: unknown,
  start: CityName,
  goal: CityName,
  algorithm: AlgorithmName,
): SearchResult {
  if (!value || typeof value !== "object") {
    throw new Error("Invalid response from the algorithm server.");
  }

  const data = value as Record<string, unknown>;

  if (typeof data.error === "string") {
    throw new Error(data.error);
  }

  if (
    !isValidRoutePath(data.path) ||
    data.path[0] !== start ||
    data.path[data.path.length - 1] !== goal ||
    data.algorithm !== algorithm ||
    !isMetric(data.cost) ||
    !isMetric(data.execution_time_ms) ||
    !isMetric(data.peak_memory_kb) ||
    !Array.isArray(data.steps_log)
  ) {
    throw new Error("The server returned invalid route data.");
  }

  return {
    path: data.path,
    cost: data.cost,
    execution_time_ms: data.execution_time_ms,
    peak_memory_kb: data.peak_memory_kb,
    steps_log: data.steps_log,
  };
}

/* ============================================================
   HISTORY PAGE
   ============================================================ */

export default function HistoryPage() {
  const router = useRouter();

  const [startCity, setStartCity] = useState<CityName>("Arad");
  const [goalCity, setGoalCity] = useState<CityName>("Bucharest");

  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState("Depth First");

  const [path, setPath] = useState<CityName[]>([]);
  const [routeAlgorithm, setRouteAlgorithm] =
    useState<AlgorithmName>("DFS");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [selectedRouteId, setSelectedRouteId] =
    useState<string | null>(null);

  const [historyVersion, setHistoryVersion] = useState(0);

  const runningRef = useRef(false);
  const mountedRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  function clearResult() {
    setPath([]);
    setSelectedRouteId(null);
    setError("");
  }

  function handleStartCityChange(city: CityName) {
    if (runningRef.current || !isCity(city)) return;

    setStartCity(city);
    clearResult();
  }

  function handleGoalCityChange(city: CityName) {
    if (runningRef.current || !isCity(city)) return;

    setGoalCity(city);
    clearResult();
  }

  function handleAlgorithmChange(algorithm: string) {
    if (runningRef.current) return;

    setSelectedAlgorithm(algorithm);
    clearResult();
  }

  function handleReset() {
    if (runningRef.current) return;

    setStartCity("Arad");
    setGoalCity("Bucharest");
    setSelectedAlgorithm("Depth First");
    setRouteAlgorithm("DFS");
    clearResult();
  }

  /* ==========================================================
     HISTORY CLICK → CALCULATION PAGE
     ========================================================== */

  function handleSelectHistoryRoute(route: SavedRoute) {
    if (runningRef.current) return;

    router.push(
      `${CALCULATION_URL}?routeId=${encodeURIComponent(route.id)}`,
    );
  }

  /* ==========================================================
     SEARCH → MAP → SUPABASE
     ========================================================== */

  async function handleSearch() {
    if (runningRef.current) return;

    const algorithm = ALGORITHM_IDS[selectedAlgorithm];

    if (!algorithm) {
      setError("Please select an algorithm.");
      return;
    }

    runningRef.current = true;
    setBusy(true);
    clearResult();

    const controller = new AbortController();
    controllerRef.current = controller;

    const timeout = window.setTimeout(() => {
      controller.abort();
    }, 30_000);

    try {
      const apiUrl = (
        process.env.NEXT_PUBLIC_API_URL ||
        "http://127.0.0.1:8000"
      ).replace(/\/+$/, "");

      const response = await fetch(`${apiUrl}/api/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start: startCity,
          goal: goalCity,
          algorithm,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(
          `Algorithm server returned HTTP ${response.status}.`,
        );
      }

      const result = parseResult(
        await response.json(),
        startCity,
        goalCity,
        algorithm,
      );

      window.clearTimeout(timeout);

      if (!mountedRef.current) return;

      setPath(result.path);
      setRouteAlgorithm(algorithm);

      try {
        const supabase = createClient();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error("Please sign in to save this route.");
        }

        if (!mountedRef.current) return;

        const routeId = crypto.randomUUID();

        const { error: saveError } = await supabase
          .from("saved_routes")
          .insert({
            id: routeId,
            user_id: user.id,
            backend_id: routeId,
            backend_name: selectedAlgorithm,
            start_city: startCity,
            goal_city: goalCity,
            route_path: result.path,
            workflow_steps: result.steps_log,
            run_mode: algorithm,
            path_cost_km: result.cost,
            execution_time_ms: result.execution_time_ms,
            peak_memory_kb: result.peak_memory_kb,
          });

        if (saveError) {
          throw new Error(saveError.message);
        }

        if (!mountedRef.current) return;

        setSelectedRouteId(routeId);
        setHistoryVersion((version) => version + 1);
      } catch (saveError) {
        if (!mountedRef.current) return;

        setError(
          `Route displayed, but not saved: ${
            saveError instanceof Error
              ? saveError.message
              : "Unknown saving error."
          }`,
        );
      }
    } catch (searchError) {
      if (!mountedRef.current) return;

      setError(
        controller.signal.aborted
          ? "Search timed out. Check that your Python server is running."
          : searchError instanceof TypeError
            ? "Cannot connect to the Python server. Check NEXT_PUBLIC_API_URL."
            : searchError instanceof Error
              ? searchError.message
              : "Could not search for a route.",
      );
    } finally {
      window.clearTimeout(timeout);

      controllerRef.current = null;
      runningRef.current = false;

      if (mountedRef.current) {
        setBusy(false);
      }
    }
  }

  /* ==========================================================
     LAYOUT
     ========================================================== */

  return (
    <main className="history-page">
      <Sidebar />

      <section className="page-content">
        <fieldset
          disabled={busy}
          aria-busy={busy}
          className="page-controls"
        >
          <Searcher
            cityNames={CITY_NAMES}
            onCitySelect={(city) => {
              if (isCity(city)) {
                handleStartCityChange(city);
              }
            }}
          />

          <div className="history-layout">
            <div className="left-column">
              <AlgorithmSelector
                startCity={startCity}
                goalCity={goalCity}
                selectedAlgorithm={selectedAlgorithm}
                cityNames={CITY_NAMES}
                algorithms={ALGORITHMS}
                onStartCityChange={handleStartCityChange}
                onGoalCityChange={handleGoalCityChange}
                onAlgorithmChange={handleAlgorithmChange}
                onSearch={() => void handleSearch()}
                onReset={handleReset}
                position="normal"
              />

              {error && (
                <p role="alert" className="error-message">
                  {error}
                </p>
              )}

              <History
                key={historyVersion}
                selectedRouteId={selectedRouteId}
                onSelectRoute={handleSelectHistoryRoute}
              />
            </div>

            <div className="map-column">
              <SmallMap
                startCity={startCity}
                goalCity={goalCity}
                path={path}
                algorithm={routeAlgorithm}
              />
            </div>
          </div>
        </fieldset>
      </section>

      <style jsx>{`
        .history-page {
          min-height: 100vh;
          display: flex;
          background: #4d86b2;
        }

        .page-content {
          flex: 1;
          min-width: 0;
          padding: 20px;
          box-sizing: border-box;
        }

        .page-controls {
          min-width: 0;
          margin: 0;
          padding: 0;
          border: 0;
        }

        .history-layout {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          gap: 20px;
          width: 100%;
          margin-top: 20px;
        }

        .left-column {
          flex: 1 1 420px;
          max-width: 620px;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .map-column {
          flex: 1 1 400px;
          min-width: 0;
        }

        .error-message {
          margin: 0;
          padding: 12px 16px;
          border-radius: 12px;
          background: #fee2e2;
          color: #991b1b;
          font-size: 14px;
        }
      `}</style>
    </main>
  );
}