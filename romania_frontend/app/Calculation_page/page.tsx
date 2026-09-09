"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import Sidebar from "../../components/Sidebar";
import Searcher from "../../components/Searchbar";
import AlgorithmSelector from "../../components/AlgorithmSelector";
import SmallMap from "../../components/SmallMap";

import History, {
  normalizeAlgorithm,
  type SavedRoute,
} from "../../components/History";

import {
  CITY_NAMES,
  getAlgorithmColor,
  getRoadDistance,
  isValidRoutePath,
  type AlgorithmName,
  type CityName,
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

/* ============================================================
   HELPERS
   ============================================================ */

function getLabel(value: string) {
  const algorithm = normalizeAlgorithm(value);

  return (
    Object.keys(ALGORITHMS).find(
      (label) => ALGORITHMS[label] === algorithm,
    ) ?? "Breadth First"
  );
}

function isMetric(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
}

function asObject(value: unknown): Record<string, unknown> {
  return value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function display(value: unknown): string {
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "—";
  }

  return typeof value === "string" ? value : "—";
}

/* ============================================================
   PAGE
   ============================================================ */

export default function CalculationPage() {
  return (
    <Suspense fallback={<p>Loading calculation…</p>}>
      <CalculationContent />
    </Suspense>
  );
}

function CalculationContent() {
  const router = useRouter();
  const params = useSearchParams();
  const routeId = params.get("routeId");

  const [route, setRoute] = useState<SavedRoute | null>(null);

  const [startCity, setStartCity] = useState<CityName>("Arad");
  const [goalCity, setGoalCity] = useState<CityName>("Bucharest");
  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState("Depth First");

  const [iteration, setIteration] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
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

  /* ==========================================================
     LOAD SAVED ROUTE
     ========================================================== */

  useEffect(() => {
    let active = true;

    setRoute(null);
    setIteration(0);
    setExpanded(false);
    setError("");

    if (!routeId) {
      setLoading(false);
      return;
    }

    async function loadRoute() {
      setLoading(true);

      try {
        const supabase = createClient();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error("Please sign in to view this saved route.");
        }

        const { data, error: queryError } = await supabase
          .from("saved_routes")
          .select("*")
          .eq("id", routeId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (queryError) {
          throw new Error(queryError.message);
        }

        if (!data) {
          throw new Error("Saved route not found.");
        }

        if (
          !isValidRoutePath(data.route_path) ||
          data.route_path[0] !== data.start_city ||
          data.route_path[data.route_path.length - 1] !==
            data.goal_city ||
          !isMetric(data.path_cost_km) ||
          !isMetric(data.execution_time_ms) ||
          !isMetric(data.peak_memory_kb)
        ) {
          throw new Error("The saved route contains invalid data.");
        }

        if (!active) return;

        const saved = data as SavedRoute;

        setRoute(saved);
        setStartCity(saved.start_city as CityName);
        setGoalCity(saved.goal_city as CityName);
        setSelectedAlgorithm(getLabel(saved.run_mode));
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load this route.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadRoute();

    return () => {
      active = false;
    };
  }, [routeId]);

  /* ==========================================================
     NAVIGATION
     ========================================================== */

  function openSavedRoute(id: string) {
    router.push(
      `${CALCULATION_URL}?routeId=${encodeURIComponent(id)}`,
    );
  }

  function handleSelectRoute(saved: SavedRoute) {
    if (runningRef.current) return;

    openSavedRoute(saved.id);
  }

  function handleReset() {
    if (runningRef.current) return;

    setStartCity("Arad");
    setGoalCity("Bucharest");
    setSelectedAlgorithm("Depth First");

    setRoute(null);
    setExpanded(false);
    setIteration(0);
    setError("");

    router.push(CALCULATION_URL);
  }

  /* ==========================================================
     RUN AND SAVE CALCULATION
     ========================================================== */

  async function handleSearch() {
    if (runningRef.current) return;

    const algorithm = ALGORITHMS[selectedAlgorithm];

    if (!algorithm) {
      setError("Please select an algorithm.");
      return;
    }

    runningRef.current = true;
    setRunning(true);
    setError("");

    const controller = new AbortController();
    controllerRef.current = controller;

    const timeout = window.setTimeout(() => {
      controller.abort();
    }, 30_000);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please sign in to save a calculation.");
      }

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

      const data = asObject(await response.json());

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
        throw new Error("The server returned invalid calculation data.");
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

      if (saveError) {
        throw new Error(saveError.message);
      }

      if (!mountedRef.current) return;

      setHistoryVersion((value) => value + 1);
      openSavedRoute(id);
    } catch (searchError) {
      if (mountedRef.current) {
        setError(
          controller.signal.aborted
            ? "Search timed out. Check the Python server."
            : searchError instanceof Error
              ? searchError.message
              : "Could not run the calculation.",
        );
      }
    } finally {
      window.clearTimeout(timeout);

      controllerRef.current = null;
      runningRef.current = false;

      if (mountedRef.current) {
        setRunning(false);
      }
    }
  }

  /* ==========================================================
     DISPLAY VALUES
     ========================================================== */

  const algorithm = route
    ? normalizeAlgorithm(route.run_mode)
    : ALGORITHMS[selectedAlgorithm];

  const color = getAlgorithmColor(algorithm);

  const steps = Array.isArray(route?.workflow_steps)
    ? route.workflow_steps
    : [];

  const step = asObject(steps[iteration]);

  const neighbors = Array.isArray(step.neighbors)
    ? step.neighbors
    : [];

  const reference = route
    ? /^\d+$/.test(route.backend_id)
      ? route.backend_id.padStart(5, "0")
      : route.id.slice(0, 8)
    : "";

  const busy = loading || running;

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <main className="calculation-page">
      <Sidebar />

      <section className="page-content">
        <Searcher
          cityNames={CITY_NAMES}
          onCitySelect={(city) => {
            if (
              !busy &&
              CITY_NAMES.includes(city as CityName)
            ) {
              setStartCity(city as CityName);
            }
          }}
        />

        <div className="calculation-layout">
          <div className="left-column">
            <fieldset disabled={busy} className="controls">
              <AlgorithmSelector
                startCity={startCity}
                goalCity={goalCity}
                selectedAlgorithm={selectedAlgorithm}
                cityNames={CITY_NAMES}
                algorithms={Object.keys(ALGORITHMS)}
                onStartCityChange={setStartCity}
                onGoalCityChange={setGoalCity}
                onAlgorithmChange={setSelectedAlgorithm}
                onSearch={() => void handleSearch()}
                onReset={handleReset}
                position="normal"
              />
            </fieldset>

            {busy && (
              <p role="status" className="message">
                {loading
                  ? "Loading calculation…"
                  : "Running calculation…"}
              </p>
            )}

            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}

            {route && (
              <section className="calculation-card">
                <div className="summary-heading">
                  <span>
                    Search reference: <strong>{reference}</strong>
                  </span>

                  <span className="algorithm-badge">
                    <i style={{ background: color }} />
                    {getLabel(route.run_mode)}
                  </span>
                </div>

                <div className="endpoints">
                  <div>
                    <span>Start</span>
                    <strong>{route.start_city}</strong>
                  </div>

                  <span aria-hidden="true">→</span>

                  <div>
                    <span>Destination</span>
                    <strong>{route.goal_city}</strong>
                  </div>
                </div>

                {/* TIME, COST, AND MEMORY */}

                <div className="metrics">
                  <span>
                    Time elapsed:{" "}
                    <strong className="value">
                      {(route.execution_time_ms / 1000).toFixed(8)} sec
                    </strong>
                  </span>

                  <span>
                    Cost:{" "}
                    <strong className="value">
                      {route.path_cost_km} km
                    </strong>
                  </span>

                  <span>
                    Peak memory usage:{" "}
                    <strong className="value">
                      {route.peak_memory_kb.toFixed(3)} KB
                    </strong>
                  </span>
                </div>

                <p className="path-label">Path:</p>

                <div className="value route-path">
                  {(route.route_path as CityName[]).join(" → ")}
                </div>

                <button
                  type="button"
                  className="expand-button"
                  onClick={() => setExpanded((value) => !value)}
                  aria-expanded={expanded}
                >
                  {expanded
                    ? "Hide iterations ▴"
                    : "Show iterations ▾"}
                </button>

                {expanded && (
                  <div className="iteration-panel">
                    {steps.length === 0 ? (
                      <p>No iteration data was saved for this route.</p>
                    ) : (
                      <>
                        <div className="iteration-navigation">
                          <button
                            type="button"
                            aria-label="Previous iteration"
                            disabled={iteration === 0}
                            onClick={() =>
                              setIteration((value) => value - 1)
                            }
                          >
                            ←
                          </button>

                          <span className="value">
                            Iteration {iteration + 1} / {steps.length}
                          </span>

                          <button
                            type="button"
                            aria-label="Next iteration"
                            disabled={iteration >= steps.length - 1}
                            onClick={() =>
                              setIteration((value) => value + 1)
                            }
                          >
                            →
                          </button>
                        </div>

                        <p>
                          Expansion node:{" "}
                          <strong>{display(step.expanded_node)}</strong>
                        </p>

                        {typeof step.h === "number" && (
                          <p>
                            Heuristic h(n):{" "}
                            <strong>{display(step.h)}</strong>
                          </p>
                        )}

                        {typeof step.g === "number" && (
                          <p>
                            Path cost so far g(n):{" "}
                            <strong>{display(step.g)}</strong>
                          </p>
                        )}

                        {typeof step.f === "number" && (
                          <p>
                            Priority f(n):{" "}
                            <strong>{display(step.f)}</strong>
                          </p>
                        )}

                        {Array.isArray(step.visited) && (
                          <p>
                            Visited:{" "}
                            {step.visited.map(display).join(", ")}
                          </p>
                        )}

                        {typeof step.visited_cost === "number" && (
                          <p>
                            Visited tree cost:{" "}
                            <strong>{display(step.visited_cost)}</strong>
                          </p>
                        )}

                        <p>Neighbors recorded in this step:</p>

                        {neighbors.length === 0 ? (
                          <p>No neighbors recorded.</p>
                        ) : (
                          neighbors.map((value, index) => {
                            const neighbor = asObject(value);

                            const edgeCost =
                              typeof step.expanded_node === "string" &&
                              typeof neighbor.city === "string"
                                ? getRoadDistance(
                                    step.expanded_node,
                                    neighbor.city,
                                  )
                                : undefined;

                            return (
                              <div
                                className="neighbor value"
                                key={index}
                              >
                                <strong>
                                  {display(neighbor.city)}
                                </strong>

                                {typeof neighbor.h === "number" && (
                                  <span>
                                    {" "}· h = {display(neighbor.h)}
                                  </span>
                                )}

                                {typeof neighbor.g === "number" && (
                                  <span>
                                    {" "}· g = {display(neighbor.g)}
                                  </span>
                                )}

                                {typeof neighbor.f === "number" && (
                                  <span>
                                    {" "}· f = {display(neighbor.f)}
                                  </span>
                                )}

                                {edgeCost !== undefined && (
                                  <span>
                                    {" "}(edge cost = {edgeCost} km)
                                  </span>
                                )}
                              </div>
                            );
                          })
                        )}

                        {Array.isArray(step.current_path) && (
                          <p>
                            Current path:{" "}
                            {step.current_path.map(display).join(" → ")}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </section>
            )}

            {!route && !busy && !error && (
              <p className="message">
                Select a saved route or run a new calculation.
              </p>
            )}

            <fieldset disabled={busy} className="controls">
              <History
                key={historyVersion}
                selectedRouteId={route?.id ?? null}
                onSelectRoute={handleSelectRoute}
              />
            </fieldset>
          </div>

          <div className="map-column">
            <SmallMap
              startCity={
                route ? (route.start_city as CityName) : startCity
              }
              goalCity={
                route ? (route.goal_city as CityName) : goalCity
              }
              path={
                route ? (route.route_path as CityName[]) : []
              }
              algorithm={algorithm}
            />
          </div>
        </div>
      </section>

      <style jsx>{`
        .calculation-page {
          min-height: 100vh;
          display: flex;
          background: #4d86b2;
        }

        .page-content {
          flex: 1;
          min-width: 0;
          padding: 20px;
        }

        .calculation-layout {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          gap: 20px;
          margin-top: 20px;
        }

        .left-column {
          flex: 1 1 360px;
          max-width: 620px;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .map-column {
          flex: 1 1 400px;
          min-width: 0;
        }

        .controls {
          min-width: 0;
          padding: 0;
          margin: 0;
          border: 0;
        }

        .calculation-card {
          padding: 18px;
          border-radius: 16px;
          background: #c5d9dc;
          color: #17242a;
          box-shadow: 0 3px 5px rgba(0, 0, 0, 0.18);
          font-family: Arial, sans-serif;
          font-size: 13px;
        }

        .summary-heading,
        .metrics,
        .iteration-navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }

        .summary-heading {
          padding-bottom: 10px;
          border-bottom: 1px solid white;
        }

        .algorithm-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border: 1px solid #879497;
          border-radius: 5px;
          background: white;
          font-size: 12px;
        }

        .algorithm-badge i {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .endpoints {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid white;
          margin-bottom: 12px;
        }

        .endpoints div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .metrics {
          justify-content: flex-start;
          gap: 10px 16px;
        }

        .value {
          display: inline-block;
          padding: 5px 8px;
          border-radius: 5px;
          background: white;
          box-shadow: 0 2px 3px rgba(0, 0, 0, 0.15);
        }

        .path-label {
          margin-bottom: 6px;
        }

        .route-path {
          display: block;
          font-weight: 700;
          line-height: 1.6;
        }

        .expand-button {
          display: block;
          margin: 14px auto 0;
          border: 0;
          background: transparent;
          color: #243e47;
          cursor: pointer;
        }

        .iteration-panel {
          margin-top: 16px;
          border-top: 1px solid white;
          padding-top: 14px;
        }

        .iteration-navigation button {
          border: 0;
          border-radius: 5px;
          padding: 5px 12px;
          background: white;
          cursor: pointer;
        }

        .iteration-navigation button:disabled {
          opacity: 0.4;
          cursor: default;
        }

        .neighbor {
          display: block;
          margin: 8px 0;
          line-height: 1.5;
        }

        .message {
          margin: 0;
          color: white;
        }

        .error {
          margin: 0;
          padding: 12px;
          border-radius: 10px;
          background: #fee2e2;
          color: #991b1b;
        }
      `}</style>
    </main>
  );
}