"use client";

import { useMemo, useState } from "react";

export type AlgorithmName =
  | "BFS"
  | "DFS"
  | "Greedy"
  | "A*"
  | "HubAndSpoke"
  | "Cheby_A_Star";

export function getAlgorithmColor(algorithm?: string): string {
  switch (algorithm) {
    case "BFS":
      return "#3B82F6";
    case "DFS":
      return "#EF4444";
    case "Greedy":
      return "#F97316";
    case "A*":
      return "#22C55E";
    case "HubAndSpoke":
      return "#A855F7";
    case "Cheby_A_Star":
      return "#06B6D4";
    default:
      return "#FFCF45";
  }
}

export type CityName =
  | "Arad"
  | "Zerind"
  | "Oradea"
  | "Sibiu"
  | "Timisoara"
  | "Lugoj"
  | "Mehadia"
  | "Drobeta"
  | "Craiova"
  | "Rimnicu Vilcea"
  | "Fagaras"
  | "Pitesti"
  | "Bucharest"
  | "Giurgiu"
  | "Urziceni"
  | "Hirsova"
  | "Eforie"
  | "Vaslui"
  | "Iasi"
  | "Neamt";

export type MapRoute = {
  id: string;
  path: CityName[];
  algorithm: AlgorithmName;
};

const cities: Record<CityName, { x: number; y: number }> = {
  Oradea: { x: 510, y: 157 },
  Zerind: { x: 467, y: 265 },
  Arad: { x: 436, y: 380 },
  Timisoara: { x: 444, y: 540 },
  Lugoj: { x: 570, y: 615 },
  Mehadia: { x: 580, y: 700 },
  Drobeta: { x: 575, y: 790 },
  Craiova: { x: 735, y: 800 },
  Sibiu: { x: 650, y: 445 },
  "Rimnicu Vilcea": { x: 700, y: 535 },
  Fagaras: { x: 835, y: 440 },
  Pitesti: { x: 860, y: 615 },
  Bucharest: { x: 1010, y: 705 },
  Giurgiu: { x: 795, y: 850 },
  Urziceni: { x: 1115, y: 650 },
  Hirsova: { x: 1255, y: 650 },
  Eforie: { x: 1305, y: 780 },
  Vaslui: { x: 1210, y: 475 },
  Iasi: { x: 1145, y: 360 },
  Neamt: { x: 1020, y: 300 },
};

const edges: [CityName, CityName, number][] = [
  ["Arad", "Zerind", 75],
  ["Zerind", "Oradea", 71],
  ["Oradea", "Sibiu", 151],
  ["Arad", "Sibiu", 140],
  ["Arad", "Timisoara", 118],
  ["Timisoara", "Lugoj", 111],
  ["Lugoj", "Mehadia", 70],
  ["Mehadia", "Drobeta", 75],
  ["Drobeta", "Craiova", 120],
  ["Sibiu", "Rimnicu Vilcea", 80],
  ["Sibiu", "Fagaras", 99],
  ["Rimnicu Vilcea", "Craiova", 146],
  ["Rimnicu Vilcea", "Pitesti", 97],
  ["Craiova", "Pitesti", 138],
  ["Fagaras", "Bucharest", 211],
  ["Pitesti", "Bucharest", 101],
  ["Bucharest", "Giurgiu", 90],
  ["Bucharest", "Urziceni", 85],
  ["Urziceni", "Hirsova", 98],
  ["Hirsova", "Eforie", 86],
  ["Urziceni", "Vaslui", 142],
  ["Vaslui", "Iasi", 92],
  ["Iasi", "Neamt", 87],
];

export const CITY_NAMES = Object.keys(cities) as CityName[];

function edgeKey(a: CityName, b: CityName) {
  return [a, b].sort().join("|");
}

const roadKeys = new Set(edges.map(([a, b]) => edgeKey(a, b)));

export function isValidRoutePath(value: unknown): value is CityName[] {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    !value.every(
      (city) =>
        typeof city === "string" &&
        CITY_NAMES.includes(city as CityName),
    )
  ) {
    return false;
  }

  for (let index = 0; index < value.length - 1; index++) {
    if (!roadKeys.has(edgeKey(value[index], value[index + 1]))) {
      return false;
    }
  }

  return true;
}

export function getRoadDistance(
  from: string,
  to: string,
): number | undefined {
  return edges.find(
    ([a, b]) =>
      (a === from && b === to) ||
      (a === to && b === from),
  )?.[2];
}

interface MapProps {
  startCity?: CityName;
  goalCity?: CityName;
  path?: CityName[];
  algorithm?: AlgorithmName;
  routes?: MapRoute[];
  showDistances?: boolean;
  showCityNames?: boolean;
  searchedCity?: CityName | null;
  onStartCityChange?: (city: CityName) => void;
  onGoalCityChange?: (city: CityName) => void;
  onRoutesClick?: (routes: MapRoute[]) => void;
}

const EMPTY_PATH: CityName[] = [];
const EMPTY_ROUTES: MapRoute[] = [];

export default function Map({
  startCity = "Arad",
  goalCity = "Bucharest",
  path = EMPTY_PATH,
  algorithm = "DFS",
  routes = EMPTY_ROUTES,
  showDistances = true,
  showCityNames = true,
  searchedCity = null,
  onStartCityChange,
  onGoalCityChange,
  onRoutesClick,
}: MapProps) {
  const [zoom, setZoom] = useState(1);

  const layers = useMemo(() => {
    const edgeAlgorithms = new globalThis.Map<
      string,
      Set<AlgorithmName>
    >();

    const cityAlgorithms = new globalThis.Map<
      CityName,
      Set<AlgorithmName>
    >();

    const savedByEdge = new globalThis.Map<
      string,
      globalThis.Map<AlgorithmName, MapRoute[]>
    >();

    function addRoute(route: MapRoute, saved: boolean) {
      if (!isValidRoutePath(route.path)) return;

      for (const city of route.path) {
        if (!cityAlgorithms.has(city)) {
          cityAlgorithms.set(city, new Set());
        }

        cityAlgorithms.get(city)!.add(route.algorithm);
      }

      const visitedEdges = new Set<string>();

      for (let index = 0; index < route.path.length - 1; index++) {
        const key = edgeKey(route.path[index], route.path[index + 1]);

        if (visitedEdges.has(key)) continue;
        visitedEdges.add(key);

        if (!edgeAlgorithms.has(key)) {
          edgeAlgorithms.set(key, new Set());
        }

        edgeAlgorithms.get(key)!.add(route.algorithm);

        if (saved) {
          if (!savedByEdge.has(key)) {
            savedByEdge.set(key, new globalThis.Map());
          }

          const byAlgorithm = savedByEdge.get(key)!;
          const matches = byAlgorithm.get(route.algorithm) ?? [];

          matches.push(route);
          byAlgorithm.set(route.algorithm, matches);
        }
      }
    }

    routes.forEach((route) => addRoute(route, true));

    if (path.length) {
      addRoute(
        {
          id: "current-search",
          path,
          algorithm,
        },
        false,
      );
    }

    return {
      edgeAlgorithms,
      cityAlgorithms,
      savedByEdge,
    };
  }, [routes, path, algorithm]);

  function handleCityClick(city: CityName) {
    if (city === startCity) return;

    if (city === goalCity) {
      onStartCityChange?.(city);
      onGoalCityChange?.(startCity);
      return;
    }

    onGoalCityChange?.(city);
  }

  return (
    <div className="map-container">
      <div className="map-viewport">
        <div
          className="map-content"
          style={{ transform: `scale(${zoom})` }}
        >
          <img
            src="/images/Blankmap.png"
            alt="Romania map"
            draggable={false}
          />

          <svg
            viewBox="0 0 1661 934"
            preserveAspectRatio="xMidYMid meet"
            aria-label="Romania map with saved routes"
          >
            {edges.map(([from, to]) => (
              <line
                key={edgeKey(from, to)}
                x1={cities[from].x}
                y1={cities[from].y}
                x2={cities[to].x}
                y2={cities[to].y}
                stroke="#f1e7ae"
                strokeWidth={5}
                strokeLinecap="round"
                opacity={0.85}
              />
            ))}

            {edges.map(([from, to]) => {
              const key = edgeKey(from, to);
              const start = cities[from];
              const end = cities[to];

              const algorithms = Array.from(
                layers.edgeAlgorithms.get(key) ?? [],
              ).sort();

              const dx = end.x - start.x;
              const dy = end.y - start.y;
              const length = Math.hypot(dx, dy) || 1;

              return algorithms.map((routeAlgorithm, index) => {
                const offset =
                  (index - (algorithms.length - 1) / 2) * 8;

                const offsetX = (-dy / length) * offset;
                const offsetY = (dx / length) * offset;

                const matches =
                  layers.savedByEdge.get(key)?.get(routeAlgorithm) ?? [];

                const clickable =
                  matches.length > 0 && Boolean(onRoutesClick);

                function openRoutes() {
                  if (clickable) onRoutesClick?.(matches);
                }

                return (
                  <g key={`${key}-${routeAlgorithm}`}>
                    <line
                      x1={start.x + offsetX}
                      y1={start.y + offsetY}
                      x2={end.x + offsetX}
                      y2={end.y + offsetY}
                      stroke={getAlgorithmColor(routeAlgorithm)}
                      strokeWidth={algorithms.length === 1 ? 9 : 5}
                      strokeLinecap="round"
                      pointerEvents="none"
                    />

                    <line
                      x1={start.x + offsetX}
                      y1={start.y + offsetY}
                      x2={end.x + offsetX}
                      y2={end.y + offsetY}
                      stroke="transparent"
                      strokeWidth={algorithms.length === 1 ? 18 : 8}
                      role={clickable ? "button" : undefined}
                      tabIndex={clickable ? 0 : undefined}
                      aria-label={`View saved ${routeAlgorithm} routes between ${from} and ${to}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        openRoutes();
                      }}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();
                          openRoutes();
                        }
                      }}
                      style={{
                        pointerEvents: clickable ? "stroke" : "none",
                        cursor: clickable ? "pointer" : "default",
                      }}
                    >
                      <title>
                        {routeAlgorithm}: {from} → {to}
                      </title>
                    </line>
                  </g>
                );
              });
            })}

            {showDistances &&
              edges.map(([from, to, distance]) => {
                const x = (cities[from].x + cities[to].x) / 2;
                const y = (cities[from].y + cities[to].y) / 2;

                return (
                  <g
                    key={`distance-${edgeKey(from, to)}`}
                    pointerEvents="none"
                  >
                    <rect
                      x={x - 18}
                      y={y - 17}
                      width={36}
                      height={28}
                      rx={8}
                      fill="white"
                      opacity={0.95}
                    />

                    <text
                      x={x}
                      y={y + 3}
                      textAnchor="middle"
                      fontSize={15}
                      fontWeight={700}
                      fill="#333"
                    >
                      {distance}
                    </text>
                  </g>
                );
              })}

            {CITY_NAMES.map((city) => {
              const position = cities[city];

              const algorithms = Array.from(
                layers.cityAlgorithms.get(city) ?? [],
              ).sort();

              return (
                <g
                  key={city}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${city}`}
                  onClick={() => handleCityClick(city)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();
                      handleCityClick(city);
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {city === searchedCity && (
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r={34}
                      fill="none"
                      stroke="white"
                      strokeWidth={7}
                    />
                  )}

                  {algorithms.map((routeAlgorithm, index) => {
                    const circumference = 2 * Math.PI * 22;
                    const segment = circumference / algorithms.length;
                    const dash = Math.max(segment - 2, 1);

                    return (
                      <circle
                        key={routeAlgorithm}
                        cx={position.x}
                        cy={position.y}
                        r={22}
                        fill="none"
                        stroke={getAlgorithmColor(routeAlgorithm)}
                        strokeWidth={5}
                        strokeDasharray={
                          algorithms.length > 1
                            ? `${dash} ${circumference - dash}`
                            : undefined
                        }
                        strokeDashoffset={-index * segment}
                        transform={`rotate(-90 ${position.x} ${position.y})`}
                      />
                    );
                  })}

                  <circle
                    cx={position.x + 2}
                    cy={position.y + 3}
                    r={18}
                    fill="rgba(0,0,0,0.25)"
                  />

                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={17}
                    fill="white"
                  />

                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={12}
                    fill={
                      city === startCity
                        ? "#22c55e"
                        : city === goalCity
                          ? "#ef4444"
                          : "#facc15"
                    }
                  />

                  {showCityNames && (
                    <text
                      x={position.x + 23}
                      y={position.y + 6}
                      fontSize={17}
                      fontWeight={700}
                      fill="white"
                      style={{
                        pointerEvents: "none",
                        paintOrder: "stroke",
                        stroke: "#263238",
                        strokeWidth: 5,
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                      }}
                    >
                      {city}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="zoom-controls">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => setZoom((value) => Math.min(value + 0.1, 2))}
        >
          +
        </button>

        <button
          type="button"
          className="zoom-reset"
          aria-label="Reset zoom"
          onClick={() => setZoom(1)}
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => setZoom((value) => Math.max(value - 0.1, 0.6))}
        >
          −
        </button>
      </div>

      <style jsx>{`
        .map-container {
          position: relative;
          width: 100%;
          max-width: 1661px;
          margin: 0 auto;
          border-radius: 24px;
          overflow: hidden;
          background: #4d86b2;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
        }

        .map-viewport {
          width: 100%;
          overflow: hidden;
        }

        .map-content {
          position: relative;
          width: 100%;
          aspect-ratio: 1661 / 934;
          transform-origin: center;
          transition: transform 0.2s ease;
        }

        img,
        svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        img {
          object-fit: contain;
          user-select: none;
          pointer-events: none;
        }

        .zoom-controls {
          position: absolute;
          left: 24px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
          z-index: 2;
        }

        .zoom-controls button {
          width: 60px;
          height: 60px;
          border: 0;
          background: rgba(190, 215, 235, 0.95);
          color: white;
          font-size: 34px;
          cursor: pointer;
        }

        .zoom-controls .zoom-reset {
          height: 40px;
          background: rgba(170, 200, 225, 0.95);
          font-size: 12px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}