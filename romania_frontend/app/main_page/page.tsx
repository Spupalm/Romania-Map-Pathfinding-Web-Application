"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import Navbar from "../../components/Navbar";
import AlgorithmSelector from "../../components/AlgorithmSelector";
import { normalizeAlgorithm } from "../../components/History";

import Map, {
  CITY_NAMES,
  getAlgorithmColor,
  isValidRoutePath,
  type AlgorithmName,
  type CityName,
  type MapRoute,
} from "../../components/Map";

/* ============================================================
   CONFIGURATION
   ============================================================ */

const CALCULATION_URL = "/Calculation_page";

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

/* ============================================================
   MAIN PAGE
   ============================================================ */

export default function MainPage() {
  const router = useRouter();

  const [algorithmLabel, setAlgorithmLabel] = useState("Depth First");
  const [query, setQuery] = useState("");
  const [showSelector, setShowSelector] = useState(false);

  const [startCity, setStartCity] = useState<CityName>("Arad");
  const [goalCity, setGoalCity] = useState<CityName>("Bucharest");

  const [searchedCity, setSearchedCity] =
    useState<CityName | null>(null);

  const [historyRoutes, setHistoryRoutes] = useState<MapRoute[]>([]);
  const [currentRoute, setCurrentRoute] = useState<MapRoute | null>(null);
  const [routeChoices, setRouteChoices] = useState<MapRoute[]>([]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");

  const mountedRef = useRef(false);
  const runningRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  const loadVersionRef = useRef(0);
  const accountRef = useRef<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  /* ==========================================================
     LOAD ALL SAVED ROUTES
     ========================================================== */

  const loadHistory = useCallback(async () => {
    const version = ++loadVersionRef.current;

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

      if (!user) {
        accountRef.current = null;
        setHistoryRoutes([]);
        setCurrentRoute(null);
        setRouteChoices([]);

        setHistoryError(
          authError ? "Please sign in to load saved routes." : "",
        );

        return;
      }

      if (authError) {
        throw authError;
      }

      if (accountRef.current !== user.id) {
        accountRef.current = user.id;
        setHistoryRoutes([]);
        setCurrentRoute(null);
        setRouteChoices([]);
      }

      const loaded: MapRoute[] = [];
      let offset = 0;

      while (true) {
        const { data, error: queryError } = await supabase
          .from("saved_routes")
          .select("id, start_city, goal_city, route_path, run_mode")
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

        if (queryError) {
          throw queryError;
        }

        const rows = data ?? [];

        if (rows.length === 0) {
          break;
        }

        for (const row of rows) {
          if (
            !isValidRoutePath(row.route_path) ||
            row.route_path[0] !== row.start_city ||
            row.route_path[row.route_path.length - 1] !== row.goal_city
          ) {
            continue;
          }

          loaded.push({
            id: row.id,
            path: row.route_path,
            algorithm: normalizeAlgorithm(row.run_mode),
          });
        }

        offset += rows.length;
      }

      if (
        mountedRef.current &&
        version === loadVersionRef.current
      ) {
        setHistoryRoutes(
          Array.from(
            new globalThis.Map(
              loaded.map((route) => [route.id, route]),
            ).values(),
          ),
        );

        setHistoryError("");
      }
    } catch (loadError) {
      console.error("Could not load saved routes:", loadError);

      if (
        mountedRef.current &&
        version === loadVersionRef.current
      ) {
        setHistoryError(
          "Could not load saved routes. Refresh to try again.",
        );
      }
    }
  }, []);

  /* ==========================================================
     INITIAL LOAD AND AUTHENTICATION
     ========================================================== */

  useEffect(() => {
    mountedRef.current = true;

    const supabase = createClient();
    let authTimer: ReturnType<typeof setTimeout> | undefined;

    void loadHistory();

    const refresh = () => {
      void loadHistory();
    };

    window.addEventListener("focus", refresh);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user.id ?? null;

      if (accountRef.current !== userId) {
        accountRef.current = userId;
        loadVersionRef.current += 1;

        if (mountedRef.current) {
          setHistoryRoutes([]);
          setCurrentRoute(null);
          setRouteChoices([]);
        }
      }

      clearTimeout(authTimer);

      authTimer = setTimeout(() => {
        if (mountedRef.current) {
          void loadHistory();
        }
      }, 0);
    });

    return () => {
      mountedRef.current = false;
      loadVersionRef.current += 1;

      controllerRef.current?.abort();
      clearTimeout(authTimer);

      subscription.unsubscribe();
      window.removeEventListener("focus", refresh);
    };
  }, [loadHistory]);

  /* ==========================================================
     ROUTE PICKER
     ========================================================== */

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (routeChoices.length > 0 && !dialog.open) {
      dialog.showModal();
    } else if (routeChoices.length === 0 && dialog.open) {
      dialog.close();
    }
  }, [routeChoices]);

  function openCalculation(route: MapRoute) {
    if (runningRef.current) return;

    setRouteChoices([]);
    setShowSelector(false);

    router.push(
      `${CALCULATION_URL}?routeId=${encodeURIComponent(route.id)}`,
    );
  }

  function handleRoutesClick(routes: MapRoute[]) {
    if (runningRef.current || routes.length === 0) return;

    const uniqueRoutes = Array.from(
      new globalThis.Map(
        routes.map((route) => [route.id, route]),
      ).values(),
    );

    if (uniqueRoutes.length === 1) {
      openCalculation(uniqueRoutes[0]);
    } else {
      setRouteChoices(uniqueRoutes);
    }
  }

  /* ==========================================================
     CITY AND ALGORITHM SELECTION
     ========================================================== */

  function changeStart(city: CityName) {
    if (runningRef.current) return;

    setStartCity(city);
    setCurrentRoute(null);
    setError("");
  }

  function changeGoal(city: CityName) {
    if (runningRef.current) return;

    setGoalCity(city);
    setCurrentRoute(null);
    setError("");
  }

  function selectCity(value: string) {
    if (!isCity(value) || runningRef.current) return;

    setSearchedCity(value);
    changeStart(value);
  }

  function searchCity() {
    const text = query.trim().toLowerCase();

    if (!text || runningRef.current) return;

    const city =
      CITY_NAMES.find((name) => name.toLowerCase() === text) ??
      CITY_NAMES.find((name) => name.toLowerCase().includes(text));

    if (!city) {
      setError("City not found.");
      return;
    }

    selectCity(city);
  }

  function reset() {
    if (runningRef.current) return;

    setStartCity("Arad");
    setGoalCity("Bucharest");
    setAlgorithmLabel("Depth First");
    setQuery("");
    setSearchedCity(null);
    setCurrentRoute(null);
    setError("");
  }

  /* ==========================================================
     RUN ALGORITHM AND SAVE RESULT
     ========================================================== */

  async function runAlgorithm() {
    if (runningRef.current) return;

    const algorithm = ALGORITHMS[algorithmLabel];

    if (!algorithm) {
      setError("Please select an algorithm.");
      return;
    }

    runningRef.current = true;
    setBusy(true);
    setError("");
    setCurrentRoute(null);

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
        throw new Error("The server returned incomplete route data.");
      }

      window.clearTimeout(timeout);

      if (!mountedRef.current) return;

      const route: MapRoute = {
        id: crypto.randomUUID(),
        path: data.path,
        algorithm,
      };

      setCurrentRoute(route);
      setShowSelector(false);

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

        const { error: saveError } = await supabase
          .from("saved_routes")
          .insert({
            id: route.id,
            user_id: user.id,
            backend_id: route.id,
            backend_name: algorithmLabel,
            start_city: startCity,
            goal_city: goalCity,
            route_path: data.path,
            workflow_steps: data.steps_log,
            run_mode: algorithm,
            path_cost_km: data.cost,
            execution_time_ms: data.execution_time_ms,
            peak_memory_kb: data.peak_memory_kb,
          });

        if (saveError) {
          throw new Error(saveError.message);
        }

        if (!mountedRef.current) return;

        await loadHistory();
      } catch (saveError) {
        if (mountedRef.current) {
          setError(
            `Route displayed, but not saved: ${
              saveError instanceof Error
                ? saveError.message
                : "Unknown saving error."
            }`,
          );
        }
      }
    } catch (searchError) {
      if (mountedRef.current) {
        setError(
          controller.signal.aborted
            ? "Search timed out. Check the Python server."
            : searchError instanceof TypeError
              ? "Cannot reach the Python server. Check NEXT_PUBLIC_API_URL."
              : searchError instanceof Error
                ? searchError.message
                : "Search failed.",
        );
      }
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
     RENDER
     ========================================================== */

  return (
    <main className="main-page">
      <Navbar
        algorithmLabel={algorithmLabel}
        cityNames={CITY_NAMES}
        onSearchChange={setQuery}
        onCitySelect={selectCity}
        onSearchSubmit={searchCity}
        onSearchBarClick={() => {
          if (!runningRef.current) {
            setShowSelector((open) => !open);
          }
        }}
      />

      {showSelector && (
        <>
          <div
            className="selector-backdrop"
            onClick={() => {
              if (!runningRef.current) {
                setShowSelector(false);
              }
            }}
          />

          <fieldset
            disabled={busy}
            aria-busy={busy}
            className="selector-container"
          >
            <AlgorithmSelector
              startCity={startCity}
              goalCity={goalCity}
              selectedAlgorithm={algorithmLabel}
              cityNames={CITY_NAMES}
              algorithms={Object.keys(ALGORITHMS)}
              onStartCityChange={changeStart}
              onGoalCityChange={changeGoal}
              onAlgorithmChange={(label) => {
                if (runningRef.current) return;

                setAlgorithmLabel(label);
                setCurrentRoute(null);
                setError("");
              }}
              onFocusCity={setSearchedCity}
              onSearch={() => void runAlgorithm()}
              onReset={reset}
              position="normal"
            />
          </fieldset>
        </>
      )}

      <section className="map-section">
        {(error || historyError) && (
          <p role="alert" className="error">
            {error || historyError}
          </p>
        )}

        <Map
          startCity={startCity}
          goalCity={goalCity}
          routes={historyRoutes}
          path={currentRoute?.path}
          algorithm={
            currentRoute?.algorithm ?? ALGORITHMS[algorithmLabel]
          }
          searchedCity={searchedCity}
          showDistances
          showCityNames
          onStartCityChange={changeStart}
          onGoalCityChange={changeGoal}
          onRoutesClick={handleRoutesClick}
        />
      </section>

      {/* Multiple saved routes can share the same road. */}

      <dialog
        ref={dialogRef}
        className="route-dialog"
        aria-labelledby="route-dialog-title"
        onCancel={() => setRouteChoices([])}
        onClose={() => setRouteChoices([])}
      >
        <h2 id="route-dialog-title">Choose a saved route</h2>

        <p>These searches share the road you clicked.</p>

        <div className="route-choices">
          {routeChoices.map((route) => (
            <button
              type="button"
              key={route.id}
              onClick={() => openCalculation(route)}
              className="route-choice"
            >
              <strong>
                <span
                  className="color-dot"
                  style={{
                    background: getAlgorithmColor(route.algorithm),
                  }}
                />
                {route.algorithm}
              </strong>

              <span>{route.path.join(" → ")}</span>

              <small>
                Route reference: {route.id.slice(0, 8)}
              </small>
            </button>
          ))}
        </div>

        <button
          type="button"
          autoFocus
          onClick={() => setRouteChoices([])}
          className="close-button"
        >
          Close
        </button>
      </dialog>

      <style jsx>{`
        .main-page {
          min-height: 100vh;
          background: #4d86b2;
          position: relative;
          overflow: hidden;
        }

        .selector-backdrop {
          position: fixed;
          inset: 0;
          z-index: 10;
        }

        .selector-container {
          position: absolute;
          top: 100px;
          right: 40px;
          width: min(620px, calc(100% - 48px));
          border: 0;
          padding: 0;
          margin: 0;
          min-width: 0;
          z-index: 20;
        }

        .map-section {
          width: 100%;
          padding: 20px;
          box-sizing: border-box;
        }

        .error {
          padding: 12px 16px;
          border-radius: 12px;
          background: #fee2e2;
          color: #991b1b;
        }

        .route-dialog {
          width: min(480px, calc(100vw - 40px));
          max-height: 75vh;
          box-sizing: border-box;
          padding: 24px;
          border: 0;
          border-radius: 18px;
          background: white;
          color: #17212b;
        }

        .route-dialog::backdrop {
          background: rgba(0, 0, 0, 0.4);
        }

        .route-dialog h2 {
          margin-top: 0;
        }

        .route-choices {
          display: grid;
          gap: 10px;
        }

        .route-choice {
          display: grid;
          gap: 6px;
          width: 100%;
          padding: 12px;
          border: 1px solid #bed6e8;
          border-radius: 10px;
          background: #eef7ff;
          color: inherit;
          text-align: left;
          cursor: pointer;
        }

        .color-dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          margin-right: 8px;
          border-radius: 50%;
        }

        .close-button {
          margin-top: 16px;
          padding: 8px 18px;
          border: 0;
          border-radius: 8px;
          background: #4d86b2;
          color: white;
          cursor: pointer;
        }
      `}</style>
    </main>
  );
}