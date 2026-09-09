"use client";

import { useMemo, useState } from "react";

import {
  normalizeAlgorithm,
  type SavedRoute,
} from "./History";

import {
  getAlgorithmColor,
  type AlgorithmName,
} from "./Map";

/* ============================================================
   TYPES
   ============================================================ */

interface CompareProps {
  routes: SavedRoute[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  loading?: boolean;
}

type Metric = "time" | "cost" | "stops" | "memory";

type ComparisonCard = {
  title: string;
  metric: Metric;
  direction: "min" | "max";
  tone: "best" | "worst";
};

/* ============================================================
   ALGORITHM LABELS
   ============================================================ */

const LABELS: Record<AlgorithmName, string> = {
  DFS: "Depth First",
  BFS: "Breadth First",
  Greedy: "Greedy Best-First",
  "A*": "A* Search",
  HubAndSpoke: "Hub and Spoke",
  Cheby_A_Star: "Adaptive A*",
};

/* ============================================================
   COMPARISON CARDS
   ============================================================ */

const CARDS: ComparisonCard[] = [
  {
    title: "Best Time",
    metric: "time",
    direction: "min",
    tone: "best",
  },
  {
    title: "Best Cost",
    metric: "cost",
    direction: "min",
    tone: "best",
  },
  {
    title: "Least Stops",
    metric: "stops",
    direction: "min",
    tone: "best",
  },
  {
    title: "Least Memory",
    metric: "memory",
    direction: "min",
    tone: "best",
  },
  {
    title: "Worst Time",
    metric: "time",
    direction: "max",
    tone: "worst",
  },
  {
    title: "Worst Cost",
    metric: "cost",
    direction: "max",
    tone: "worst",
  },
  {
    title: "Most Stops",
    metric: "stops",
    direction: "max",
    tone: "worst",
  },
  {
    title: "Most Memory",
    metric: "memory",
    direction: "max",
    tone: "worst",
  },
];

/* ============================================================
   HELPERS
   ============================================================ */

function isValidMetric(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0
  );
}

function getValue(route: SavedRoute, metric: Metric): number {
  switch (metric) {
    case "time":
      return route.execution_time_ms;

    case "cost":
      return route.path_cost_km;

    case "stops":
      // Intermediate cities, excluding start and destination.
      return Math.max(route.route_path.length - 2, 0);

    case "memory":
      return route.peak_memory_kb;
  }
}

function formatValue(value: number, metric: Metric): string {
  switch (metric) {
    case "time":
      return `${(value / 1000).toFixed(8)} Sec`;

    case "cost":
      return `${value.toLocaleString()} km`;

    case "stops":
      return String(value);

    case "memory":
      return `${value.toFixed(3)} KB`;
  }
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function Compare({
  routes,
  selectedIds,
  onSelectionChange,
  loading = false,
}: CompareProps) {
  const [expanded, setExpanded] = useState(false);

  const selectedRoutes = useMemo(
    () => routes.filter((route) => selectedIds.includes(route.id)),
    [routes, selectedIds],
  );

  const searchNumbers = useMemo(
    () =>
      new Map(
        routes.map((route, index) => [
          route.id,
          /^\d+$/.test(route.backend_id)
            ? route.backend_id.padStart(5, "0")
            : String(routes.length - index).padStart(5, "0"),
        ]),
      ),
    [routes],
  );

  const differentEndpoints =
    new Set(
      selectedRoutes.map(
        (route) => `${route.start_city}|${route.goal_city}`,
      ),
    ).size > 1;

  const missingMemory = selectedRoutes.some(
    (route) => !isValidMetric(route.peak_memory_kb),
  );

  const visibleRoutes = expanded ? routes : routes.slice(0, 3);

  function toggleRoute(id: string) {
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    );
  }

  return (
    <section className="compare-component">
      {/* ====================================================
          SAVED ROUTE CHECKBOXES
          ==================================================== */}

      <div className="route-list" aria-busy={loading}>
        {loading ? (
          <p className="list-message" role="status">
            Loading saved routes…
          </p>
        ) : routes.length === 0 ? (
          <p className="list-message">
            No saved routes yet. Run a search first.
          </p>
        ) : (
          <>
            <div className={`rows ${expanded ? "expanded" : ""}`}>
              {visibleRoutes.map((route) => {
                const checked = selectedIds.includes(route.id);
                const algorithm = normalizeAlgorithm(route.run_mode);
                const color = getAlgorithmColor(algorithm);

                return (
                  <label
                    key={route.id}
                    className={`route-row ${
                      checked ? "selected" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRoute(route.id)}
                      aria-label={`Compare search ${searchNumbers.get(
                        route.id,
                      )}: ${route.start_city} to ${route.goal_city}, ${
                        LABELS[algorithm]
                      }`}
                    />

                    <span
                      className="checkbox"
                      style={{ background: color }}
                      aria-hidden="true"
                    >
                      {checked && (
                        <svg viewBox="0 0 24 24">
                          <path
                            d="M4 12.5 9.5 18 20 6"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>

                    <span className="route-info">
                      <strong>
                        Search Number {searchNumbers.get(route.id)}
                      </strong>

                      <span
                        title={`${route.start_city} → ${route.goal_city}`}
                      >
                        {route.start_city} --- &gt; {route.goal_city}
                      </span>
                    </span>

                    <span className="algorithm-badge">
                      <i style={{ background: color }} />
                      <span>{LABELS[algorithm]}</span>
                    </span>
                  </label>
                );
              })}
            </div>

            {routes.length > 3 && (
              <button
                type="button"
                className="expand-list"
                aria-expanded={expanded}
                aria-label={
                  expanded
                    ? "Show fewer routes"
                    : "Show all routes"
                }
                onClick={() => setExpanded((value) => !value)}
              >
                {expanded ? "▴" : "▾"}
              </button>
            )}
          </>
        )}
      </div>

      {/* ====================================================
          SELECTION INFORMATION
          ==================================================== */}

      <div className="selection-info" aria-live="polite">
        <span>
          {selectedRoutes.length < 2
            ? "Select at least two routes."
            : `${selectedRoutes.length} routes selected`}
        </span>

        {selectedRoutes.length > 0 && (
          <button
            type="button"
            onClick={() => onSelectionChange([])}
          >
            Clear
          </button>
        )}
      </div>

      {differentEndpoints && (
        <p className="comparison-note">
          Different journeys are selected. These cards compare the
          recorded results, not algorithms on the same journey.
        </p>
      )}

      {missingMemory && (
        <p className="comparison-note">
          Some selected routes have no valid memory measurement.
          Memory cards require a measurement for every selected route.
        </p>
      )}

      {/* ====================================================
          EIGHT COMPARISON CARDS
          ==================================================== */}

      <div className="comparison-grid">
        {CARDS.map((card) => {
          const hasEnoughRoutes = selectedRoutes.length >= 2;

          const allValuesValid = selectedRoutes.every((route) =>
            isValidMetric(getValue(route, card.metric)),
          );

          const canCompare = hasEnoughRoutes && allValuesValid;

          const bestValue = canCompare
            ? selectedRoutes.reduce(
                (best, route) =>
                  card.direction === "min"
                    ? Math.min(best, getValue(route, card.metric))
                    : Math.max(best, getValue(route, card.metric)),
                card.direction === "min" ? Infinity : -Infinity,
              )
            : null;

          const winners =
            bestValue === null
              ? []
              : selectedRoutes.filter(
                  (route) =>
                    getValue(route, card.metric) === bestValue,
                );

          const winner = winners[0];

          const algorithm = winner
            ? normalizeAlgorithm(winner.run_mode)
            : null;

          return (
            <article
              key={card.title}
              className={`metric-card ${card.tone}`}
            >
              <h3>{card.title}</h3>

              {winner && algorithm && bestValue !== null ? (
                <>
                  <div className="winner-info">
                    <strong>
                      Search Number {searchNumbers.get(winner.id)}
                    </strong>

                    <span
                      className="winner-route"
                      title={`${winner.start_city} → ${winner.goal_city}`}
                    >
                      {winner.start_city} --- &gt; {winner.goal_city}
                    </span>

                    <span className="mini-badge">
                      <i
                        style={{
                          background: getAlgorithmColor(algorithm),
                        }}
                      />
                      {LABELS[algorithm]}
                    </span>
                  </div>

                  <div
                    className="metric-value"
                    title={
                      card.metric === "memory"
                        ? "Peak memory usage"
                        : undefined
                    }
                  >
                    {formatValue(bestValue, card.metric)}
                  </div>

                  {winners.length > 1 && (
                    <details className="ties">
                      <summary>
                        Tied: {winners.length} routes
                      </summary>

                      {winners.map((tied) => (
                        <div key={tied.id}>
                          #{searchNumbers.get(tied.id)} —{" "}
                          {LABELS[normalizeAlgorithm(tied.run_mode)]}
                        </div>
                      ))}
                    </details>
                  )}
                </>
              ) : (
                <>
                  <div className="empty-winner">
                    {!hasEnoughRoutes
                      ? "Select two or more routes"
                      : "Measurement unavailable"}
                  </div>

                  <div className="metric-value">—</div>
                </>
              )}
            </article>
          );
        })}
      </div>

      <p className="metric-note">
        Memory = peak memory usage. Stops exclude the start and
        destination.
      </p>

      <style jsx>{`
        .compare-component {
          width: 100%;
          color: #111;
          font-family: Arial, sans-serif;
          container-type: inline-size;
        }

        .route-list {
          padding: 18px 0 8px;
          border-radius: 18px;
          overflow: hidden;
          background: white;
        }

        .rows.expanded {
          max-height: 330px;
          overflow-y: auto;
          scrollbar-width: thin;
        }

        .route-row {
          position: relative;
          display: grid;
          grid-template-columns: 30px minmax(0, 1fr) 136px;
          align-items: center;
          gap: 16px;
          min-height: 54px;
          padding: 7px 22px;
          box-sizing: border-box;
          cursor: pointer;
        }

        .route-row.selected {
          background: #d6d6d6;
          box-shadow: inset 0 -2px 3px rgba(0, 0, 0, 0.12);
        }

        .route-row:hover {
          background: #eaf4fb;
        }

        .route-row:focus-within {
          outline: 2px solid #1494ff;
          outline-offset: -2px;
        }

        .route-row input {
          position: absolute;
          width: 1px;
          height: 1px;
          opacity: 0;
        }

        .checkbox {
          display: grid;
          place-items: center;
          width: 30px;
          height: 30px;
          border-radius: 5px;
          box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2);
        }

        .checkbox svg {
          width: 25px;
          height: 25px;
          filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.35));
        }

        .route-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
          font-size: 12px;
        }

        .route-info strong {
          font-size: 13px;
          line-height: 1.2;
        }

        .route-info > span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .algorithm-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-height: 24px;
          padding: 3px 6px;
          border: 1px solid #666;
          border-radius: 6px;
          background: white;
          box-shadow: 0 2px 3px rgba(0, 0, 0, 0.3);
          font-size: 12px;
          text-align: center;
        }

        .algorithm-badge i {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .expand-list {
          display: block;
          width: 100%;
          padding: 0;
          border: 0;
          background: white;
          color: #222;
          font-size: 22px;
          line-height: 20px;
          cursor: pointer;
        }

        .list-message {
          padding: 22px;
          margin: 0;
          text-align: center;
          color: #475569;
          font-size: 13px;
        }

        .selection-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 8px 2px;
          color: white;
          font-size: 12px;
        }

        .selection-info button {
          border: 0;
          background: transparent;
          color: white;
          text-decoration: underline;
          cursor: pointer;
        }

        .comparison-note {
          margin: 0 0 10px;
          padding: 10px;
          border-radius: 10px;
          background: #fff3ce;
          font-size: 12px;
          line-height: 1.5;
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .metric-card {
          display: flex;
          flex-direction: column;
          min-width: 0;
          min-height: 150px;
          padding: 14px 10px 12px;
          border-radius: 19px;
          box-sizing: border-box;
        }

        .best {
          background: #c4dce7;
        }

        .worst {
          background: #e7c8c8;
        }

        .metric-card h3 {
          margin: 0 0 10px;
          text-align: center;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.3px;
        }

        .winner-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          min-width: 0;
          margin-bottom: 8px;
          font-size: 10px;
        }

        .winner-info strong {
          font-size: 10px;
          line-height: 1.3;
        }

        .winner-route {
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .mini-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          max-width: 100%;
          padding: 2px 4px;
          border: 1px solid #999;
          border-radius: 4px;
          background: white;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          font-size: 8px;
        }

        .mini-badge i {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .metric-value {
          display: grid;
          place-items: center;
          min-height: 32px;
          padding: 6px 4px;
          margin-top: auto;
          border-radius: 5px;
          background: white;
          box-shadow: 0 3px 3px rgba(0, 0, 0, 0.25);
          text-align: center;
          font-size: 11px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .empty-winner {
          flex: 1;
          padding: 4px 0 10px;
          font-size: 11px;
          line-height: 1.5;
          color: #4b5563;
          text-align: center;
        }

        .ties {
          margin-top: 8px;
          font-size: 10px;
          line-height: 1.5;
        }

        .ties summary {
          cursor: pointer;
        }

        .metric-note {
          margin: 10px 2px 0;
          color: white;
          font-size: 11px;
          line-height: 1.5;
        }

        @container (max-width: 520px) {
          .comparison-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @container (max-width: 420px) {
          .route-row {
            grid-template-columns: 28px minmax(0, 1fr) 112px;
            gap: 10px;
            padding: 7px 14px;
          }

          .algorithm-badge {
            font-size: 11px;
          }

          .metric-card {
            padding: 12px 10px;
          }
        }
      `}</style>
    </section>
  );
}