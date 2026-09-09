"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  CITY_NAMES,
  getAlgorithmColor,
  type AlgorithmName,
  type CityName,
} from "./Map";

/* ============================================================
   TYPES
   ============================================================ */

export type SavedRoute = {
  id: string;
  user_id: string;
  backend_id: string;
  backend_name: string;
  start_city: string;
  goal_city: string;
  route_path: unknown[];
  workflow_steps: unknown[];
  run_mode: string;
  path_cost_km: number;
  execution_time_ms: number;
  peak_memory_kb: number;
  saved_at: string;
};

type HistoryProps = {
  onSelectRoute?: (route: SavedRoute) => void;
  selectedRouteId?: string | null;
};

/* ============================================================
   ALGORITHM NORMALIZATION
   ============================================================ */

export function normalizeAlgorithm(
  value: string | undefined | null,
): AlgorithmName {
  const normalized = (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  switch (normalized) {
    case "dfs":
    case "depth first":
    case "depth first search":
      return "DFS";

    case "bfs":
    case "breadth first":
    case "breadth first search":
      return "BFS";

    case "greedy":
    case "greedy best first":
    case "greedy best first search":
      return "Greedy";

    case "a*":
    case "a* search":
    case "a star":
    case "a search":
    case "a star search":
      return "A*";

    case "hubandspoke":
    case "hub and spoke":
    case "hub spoke":
      return "HubAndSpoke";

    case "cheby a star":
    case "cheby a*":
    case "cheby a search":
    case "cheby a star search":
    case "adaptive a*":
      return "Cheby_A_Star";

    default:
      return "BFS";
  }
}

/* ============================================================
   ROUTE NORMALIZATION
   ============================================================ */

export function normalizeRoutePath(value: unknown): CityName[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (city: unknown): city is CityName =>
      typeof city === "string" &&
      CITY_NAMES.includes(city as CityName),
  );
}

/* ============================================================
   ALGORITHM DISPLAY NAME
   ============================================================ */

function formatAlgorithm(algorithm: AlgorithmName): string {
  switch (algorithm) {
    case "DFS":
      return "Depth First";

    case "BFS":
      return "Breadth First";

    case "Greedy":
      return "Greedy Best-First";

    case "A*":
      return "A* Search";

    case "HubAndSpoke":
      return "Hub and Spoke";

    case "Cheby_A_Star":
      return "Adaptive A*";
  }
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function History({
  onSelectRoute,
  selectedRouteId = null,
}: HistoryProps) {
  const [history, setHistory] = useState<SavedRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ==========================================================
     LOAD SAVED ROUTES
     ========================================================== */

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      try {
        setLoading(true);
        setError("");

        const supabase = createClient();

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          if (active) {
            setHistory([]);
          }

          return;
        }

        const { data, error: historyError } = await supabase
          .from("saved_routes")
          .select(
            `
              id,
              user_id,
              backend_id,
              backend_name,
              start_city,
              goal_city,
              route_path,
              workflow_steps,
              run_mode,
              path_cost_km,
              execution_time_ms,
              peak_memory_kb,
              saved_at
            `,
          )
          .eq("user_id", user.id)
          .order("saved_at", { ascending: false })
          .order("id", { ascending: false });

        if (historyError) {
          throw historyError;
        }

        if (active) {
          setHistory((data ?? []) as SavedRoute[]);
        }
      } catch (loadError) {
        console.error("Error loading history:", loadError);

        if (active) {
          setError("Could not load your history. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadHistory();

    return () => {
      active = false;
    };
  }, []);

  /* ==========================================================
     SEARCH NUMBER
     ========================================================== */

  function getSearchNumber(route: SavedRoute, index: number) {
    const backendId = String(route.backend_id ?? "");

    if (/^\d+$/.test(backendId)) {
      return backendId.padStart(5, "0");
    }

    // Display number for records whose IDs are UUIDs.
    // Does not modify the saved database ID.
    return String(history.length - index).padStart(5, "0");
  }

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <section
      className="history-card"
      aria-label="Search history"
      aria-busy={loading}
    >
      {loading ? (
        <p className="history-message" role="status">
          Loading history…
        </p>
      ) : error ? (
        <p className="history-message history-error" role="alert">
          {error}
        </p>
      ) : history.length === 0 ? (
        <p className="history-message">
          No saved routes yet.
        </p>
      ) : (
        <div className="history-list">
          {history.map((route, index) => {
            const selected = selectedRouteId === route.id;

            const algorithm = normalizeAlgorithm(route.run_mode);
            const algorithmLabel = formatAlgorithm(algorithm);
            const algorithmColor = getAlgorithmColor(algorithm);

            const searchNumber = getSearchNumber(route, index);

            return (
              <button
                key={route.id}
                type="button"
                className={`history-row ${
                  selected ? "history-row-selected" : ""
                }`}
                onClick={() => onSelectRoute?.(route)}
                aria-pressed={selected}
                aria-label={`Search ${searchNumber}: ${route.start_city} to ${route.goal_city}, ${algorithmLabel}`}
              >
                {/* ALGORITHM COLOR SQUARE */}

                <span
                  className="history-square"
                  style={{
                    backgroundColor: algorithmColor,
                  }}
                  aria-hidden="true"
                />

                {/* SEARCH INFORMATION */}

                <span className="history-details">
                  <span className="history-title">
                    Search Number {searchNumber}
                  </span>

                  <span
                    className="history-route"
                    title={`${route.start_city} → ${route.goal_city}`}
                  >
                    {route.start_city} --- &gt; {route.goal_city}
                  </span>
                </span>

                {/* ALGORITHM BADGE */}

                <span
                  className="history-badge"
                  title={algorithmLabel}
                >
                  <span
                    className="history-dot"
                    style={{
                      backgroundColor: algorithmColor,
                    }}
                    aria-hidden="true"
                  />

                  <span className="history-algorithm">
                    {algorithmLabel}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .history-card {
          width: 100%;
          min-height: 600px;
          max-height: 600px;
          box-sizing: border-box;
          overflow-y: auto;
          padding: 38px 16px 30px 24px;
          background: #ffffff;
          border: 2px solid #1494ff;
          border-radius: 18px;
          box-shadow: 0 3px 3px rgba(0, 0, 0, 0.22);
          font-family: "Arial Narrow", Arial, sans-serif;
          color: #111111;
          scrollbar-width: thin;
          scrollbar-color: #b8d9ee transparent;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .history-row {
          display: grid;
          grid-template-columns: 26px minmax(0, 1fr) 120px;
          align-items: center;
          column-gap: 16px;
          width: 100%;
          min-height: 34px;
          margin: 0;
          padding: 0;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: inherit;
          font: inherit;
          text-align: left;
          cursor: pointer;
          transition: background 150ms ease;
        }

        .history-row:hover {
          background: #f4f9fd;
        }

        .history-row-selected {
          background: #edf7ff;
          box-shadow: 0 0 0 4px #edf7ff;
        }

        .history-row:focus-visible {
          outline: 2px solid #1494ff;
          outline-offset: 5px;
        }

        .history-row:disabled {
          cursor: wait;
        }

        .history-square {
          display: block;
          width: 26px;
          height: 27px;
          border-radius: 5px;
        }

        .history-details {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
          gap: 1px;
        }

        .history-title {
          display: block;
          font-size: 12px;
          font-weight: 700;
          line-height: 14px;
        }

        .history-route {
          display: block;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          font-size: 12px;
          font-weight: 400;
          line-height: 14px;
          color: #333333;
        }

        .history-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 120px;
          min-height: 22px;
          box-sizing: border-box;
          padding: 2px 6px;
          border: 1px solid #686868;
          border-radius: 5px;
          background: #ffffff;
          box-shadow: 0 2px 2px rgba(0, 0, 0, 0.3);
        }

        .history-dot {
          width: 9px;
          height: 9px;
          flex-shrink: 0;
          border-radius: 50%;
        }

        .history-algorithm {
          min-width: 0;
          font-size: 12px;
          font-weight: 400;
          line-height: 15px;
          letter-spacing: 0.5px;
          text-align: center;
        }

        .history-message {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          margin: 0;
          text-align: center;
          font-size: 13px;
          color: #64748b;
        }

        .history-error {
          color: #b91c1c;
        }

        @media (max-width: 380px) {
          .history-card {
            padding-right: 12px;
            padding-left: 16px;
          }

          .history-row {
            grid-template-columns: 24px minmax(0, 1fr) 106px;
            column-gap: 10px;
          }

          .history-square {
            width: 24px;
          }

          .history-badge {
            width: 106px;
          }

          .history-algorithm {
            font-size: 11px;
            letter-spacing: 0;
          }
        }
      `}</style>
    </section>
  );
}