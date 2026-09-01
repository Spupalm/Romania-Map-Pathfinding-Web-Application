"use client";

import React, { useMemo, useState } from "react";

/* ============================================================
   CITY TYPES
   ============================================================ */

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

interface CityPosition {
  x: number;
  y: number;
}

interface Edge {
  from: CityName;
  to: CityName;
  distance: number;
}

/* ============================================================
   CITY POSITIONS
   Based on your 1661 x 934 map
   ============================================================ */

const cities: Record<CityName, CityPosition> = {
  Oradea: {
    x: 510,
    y: 157,
  },

  Zerind: {
    x: 467,
    y: 265,
  },

  Arad: {
    x: 436,
    y: 380,
  },

  Timisoara: {
    x: 444,
    y: 540,
  },

  Lugoj: {
    x: 570,
    y: 615,
  },

  Mehadia: {
    x: 580,
    y: 700,
  },

  Drobeta: {
    x: 575,
    y: 790,
  },

  Craiova: {
    x: 735,
    y: 800,
  },

  Sibiu: {
    x: 650,
    y: 445,
  },

  "Rimnicu Vilcea": {
    x: 700,
    y: 535,
  },

  Fagaras: {
    x: 835,
    y: 440,
  },

  Pitesti: {
    x: 860,
    y: 615,
  },

  Bucharest: {
    x: 1010,
    y: 705,
  },

  Giurgiu: {
    x: 795,
    y: 850,
  },

  Urziceni: {
    x: 1115,
    y: 650,
  },

  Hirsova: {
    x: 1255,
    y: 650,
  },

  Eforie: {
    x: 1305,
    y: 780,
  },

  Vaslui: {
    x: 1210,
    y: 475,
  },

  Iasi: {
    x: 1145,
    y: 360,
  },

  Neamt: {
    x: 1020,
    y: 300,
  },
};

/* ============================================================
   ROMANIA GRAPH
   ============================================================ */

const edges: Edge[] = [
  // Western area

  {
    from: "Arad",
    to: "Zerind",
    distance: 75,
  },

  {
    from: "Zerind",
    to: "Oradea",
    distance: 71,
  },

  {
    from: "Oradea",
    to: "Sibiu",
    distance: 151,
  },

  {
    from: "Arad",
    to: "Sibiu",
    distance: 140,
  },

  {
    from: "Arad",
    to: "Timisoara",
    distance: 118,
  },

  {
    from: "Timisoara",
    to: "Lugoj",
    distance: 111,
  },

  {
    from: "Lugoj",
    to: "Mehadia",
    distance: 70,
  },

  {
    from: "Mehadia",
    to: "Drobeta",
    distance: 75,
  },

  {
    from: "Drobeta",
    to: "Craiova",
    distance: 120,
  },

  // Center

  {
    from: "Sibiu",
    to: "Rimnicu Vilcea",
    distance: 80,
  },

  {
    from: "Sibiu",
    to: "Fagaras",
    distance: 99,
  },

  {
    from: "Rimnicu Vilcea",
    to: "Craiova",
    distance: 146,
  },

  {
    from: "Rimnicu Vilcea",
    to: "Pitesti",
    distance: 97,
  },

  {
    from: "Craiova",
    to: "Pitesti",
    distance: 138,
  },

  // Bucharest

  {
    from: "Fagaras",
    to: "Bucharest",
    distance: 211,
  },

  {
    from: "Pitesti",
    to: "Bucharest",
    distance: 101,
  },

  {
    from: "Bucharest",
    to: "Giurgiu",
    distance: 90,
  },

  {
    from: "Bucharest",
    to: "Urziceni",
    distance: 85,
  },

  // East

  {
    from: "Urziceni",
    to: "Hirsova",
    distance: 98,
  },

  {
    from: "Hirsova",
    to: "Eforie",
    distance: 86,
  },

  {
    from: "Urziceni",
    to: "Vaslui",
    distance: 142,
  },

  {
    from: "Vaslui",
    to: "Iasi",
    distance: 92,
  },

  {
    from: "Iasi",
    to: "Neamt",
    distance: 87,
  },
];

/* ============================================================
   EXPORTED CITY NAME LIST
   ============================================================ */

export const CITY_NAMES = Object.keys(cities) as CityName[];

/* ============================================================
   HELPERS
   ============================================================ */

function edgeKey(a: CityName, b: CityName) {
  return [a, b].sort().join("-");
}

function getEdgeDistance(
  a: CityName,
  b: CityName
) {
  const edge = edges.find(
    (item) =>
      edgeKey(item.from, item.to) ===
      edgeKey(a, b)
  );

  return edge?.distance ?? 0;
}

/* ============================================================
   PROPS
   ============================================================ */

interface MapProps {
  startCity?: CityName;

  goalCity?: CityName;

  path?: CityName[];

  showDistances?: boolean;

  showCityNames?: boolean;

  onStartCityChange?: (
    city: CityName
  ) => void;

  onGoalCityChange?: (
    city: CityName
  ) => void;

  /*
   * City selected from Navbar search.
   *
   * This DOES NOT change the Start or End city.
   * It only highlights the searched city.
   */
  searchedCity?: CityName | null;
}

/* ============================================================
   MAP COMPONENT
   ============================================================ */

export default function Map({
  startCity: initialStartCity = "Arad",

  goalCity: initialGoalCity = "Bucharest",

  path: initialPath = [],

  showDistances = true,

  showCityNames = true,

  onStartCityChange,

  onGoalCityChange,

  searchedCity = null,
}: MapProps) {
  /* ==========================================================
     STATE
     ========================================================== */

  const [startCity, setStartCity] =
    useState<CityName>(initialStartCity);

  const [goalCity, setGoalCity] =
    useState<CityName>(initialGoalCity);

  const [path, setPath] =
    useState<CityName[]>(initialPath);

  const [zoom, setZoom] =
    useState(1);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ==========================================================
     KEEP START CITY IN SYNC
     ========================================================== */

  React.useEffect(() => {
    if (initialStartCity !== startCity) {
      setStartCity(initialStartCity);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStartCity]);

  /* ==========================================================
     KEEP GOAL CITY IN SYNC
     ========================================================== */

  React.useEffect(() => {
    if (initialGoalCity !== goalCity) {
      setGoalCity(initialGoalCity);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialGoalCity]);

  /* ==========================================================
     KEEP PATH IN SYNC
     ========================================================== */

  React.useEffect(() => {
    setPath(initialPath);
  }, [initialPath]);

  /* ==========================================================
     SEND START CITY TO PARENT
     ========================================================== */

  React.useEffect(() => {
    onStartCityChange?.(startCity);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startCity]);

  /* ==========================================================
     SEND GOAL CITY TO PARENT
     ========================================================== */

  React.useEffect(() => {
    onGoalCityChange?.(goalCity);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalCity]);

  /* ==========================================================
     PATH EDGES
     ========================================================== */

  const pathEdges = useMemo(() => {
    const result = new Set<string>();

    for (
      let i = 0;
      i < path.length - 1;
      i++
    ) {
      result.add(
        edgeKey(
          path[i],
          path[i + 1]
        )
      );
    }

    return result;
  }, [path]);

  /* ==========================================================
     TOTAL DISTANCE
     ========================================================== */

  const totalDistance = useMemo(() => {
    let total = 0;

    for (
      let i = 0;
      i < path.length - 1;
      i++
    ) {
      total += getEdgeDistance(
        path[i],
        path[i + 1]
      );
    }

    return total;
  }, [path]);

  /* ==========================================================
     RUN ALGORITHM
     ========================================================== */

  async function runAlgorithm() {
    if (startCity === goalCity) {
      setError(
        "Start and End cities cannot be the same."
      );

      return;
    }

    setError("");
    setLoading(true);
    setPath([]);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ??
        "http://127.0.0.1:8000";

      const response = await fetch(
        `${apiUrl}/api/search`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            start: startCity,

            goal: goalCity,

            algorithm: "BFS",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data =
        await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (
        Array.isArray(data.path)
      ) {
        setPath(
          data.path as CityName[]
        );
      } else {
        setPath([]);
      }
    } catch (err) {
      console.error(err);

      setError(
        "Could not connect to the pathfinding server."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ==========================================================
     CITY CLICK
     ========================================================== */

  function handleCityClick(
    city: CityName
  ) {
    /*
     * If clicking the current Start city,
     * do nothing.
     */

    if (city === startCity) {
      return;
    }

    /*
     * If clicking the current Goal city,
     * swap Start and Goal.
     */

    if (city === goalCity) {
      setGoalCity(startCity);

      setStartCity(city);

      setPath([]);

      return;
    }

    /*
     * If both Start and Goal already exist,
     * change the Goal city.
     */

    if (startCity && goalCity) {
      setGoalCity(city);

      setPath([]);

      return;
    }

    /*
     * Otherwise set Start.
     */

    setStartCity(city);

    setPath([]);
  }

  /* ==========================================================
     ZOOM
     ========================================================== */

  function zoomIn() {
    setZoom((value) =>
      Math.min(value + 0.1, 2)
    );
  }

  function zoomOut() {
    setZoom((value) =>
      Math.max(value - 0.1, 0.6)
    );
  }

  function resetZoom() {
    setZoom(1);
  }

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div
      style={{
        position: "relative",

        width: "100%",

        maxWidth: "1661px",

        margin: "0 auto",

        borderRadius: "24px",

        overflow: "hidden",

        background: "#4d86b2",

        boxShadow:
          "0 15px 40px rgba(0,0,0,0.20)",
      }}
    >
      {/* ======================================================
          MAP VIEWPORT
          ====================================================== */}

      <div
        style={{
          position: "relative",

          width: "100%",

          overflow: "hidden",
        }}
      >
        {/* ====================================================
            ZOOMABLE MAP
            ==================================================== */}

        <div
          style={{
            position: "relative",

            width: "100%",

            transform:
              `scale(${zoom})`,

            transformOrigin:
              "center center",

            transition:
              "transform 0.2s ease",
          }}
        >
          {/* ==================================================
              BACKGROUND IMAGE
              ================================================== */}

          <img
            src="/images/Blankmap.png"
            alt="Romania map"
            draggable={false}
            style={{
              display: "block",

              width: "100%",

              height: "auto",

              userSelect: "none",

              pointerEvents: "none",
            }}
          />

          {/* ==================================================
              SVG OVERLAY
              ================================================== */}

          <svg
            viewBox="0 0 1661 934"
            preserveAspectRatio="xMidYMid meet"
            style={{
              position: "absolute",

              inset: 0,

              width: "100%",

              height: "100%",

              overflow: "visible",
            }}
          >
            {/* =================================================
                ROADS
                ================================================= */}

            {edges.map(
              (edge, index) => {
                const start =
                  cities[edge.from];

                const end =
                  cities[edge.to];

                const isPathEdge =
                  pathEdges.has(
                    edgeKey(
                      edge.from,
                      edge.to
                    )
                  );

                const middleX =
                  (start.x +
                    end.x) /
                  2;

                const middleY =
                  (start.y +
                    end.y) /
                  2;

                return (
                  <g
                    key={`${edge.from}-${edge.to}-${index}`}
                  >
                    {/* PATH GLOW */}

                    {isPathEdge && (
                      <line
                        x1={start.x}
                        y1={start.y}
                        x2={end.x}
                        y2={end.y}
                        stroke="#ffcf45"
                        strokeWidth="18"
                        strokeLinecap="round"
                        opacity="0.35"
                      />
                    )}

                    {/* ROAD */}

                    <line
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                      stroke={
                        isPathEdge
                          ? "#ffcf45"
                          : "#f1e7ae"
                      }
                      strokeWidth={
                        isPathEdge
                          ? 9
                          : 5
                      }
                      strokeLinecap="round"
                      opacity={
                        isPathEdge
                          ? 1
                          : 0.85
                      }
                    />

                    {/* DISTANCE */}

                    {showDistances && (
                      <g>
                        <rect
                          x={
                            middleX -
                            18
                          }
                          y={
                            middleY -
                            17
                          }
                          width="36"
                          height="28"
                          rx="8"
                          fill="white"
                          opacity="0.95"
                        />

                        <text
                          x={middleX}
                          y={
                            middleY +
                            3
                          }
                          textAnchor="middle"
                          fontSize="15"
                          fontWeight="700"
                          fill="#333"
                        >
                          {
                            edge.distance
                          }
                        </text>
                      </g>
                    )}
                  </g>
                );
              }
            )}

            {/* =================================================
                CITY NODES
                ================================================= */}

            {Object.entries(
              cities
            ).map(
              ([
                cityName,
                position,
              ]) => {
                const city =
                  cityName as CityName;

                const isStart =
                  city ===
                  startCity;

                const isGoal =
                  city ===
                  goalCity;

                const isInPath =
                  path.includes(
                    city
                  );

                /*
                 * NEW:
                 * Is this the city searched
                 * from the Navbar?
                 */

                const isSearched =
                  city ===
                  searchedCity;

                return (
                  <g
                    key={city}
                    onClick={() =>
                      handleCityClick(
                        city
                      )
                    }
                    style={{
                      cursor:
                        "pointer",
                    }}
                  >
                    {/* =================================================
                        SEARCHED CITY HIGHLIGHT
                        ================================================= */}

                    {isSearched && (
                      <>
                        {/* Outer white ring */}

                        <circle
                          cx={
                            position.x
                          }
                          cy={
                            position.y
                          }
                          r="34"
                          fill="none"
                          stroke="white"
                          strokeWidth="7"
                          opacity="0.95"
                        />

                        {/* Inner yellow ring */}

                        <circle
                          cx={
                            position.x
                          }
                          cy={
                            position.y
                          }
                          r="27"
                          fill="none"
                          stroke="#ffcf45"
                          strokeWidth="6"
                        />
                      </>
                    )}

                    {/* =================================================
                        PATH RING
                        ================================================= */}

                    {isInPath && (
                      <circle
                        cx={
                          position.x
                        }
                        cy={
                          position.y
                        }
                        r="22"
                        fill="none"
                        stroke="#ffcf45"
                        strokeWidth="5"
                      />
                    )}

                    {/* =================================================
                        SHADOW
                        ================================================= */}

                    <circle
                      cx={
                        position.x + 2
                      }
                      cy={
                        position.y + 3
                      }
                      r="18"
                      fill="rgba(0,0,0,0.25)"
                    />

                    {/* =================================================
                        WHITE BORDER
                        ================================================= */}

                    <circle
                      cx={
                        position.x
                      }
                      cy={
                        position.y
                      }
                      r="17"
                      fill="white"
                    />

                    {/* =================================================
                        CITY NODE
                        ================================================= */}

                    <circle
                      cx={
                        position.x
                      }
                      cy={
                        position.y
                      }
                      r="12"
                      fill={
                        isStart
                          ? "#22c55e"
                          : isGoal
                          ? "#ef4444"
                          : "#facc15"
                      }
                    />

                    {/* =================================================
                        CITY NAME
                        ================================================= */}

                    {showCityNames && (
                      <text
                        x={
                          position.x +
                          23
                        }
                        y={
                          position.y +
                          6
                        }
                        fontSize="17"
                        fontWeight="700"
                        fill="white"
                        style={{
                          pointerEvents:
                            "none",

                          paintOrder:
                            "stroke",

                          stroke:
                            "#263238",

                          strokeWidth:
                            5,

                          strokeLinecap:
                            "round",

                          strokeLinejoin:
                            "round",
                        }}
                      >
                        {city}
                      </text>
                    )}

                    {/* =================================================
                        SEARCH LABEL
                        ================================================= */}

                    {isSearched && (
                      <g
                        pointerEvents="none"
                      >
                        <rect
                          x={
                            position.x -
                            45
                          }
                          y={
                            position.y -
                            65
                          }
                          width="90"
                          height="28"
                          rx="10"
                          fill="#263238"
                          opacity="0.95"
                        />

                        <text
                          x={
                            position.x
                          }
                          y={
                            position.y -
                            46
                          }
                          textAnchor="middle"
                          fontSize="14"
                          fontWeight="700"
                          fill="white"
                        >
                          {city}
                        </text>
                      </g>
                    )}
                  </g>
                );
              }
            )}
          </svg>
        </div>
      </div>

      {/* ======================================================
          ZOOM CONTROLS
          ====================================================== */}

      <div
        style={{
          position: "absolute",

          left: "24px",

          top: "50%",

          transform:
            "translateY(-50%)",

          zIndex: 30,

          display: "flex",

          flexDirection:
            "column",

          borderRadius: "18px",

          overflow: "hidden",

          boxShadow:
            "0 8px 20px rgba(0,0,0,0.25)",
        }}
      >
        {/* ZOOM IN */}

        <button
          type="button"
          onClick={zoomIn}
          aria-label="Zoom in"
          style={{
            width: "60px",

            height: "60px",

            border: "none",

            background:
              "rgba(190,215,235,0.95)",

            color: "white",

            fontSize: "34px",

            cursor: "pointer",
          }}
        >
          +
        </button>

        {/* ZOOM LEVEL */}

        <button
          type="button"
          onClick={resetZoom}
          style={{
            width: "60px",

            height: "40px",

            border: "none",

            borderTop:
              "1px solid rgba(255,255,255,0.5)",

            borderBottom:
              "1px solid rgba(255,255,255,0.5)",

            background:
              "rgba(170,200,225,0.95)",

            color: "white",

            fontSize: "12px",

            fontWeight: 700,

            cursor: "pointer",
          }}
        >
          {Math.round(
            zoom * 100
          )}
          %
        </button>

        {/* ZOOM OUT */}

        <button
          type="button"
          onClick={zoomOut}
          aria-label="Zoom out"
          style={{
            width: "60px",

            height: "60px",

            border: "none",

            background:
              "rgba(190,215,235,0.95)",

            color: "white",

            fontSize: "34px",

            cursor: "pointer",
          }}
        >
          −
        </button>
      </div>

      {/* ======================================================
          ERROR
          ====================================================== */}

      {error && (
        <div
          style={{
            position: "absolute",

            top: "24px",

            right: "24px",

            padding:
              "12px 18px",

            borderRadius: "12px",

            background:
              "rgba(180,40,40,0.95)",

            color: "white",

            fontSize: "14px",

            fontWeight: 700,

            zIndex: 30,
          }}
        >
          {error}
        </div>
      )}

      {/* ======================================================
          PATH INFORMATION
          ====================================================== */}

      {path.length > 0 && (
        <div
          style={{
            position: "absolute",

            left: "24px",

            bottom: "24px",

            width: "270px",

            padding: "18px",

            borderRadius: "18px",

            background:
              "rgba(35,70,90,0.94)",

            color: "white",

            boxShadow:
              "0 8px 25px rgba(0,0,0,0.25)",

            zIndex: 20,
          }}
        >
          <div
            style={{
              fontSize: "19px",

              fontWeight: 800,

              marginBottom:
                "12px",
            }}
          >
            Path Information
          </div>

          <div
            style={{
              display: "flex",

              justifyContent:
                "space-between",

              marginBottom: "7px",
            }}
          >
            <span>
              Start
            </span>

            <strong
              style={{
                color: "#4ade80",
              }}
            >
              {startCity}
            </strong>
          </div>

          <div
            style={{
              display: "flex",

              justifyContent:
                "space-between",

              marginBottom: "7px",
            }}
          >
            <span>
              End
            </span>

            <strong
              style={{
                color: "#f87171",
              }}
            >
              {goalCity}
            </strong>
          </div>

          <div
            style={{
              display: "flex",

              justifyContent:
                "space-between",

              marginBottom:
                "14px",
            }}
          >
            <span>
              Total
            </span>

            <strong>
              {totalDistance} km
            </strong>
          </div>

          <div
            style={{
              fontSize: "14px",

              fontWeight: 800,

              marginBottom: "7px",
            }}
          >
            Path
          </div>

          <div
            style={{
              display: "flex",

              flexDirection:
                "column",

              gap: "5px",
            }}
          >
            {path.map(
              (
                city,
                index
              ) => (
                <div
                  key={`${city}-${index}`}
                  style={{
                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap: "8px",

                    fontSize:
                      "13px",
                  }}
                >
                  <span
                    style={{
                      width: "8px",

                      height: "8px",

                      borderRadius:
                        "50%",

                      background:
                        city ===
                        startCity
                          ? "#22c55e"
                          : city ===
                            goalCity
                          ? "#ef4444"
                          : "#ffcf45",
                    }}
                  />

                  <span>
                    {index + 1}.{" "}
                    {city}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}