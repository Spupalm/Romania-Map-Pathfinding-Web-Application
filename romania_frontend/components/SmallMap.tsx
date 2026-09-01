"use client";

import React, { useState } from "react";
import type { CityName } from "./Map";

/* ============================================================
   CITY POSITIONS
   ============================================================ */

const cities: Record<
  CityName,
  { x: number; y: number }
> = {
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

/* ============================================================
   EDGES
   ============================================================ */

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

/* ============================================================
   PROPS
   ============================================================ */

interface SmallMapProps {
  startCity?: CityName;
  goalCity?: CityName;
  path?: CityName[];
}

/* ============================================================
   HELPERS
   ============================================================ */

function sameEdge(
  a: CityName,
  b: CityName,
  c: CityName,
  d: CityName
) {
  return (
    (a === c && b === d) ||
    (a === d && b === c)
  );
}

function getDistance(
  a: CityName,
  b: CityName
) {
  const edge = edges.find(
    ([from, to]) =>
      sameEdge(from, to, a, b)
  );

  return edge ? edge[2] : 0;
}

/* ============================================================
   SMALL MAP COMPONENT
   ============================================================ */

export default function SmallMap({
  startCity = "Arad",
  goalCity = "Bucharest",
  path = [
    "Arad",
    "Sibiu",
    "Rimnicu Vilcea",
    "Pitesti",
    "Bucharest",
  ],
}: SmallMapProps) {
  const [zoom, setZoom] = useState(1);

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const [dragging, setDragging] = useState(false);

  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
  });

  /* ==========================================================
     CHECK PATH EDGE
     ========================================================== */

  function isPathEdge(
    a: CityName,
    b: CityName
  ) {
    for (
      let i = 0;
      i < path.length - 1;
      i++
    ) {
      if (
        sameEdge(
          a,
          b,
          path[i],
          path[i + 1]
        )
      ) {
        return true;
      }
    }

    return false;
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

  function resetMap() {
    setZoom(1);

    setPosition({
      x: 0,
      y: 0,
    });
  }

  /* ==========================================================
     MOUSE DRAG
     ========================================================== */

  function handleMouseDown(
    e: React.MouseEvent
  ) {
    setDragging(true);

    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }

  function handleMouseMove(
    e: React.MouseEvent
  ) {
    if (!dragging) return;

    setPosition({
      x:
        e.clientX -
        dragStart.x,

      y:
        e.clientY -
        dragStart.y,
    });
  }

  function handleMouseUp() {
    setDragging(false);
  }

  /* ==========================================================
     TOUCH
     ========================================================== */

  function handleTouchStart(
    e: React.TouchEvent
  ) {
    const touch = e.touches[0];

    setDragging(true);

    setDragStart({
      x:
        touch.clientX -
        position.x,

      y:
        touch.clientY -
        position.y,
    });
  }

  function handleTouchMove(
    e: React.TouchEvent
  ) {
    if (!dragging) return;

    const touch = e.touches[0];

    setPosition({
      x:
        touch.clientX -
        dragStart.x,

      y:
        touch.clientY -
        dragStart.y,
    });
  }

  function handleTouchEnd() {
    setDragging(false);
  }

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "820px",
        borderRadius: "24px",
        overflow: "hidden",
        background: "#4d86b2",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.20)",
      }}
    >
      {/* ======================================================
          MAP VIEWPORT
          ====================================================== */}

      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          cursor: dragging
            ? "grabbing"
            : "grab",
          touchAction: "none",
        }}
      >
        {/* ====================================================
            MAP
            ==================================================== */}

        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            transform: `
              translate(${position.x}px, ${position.y}px)
              scale(${zoom})
            `,
            transformOrigin:
              "center center",
            transition: dragging
              ? "none"
              : "transform 0.15s ease",
          }}
        >
          {/* ==================================================
              BACKGROUND
              ================================================== */}

          <img
            src="/images/Blankmap.png"
            alt="Romania map"
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              userSelect: "none",
              pointerEvents: "none",
            }}
          />

          {/* ==================================================
              SVG
              ================================================== */}

          <svg
            viewBox="0 0 1661 934"
            preserveAspectRatio="xMidYMid meet"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            {/* =================================================
                ROADS
                ================================================= */}

            {edges.map(
              ([from, to, distance], index) => {
                const start =
                  cities[from];

                const end =
                  cities[to];

                const highlighted =
                  isPathEdge(
                    from,
                    to
                  );

                const middleX =
                  (start.x + end.x) / 2;

                const middleY =
                  (start.y + end.y) / 2;

                return (
                  <g key={index}>
                    <line
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                      stroke={
                        highlighted
                          ? "#ffcf45"
                          : "#f1e7ae"
                      }
                      strokeWidth={
                        highlighted
                          ? 8
                          : 5
                      }
                      strokeLinecap="round"
                      opacity={
                        highlighted
                          ? 1
                          : 0.85
                      }
                    />

                    <rect
                      x={middleX - 16}
                      y={middleY - 13}
                      width="32"
                      height="24"
                      rx="7"
                      fill="white"
                      opacity="0.9"
                    />

                    <text
                      x={middleX}
                      y={middleY + 5}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="700"
                      fill="#333"
                    >
                      {distance}
                    </text>
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
              ([cityName, cityPosition]) => {
                const city =
                  cityName as CityName;

                const isStart =
                  city === startCity;

                const isGoal =
                  city === goalCity;

                const isPath =
                  path.includes(city);

                return (
                  <g key={city}>
                    {/* PATH RING */}

                    {isPath && (
                      <circle
                        cx={cityPosition.x}
                        cy={cityPosition.y}
                        r="20"
                        fill="none"
                        stroke="#ffcf45"
                        strokeWidth="5"
                      />
                    )}

                    {/* WHITE BORDER */}

                    <circle
                      cx={cityPosition.x}
                      cy={cityPosition.y}
                      r="15"
                      fill="white"
                    />

                    {/* CITY NODE */}

                    <circle
                      cx={cityPosition.x}
                      cy={cityPosition.y}
                      r="10"
                      fill={
                        isStart
                          ? "#22c55e"
                          : isGoal
                          ? "#ef4444"
                          : "#facc15"
                      }
                    />

                    {/* CITY NAME */}

                    <text
                      x={
                        cityPosition.x + 20
                      }
                      y={
                        cityPosition.y + 5
                      }
                      fontSize="16"
                      fontWeight="700"
                      fill="white"
                      style={{
                        paintOrder:
                          "stroke",
                        stroke:
                          "#263238",
                        strokeWidth: 4,
                        strokeLinecap:
                          "round",
                        strokeLinejoin:
                          "round",
                      }}
                    >
                      {city}
                    </text>
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
          left: "18px",
          top: "50%",
          transform:
            "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow:
            "0 6px 15px rgba(0,0,0,0.25)",
          zIndex: 10,
        }}
      >
        <button
          type="button"
          onClick={zoomIn}
          style={{
            width: "48px",
            height: "48px",
            border: "none",
            background:
              "rgba(190,215,235,0.95)",
            color: "white",
            fontSize: "28px",
            cursor: "pointer",
          }}
        >
          +
        </button>

        <button
          type="button"
          onClick={resetMap}
          style={{
            width: "48px",
            height: "30px",
            border: "none",
            background:
              "rgba(170,200,225,0.95)",
            color: "white",
            fontSize: "10px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          type="button"
          onClick={zoomOut}
          style={{
            width: "48px",
            height: "48px",
            border: "none",
            background:
              "rgba(190,215,235,0.95)",
            color: "white",
            fontSize: "28px",
            cursor: "pointer",
          }}
        >
          −
        </button>
      </div>
    </div>
  );
}