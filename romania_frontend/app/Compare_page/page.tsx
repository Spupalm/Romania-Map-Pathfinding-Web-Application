"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

import Sidebar from "../../components/Sidebar";
import Searcher from "../../components/Searchbar";
import AlgorithmSelector from "../../components/AlgorithmSelector";
import Compare from "../../components/Compare";

import {
  normalizeAlgorithm,
  type SavedRoute,
} from "../../components/History";

import Map, {
  CITY_NAMES,
  isValidRoutePath,
  type AlgorithmName,
  type CityName,
  type MapRoute,
} from "../../components/Map";

const ALGORITHMS: Record<string, AlgorithmName> = {
  "Depth First": "DFS",
  "Breadth First": "BFS",
  "Greedy Best-First": "Greedy",
  "A* Search": "A*",
  "Hub and Spoke": "HubAndSpoke",
  "Adaptive A*": "Cheby_A_Star",
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

export default function ComparePage() {
  const [startCity, setStartCity] = useState<CityName>("Arad");
  const [goalCity, setGoalCity] = useState<CityName>("Bucharest");
  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState("Depth First");

  const [searchedCity, setSearchedCity] =
    useState<CityName | null>(null);

  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");

  const mountedRef = useRef(false);
  const runningRef = useRef(false);
  const requestRef = useRef<AbortController | null>(null);
  const loadVersionRef = useRef(0);
  const accountRef = useRef<string | null>(null);

  /* ==========================================================
     LOAD SAVED ROUTES
     ========================================================== */

  const loadRoutes = useCallback(async () => {
    const version = ++loadVersionRef.current;

    if (mountedRef.current) {
      setLoading(true);
      setHistoryError("");
    }

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (
        !mountedRef.current ||
        version !== loadVersionRef.current
      ) {
        return;
      }

      if (authError || !user) {
        setRoutes([]);
        setSelectedIds([]);
        throw new Error("Please sign in to compare saved routes.");
      }

      if (accountRef.current !== user.id) {
        accountRef.current = user.id;
        setRoutes([]);
        setSelectedIds([]);
      }

      const loaded: SavedRoute[] = [];
      let offset = 0;

      while (true) {
        const { data, error: queryError } = await supabase
          .from("saved_routes")
          .select("*")
          .eq("user_id", user.id)
          .order("saved_at", { ascending: false })
          .order("id", { ascending: false })
          .range(offset, offset + 499);

        if (
          !mountedRef.current ||
          version !== loadVersionRef.current
        ) {
          return;
        }

        if (queryError) throw new Error(queryError.message);

        const rows = data ?? [];
        if (rows.length === 0) break;

        for (const row of rows) {
          if (
            isValidRoutePath(row.route_path) &&
            row.route_path[0] === row.start_city &&
            row.route_path[row.route_path.length - 1] ===
              row.goal_city &&
            isMetric(row.path_cost_km) &&
            isMetric(row.execution_time_ms)
          ) {
            loaded.push(row as SavedRoute);
          }
        }

        offset += rows.length;
      }

      if (
        mountedRef.current &&
        version === loadVersionRef.current
      ) {
        const unique = Array.from(
          new globalThis.Map(
            loaded.map((route) => [route.id, route]),
          ).values(),
        );

        setRoutes(unique);
        setSelectedIds((ids) =>
          ids.filter((id) => unique.some((route) => route.id === id)),
        );
      }
    } catch (loadError) {
      if (
        mountedRef.current &&
        version === loadVersionRef.current
      ) {
        setHistoryError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load saved routes.",
        );
      }
    } finally {
      if (
        mountedRef.current &&
        version === loadVersionRef.current
      ) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const supabase = createClient();
    let authTimer: ReturnType<typeof setTimeout> | undefined;

    void loadRoutes();

    const refresh = () => {
      if (!runningRef.current) void loadRoutes();
    };

    window.addEventListener("focus", refresh);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user.id ?? null;

      if (accountRef.current === userId) return;

      accountRef.current = userId;
      loadVersionRef.current += 1;

      if (mountedRef.current) {
        setRoutes([]);
        setSelectedIds([]);
      }

      clearTimeout(authTimer);

      authTimer = setTimeout(() => {
        if (mountedRef.current) void loadRoutes();
      }, 0);
    });

    return () => {
      mountedRef.current = false;
      loadVersionRef.current += 1;
      requestRef.current?.abort();
      clearTimeout(authTimer);
      subscription.unsubscribe();
      window.removeEventListener("focus", refresh);
    };
  }, [loadRoutes]);

  /* ==========================================================
     SELECTED ROUTES → MAP
     ========================================================== */

  const mapRoutes = useMemo<MapRoute[]>(
    () =>
      routes
        .filter(
          (route) =>
            selectedIds.includes(route.id) &&
            isValidRoutePath(route.route_path),
        )
        .map((route) => ({
          id: route.id,
          path: route.route_path as CityName[],
          algorithm: normalizeAlgorithm(route.run_mode),
        })),
    [routes, selectedIds],
  );

  function changeStart(city: CityName) {
    if (runningRef.current || !isCity(city)) return;
    setStartCity(city);
    setError("");
  }

  function changeGoal(city: CityName) {
    if (runningRef.current || !isCity(city)) return;
    setGoalCity(city);
    setError("");
  }

  function reset() {
    if (runningRef.current) return;

    setStartCity("Arad");
    setGoalCity("Bucharest");
    setSelectedAlgorithm("Depth First");
    setSearchedCity(null);
    setSelectedIds([]);
    setError("");
  }

  /* ==========================================================
     RUN SEARCH AND SAVE
     ========================================================== */

  async function handleSearch() {
    if (runningRef.current) return;

    const algorithm = ALGORITHMS[selectedAlgorithm];

    if (!algorithm) {
      setError("Please select an algorithm.");
      return;
    }

    runningRef.current = true;
    setBusy(true);
    setError("");

    const controller = new AbortController();
    requestRef.current = controller;

    const timeout = window.setTimeout(
      () => controller.abort(),
      30000,
    );

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please sign in to save a search.");
      }

      const apiUrl = (
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
      ).replace(/\/+$/, "");

      const response = await fetch(`${apiUrl}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      const value: unknown = await response.json();

      if (!value || typeof value !== "object") {
        throw new Error("Invalid algorithm response.");
      }

      const data = value as Record<string, unknown>;

      if (typeof data.error === "string") {
        throw new Error(data.error);
      }

      if (
        data.algorithm !== algorithm ||
        !isValidRoutePath(data.path) ||
        data.path[0] !== startCity ||
        data.path[data.path.length - 1] !== goalCity ||
        !isMetric(data.cost) ||
        !isMetric(data.execution_time_ms) ||
        !isMetric(data.peak_memory_kb) ||
        !Array.isArray(data.steps_log)
      ) {
        throw new Error("The server returned invalid route data.");
      }

      window.clearTimeout(timeout);
      if (!mountedRef.current) return;

      const id = crypto.randomUUID();

      const { error: saveError } = await supabase
        .from("saved_routes")
        .insert({
          id,
          user_id: user.id,
          backend_id: id,
          backend_name: selectedAlgorithm,
          start_city: startCity,
          goal_city: goalCity,
          route_path: data.path,
          workflow_steps: data.steps_log,
          run_mode: algorithm,
          path_cost_km: data.cost,
          execution_time_ms: data.execution_time_ms,
          peak_memory_kb: data.peak_memory_kb,
        });

      if (saveError) throw new Error(saveError.message);
      if (!mountedRef.current) return;

      // Refresh the list. Select the new row to compare it.
      await loadRoutes();
    } catch (searchError) {
      if (mountedRef.current) {
        setError(
          controller.signal.aborted
            ? "Search timed out. Check the Python server."
            : searchError instanceof TypeError
              ? "Cannot connect to the Python server."
              : searchError instanceof Error
                ? searchError.message
                : "Search failed.",
        );
      }
    } finally {
      window.clearTimeout(timeout);
      requestRef.current = null;
      runningRef.current = false;

      if (mountedRef.current) setBusy(false);
    }
  }

  return (
    <main className="compare-page">
      <Sidebar />

      <section className="page-content">
        <Searcher
          cityNames={CITY_NAMES}
          onCitySelect={(city) => {
            if (!runningRef.current && isCity(city)) {
              changeStart(city);
              setSearchedCity(city);
            }
          }}
        />

        <div className="compare-layout">
          <div className="left-column">
            <fieldset
              disabled={busy}
              aria-busy={busy}
              className="controls"
            >
              <AlgorithmSelector
                startCity={startCity}
                goalCity={goalCity}
                selectedAlgorithm={selectedAlgorithm}
                cityNames={CITY_NAMES}
                algorithms={Object.keys(ALGORITHMS)}
                onStartCityChange={changeStart}
                onGoalCityChange={changeGoal}
                onAlgorithmChange={(algorithm) => {
                  if (runningRef.current) return;
                  setSelectedAlgorithm(algorithm);
                  setError("");
                }}
                onFocusCity={setSearchedCity}
                onSearch={() => void handleSearch()}
                onReset={reset}
                position="normal"
              />
            </fieldset>

            {busy && (
              <p className="status" role="status">
                Running search and saving result…
              </p>
            )}

            {(error || historyError) && (
              <p className="error" role="alert">
                {error || historyError}
              </p>
            )}

            <Compare
              routes={routes}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              loading={loading}
            />
          </div>

          <div className="map-column">
            <div className="map-frame">
              <Map
                startCity={startCity}
                goalCity={goalCity}
                routes={mapRoutes}
                searchedCity={searchedCity}
                showDistances
                showCityNames
                onStartCityChange={changeStart}
                onGoalCityChange={changeGoal}
              />
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .compare-page {
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

        .compare-layout {
          display: grid;
          grid-template-columns: minmax(360px, 1fr) minmax(360px, 1fr);
          align-items: start;
          gap: 20px;
          margin-top: 24px;
        }

        .left-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 0;
        }

        .controls {
          border: 0;
          padding: 0;
          margin: 0;
          min-width: 0;
        }

        .map-column {
          min-width: 0;
        }

        .map-frame {
          padding: 16px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 3px 5px rgba(0, 0, 0, 0.18);
        }

        /* Applies only to the map inside this Compare page. */
        .map-frame :global(.map-content) {
          height: 590px;
          aspect-ratio: auto;
        }

        .status {
          margin: 0;
          color: white;
          font-size: 13px;
        }

        .error {
          margin: 0;
          padding: 12px;
          border-radius: 10px;
          background: #fee2e2;
          color: #991b1b;
          font-size: 13px;
        }

        @media (max-width: 1000px) {
          .compare-layout {
            grid-template-columns: minmax(0, 1fr);
          }

          .map-frame :global(.map-content) {
            height: 480px;
          }
        }

        @media (max-width: 600px) {
          .page-content {
            padding: 12px;
          }

          .map-frame {
            padding: 8px;
          }
        }
      `}</style>
    </main>
  );
}