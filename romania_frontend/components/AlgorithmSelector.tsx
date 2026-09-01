"use client";

import React from "react";
import type { CityName } from "./Map";
import { Jaro, Jersey_25 } from "next/font/google";
import { CITY_NAMES } from "./Map";

const jersey25 = Jersey_25({
  subsets: ["latin"],
  weight: "400",
});

const jaro = Jaro({
  subsets: ["latin"],
  weight: "400",
});

/* ============================================================
   DEFAULT ALGORITHMS
   ============================================================ */

const DEFAULT_ALGORITHMS = [
  "Depth First",
  "Breadth First",
  "Greedy Best-First",
  "A* Search",
  "Hub and Spoke",
];

/* ============================================================
   PROPS
   ============================================================ */

interface MapControlsProps {
  startCity?: CityName;
  goalCity?: CityName;
  selectedAlgorithm?: string;

  cityNames?: CityName[];
  algorithms?: string[];

  onStartCityChange?: (city: CityName) => void;
  onGoalCityChange?: (city: CityName) => void;
  onAlgorithmChange?: (algorithm: string) => void;

  onFocusCity?: (city: CityName) => void;

  onSearch?: () => void;
  onReset?: () => void;

  /*
   * normal:
   * Used on History / Calculation / Compare pages.
   *
   * popup:
   * Used on Main Page.
   */
  position?: "normal" | "popup";
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function AlgorithmSelector({
  startCity = "Arad",
  goalCity = "Bucharest",
  selectedAlgorithm = "Depth First",

  cityNames = CITY_NAMES,
  algorithms = DEFAULT_ALGORITHMS,

  onStartCityChange,
  onGoalCityChange,
  onAlgorithmChange,

  onFocusCity,

  onSearch,
  onReset,

  position = "normal",
}: MapControlsProps) {
  /* ==========================================================
     CONTAINER STYLE
     ========================================================== */

  const containerStyle: React.CSSProperties =
    position === "popup"
      ? {
          position: "absolute",

          top: "110px",
          right: "24px",

          width:
            "min(620px, calc(100% - 48px))",

          padding: "24px 28px",

          borderRadius: "28px",

          background:
            "rgba(76, 119, 143, 0.94)",

          boxShadow:
            "0 10px 30px rgba(0,0,0,0.25)",

          backdropFilter: "blur(8px)",

          color: "white",

          boxSizing: "border-box",

          zIndex: 20,
        }
      : {
          /*
           * NORMAL MODE
           *
           * The parent page controls where this
           * component is positioned.
           */

          position: "relative",

          width: "100%",

          maxWidth: "620px",

          padding: "24px 28px",

          borderRadius: "28px",

          background:
            "rgba(76, 119, 143, 0.94)",

          boxShadow:
            "0 10px 30px rgba(0,0,0,0.25)",

          backdropFilter: "blur(8px)",

          color: "white",

          boxSizing: "border-box",

          zIndex: 20,
        };

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div style={containerStyle}>

      {/* ======================================================
          MAIN CONTENT
          ====================================================== */}

      <div
        style={{
          display: "flex",

          gap: "18px 14px",

          alignItems: "flex-start",
        }}
      >

        {/* ====================================================
            LEFT COLUMN
            ==================================================== */}

        <div
          style={{
            flex: 1,

            display: "flex",

            flexDirection: "column",

            gap: "18px",

            minWidth: 0,
          }}
        >

          {/* ==================================================
              START CITY
              ================================================== */}

          <div>
            <div
              className={jersey25.className}
              style={labelStyle}
            >
              START
            </div>

            <div style={rowStyle}>

              <select
                value={startCity}
                onChange={(e) => {
                  const city =
                    e.target.value as CityName;

                  onStartCityChange?.(city);
                }}
                className={jersey25.className}
                style={selectStyle}
              >
                {cityNames.map((city) => (
                  <option
                    key={city}
                    value={city}
                    style={{
                      color: "#333",
                    }}
                  >
                    {city}
                  </option>
                ))}
              </select>

              {/* FOCUS START CITY */}

              <button
                type="button"
                onClick={() => {
                  onFocusCity?.(startCity);
                }}
                style={iconButtonStyle}
                aria-label="Focus start city"
              >
                <img
                  src="/icons/Search.png"
                  alt="Search"
                  width={20}
                  height={20}
                />
              </button>

            </div>
          </div>

          {/* ==================================================
              END CITY
              ================================================== */}

          <div>
            <div
              className={jersey25.className}
              style={labelStyle}
            >
              END
            </div>

            <div style={rowStyle}>

              <select
                value={goalCity}
                onChange={(e) => {
                  const city =
                    e.target.value as CityName;

                  onGoalCityChange?.(city);
                }}
                className={jersey25.className}
                style={selectStyle}
              >
                {cityNames.map((city) => (
                  <option
                    key={city}
                    value={city}
                    style={{
                      color: "#333",
                    }}
                  >
                    {city}
                  </option>
                ))}
              </select>

              {/* FOCUS END CITY */}

              <button
                type="button"
                onClick={() => {
                  onFocusCity?.(goalCity);
                }}
                style={iconButtonStyle}
                aria-label="Focus end city"
              >
                <img
                  src="/icons/Search.png"
                  alt="Search"
                  width={20}
                  height={20}
                />
              </button>

            </div>
          </div>

        </div>

        {/* ====================================================
            RIGHT COLUMN
            ==================================================== */}

        <div
          style={{
            flex: 1,

            minWidth: 0,
          }}
        >

          {/* ==================================================
              ALGORITHM
              ================================================== */}

          <div
            className={jersey25.className}
            style={labelStyle}
          >
            ALGORITHM
          </div>

          <div style={rowStyle}>

            <select
              value={selectedAlgorithm}
              onChange={(e) => {
                onAlgorithmChange?.(
                  e.target.value
                );
              }}
              className={jersey25.className}
              style={selectStyle}
            >
              {algorithms.map(
                (algorithm) => (
                  <option
                    key={algorithm}
                    value={algorithm}
                    style={{
                      color: "#333",
                    }}
                  >
                    {algorithm}
                  </option>
                )
              )}
            </select>

          </div>

          {/* ==================================================
              BUTTONS
              ================================================== */}

          <div style={actionRowStyle}>

            {/* SEARCH */}

            <button
              type="button"
              onClick={() => {
                onSearch?.();
              }}
              className={jersey25.className}
              style={searchButtonStyle}
            >
              Search
            </button>

            {/* RESET */}

            <button
              type="button"
              onClick={() => {
                onReset?.();
              }}
              className={jersey25.className}
              style={resetButtonStyle}
            >
              Reset
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

/* ============================================================
   LABEL
   ============================================================ */

const labelStyle: React.CSSProperties = {
  fontSize: "24px",

  fontWeight: 800,

  marginBottom: "8px",

  letterSpacing: "0.5px",
};

/* ============================================================
   SELECT ROW
   ============================================================ */

const rowStyle: React.CSSProperties = {
  display: "flex",

  alignItems: "center",

  gap: "0px",

  width: "100%",
};

/* ============================================================
   ACTION BUTTON ROW
   ============================================================ */

const actionRowStyle: React.CSSProperties = {
  display: "flex",

  alignItems: "center",

  gap: "10px",

  marginTop: "50px",

  width: "100%",
};

/* ============================================================
   SEARCH BUTTON
   ============================================================ */

const searchButtonStyle: React.CSSProperties = {
  flex: 1,

  height: "42px",

  borderRadius: "22px",

  border: "none",

  outline: "none",

  background: "#ffffff",

  color: "#4d85b1",

  fontSize: "20px",

  fontWeight: 700,

  cursor: "pointer",
};

/* ============================================================
   RESET BUTTON
   ============================================================ */

const resetButtonStyle: React.CSSProperties = {
  flex: 1,

  height: "42px",

  borderRadius: "22px",

  border:
    "1px solid rgba(255,255,255,0.6)",

  outline: "none",

  background: "transparent",

  color: "white",

  fontSize: "20px",

  fontWeight: 700,

  cursor: "pointer",
};

/* ============================================================
   SELECT
   ============================================================ */

const selectStyle: React.CSSProperties = {
  flex: 1,

  minWidth: 0,

  height: "42px",

  padding: "0 30px",

  borderRadius: "22px",

  border: "none",

  outline: "none",

  background:
    "rgba(255,255,255,0.25)",

  color: "white",

  fontSize: "24px",

  fontWeight: 700,

  cursor: "pointer",

  boxSizing: "border-box",
};

/* ============================================================
   SEARCH / FOCUS ICON
   ============================================================ */

const iconButtonStyle: React.CSSProperties = {
  width: "42px",

  height: "42px",

  flexShrink: 0,

  borderRadius: "50%",

  border: "none",

  background: "transparent",

  cursor: "pointer",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  padding: 0,
};