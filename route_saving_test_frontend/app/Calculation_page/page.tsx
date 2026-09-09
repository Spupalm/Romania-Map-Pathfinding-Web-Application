"use client";

import { useState } from "react";

import Sidebar from "../../components/Sidebar";
import Searcher from "../../components/Searchbar";
import AlgorithmSelector from "../../components/AlgorithmSelector";
import SmallMap from "../../components/SmallMap";

import {
  CITY_NAMES,
  type CityName,
} from "../../components/Map";
/* ============================================================
   ALGORITHMS
   ============================================================ */

const ALGORITHMS = [
  "Depth First",
  "Breadth First",
  "Greedy Best-First",
  "A* Search",
  "Hub and Spoke",
];

/* ============================================================
   PAGE
   ============================================================ */

export default function HistoryPage() {
  /* ==========================================================
     CITY STATE
     ========================================================== */

  const [startCity, setStartCity] =
    useState<CityName>("Arad");

  const [goalCity, setGoalCity] =
    useState<CityName>("Bucharest");

  /* ==========================================================
     ALGORITHM
     ========================================================== */

  const [selectedAlgorithm, setSelectedAlgorithm] =
    useState("Depth First");

  /* ==========================================================
     PATH
     ========================================================== */

  const [path, setPath] =
    useState<CityName[]>([
      "Arad",
      "Sibiu",
      "Rimnicu Vilcea",
      "Pitesti",
      "Bucharest",
    ]);

  /* ==========================================================
     CITY SELECT
     ========================================================== */

  function handleStartCityChange(
    city: CityName
  ) {
    setStartCity(city);
  }

  function handleGoalCityChange(
    city: CityName
  ) {
    setGoalCity(city);
  }

  /* ==========================================================
     SEARCH
     ========================================================== */

  function handleSearch() {
    console.log(
      "Search:",
      startCity,
      "→",
      goalCity,
      selectedAlgorithm
    );

    /*
     * For now we keep the sample path.
     *
     * Later this can call your Python
     * pathfinding backend.
     */
  }

  /* ==========================================================
     RESET
     ========================================================== */

  function handleReset() {
    setStartCity("Arad");
    setGoalCity("Bucharest");

    setSelectedAlgorithm(
      ""
    );

    setPath([
      
    ]);
  }

  /* ==========================================================
     SEARCHBAR CITY SELECT
     ========================================================== */

  function handleSearchCity(
    city: CityName
  ) {
    console.log(
      "Searchbar selected:",
      city
    );

    setStartCity(city);
  }

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#4d86b2",
        display: "flex",
      }}
    >
      {/* ====================================================
          SIDEBAR
          ==================================================== */}

      <Sidebar />

      {/* ====================================================
          RIGHT SIDE
          ==================================================== */}

      <section
        style={{
          flex: 1,
          minWidth: 0,
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        {/* ==================================================
            SEARCH BAR
            ================================================== */}

        <Searcher
          cityNames={CITY_NAMES}
          onCitySelect={(city) =>
            handleSearchCity(
              city as CityName
            )
          }
        />

        {/* ==================================================
            MAIN CONTENT
            ================================================== */}

        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "20px",
            alignItems: "stretch",
            width: "100%",
          }}
        >
          {/* ================================================
              ALGORITHM SELECTOR
              ================================================ */}

          <div
            style={{
              flex: "0 0 620px",
              maxWidth: "620px",
            }}
          >
            <AlgorithmSelector
              startCity={startCity}
              goalCity={goalCity}
              selectedAlgorithm={
                selectedAlgorithm
              }
              cityNames={CITY_NAMES}
              algorithms={ALGORITHMS}
              onStartCityChange={
                handleStartCityChange
              }
              onGoalCityChange={
                handleGoalCityChange
              }
              onAlgorithmChange={
                setSelectedAlgorithm
              }
              onSearch={
                handleSearch
              }
              onReset={
                handleReset
              }
            />
          </div>

          {/* ================================================
              SMALL MAP
              ================================================ */}

          <div
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <SmallMap
              startCity={startCity}
              goalCity={goalCity}
              path={path}
            />
          </div>
        </div>
      </section>
    </main>
  );
}