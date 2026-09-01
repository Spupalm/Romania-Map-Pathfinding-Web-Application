"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar";
import Map, {
  CITY_NAMES,
  type CityName,
} from "../../components/Map";
import AlgorithmSelector from "../../components/AlgorithmSelector";

/* ============================================================
   ALGORITHMS
   ============================================================ */

const ALGORITHMS = [
  { id: "dfs", label: "Depth First" },
  { id: "bfs", label: "Breadth First" },
  { id: "greedy", label: "Greedy Best-First" },
  { id: "astar", label: "A* Search" },
  { id: "hub_and_spoke", label: "Hub and Spoke" },
];

const ALGORITHM_LABELS = ALGORITHMS.map(
  (algorithm) => algorithm.label
);

/* ============================================================
   MAIN PAGE
   ============================================================ */

export default function MainPage() {
  /* ==========================================================
     ALGORITHM
     ========================================================== */

  const [algoId, setAlgoId] = useState("dfs");

  /* ==========================================================
     SEARCH
     ========================================================== */

  const [query, setQuery] = useState("");

  /* ==========================================================
     ALGORITHM SELECTOR
     ========================================================== */

  const [showAlgorithmSelector, setShowAlgorithmSelector] =
    useState(false);

  /* ==========================================================
     START / GOAL
     ========================================================== */

  const [startCity, setStartCity] =
    useState<CityName>("Arad");

  const [goalCity, setGoalCity] =
    useState<CityName>("Bucharest");

  /* ==========================================================
     YELLOW PATH

     Keep this path so the yellow route remains visible.
     ========================================================== */

  const [path, setPath] = useState<CityName[]>([
    "Arad",
    "Sibiu",
    "Rimnicu Vilcea",
    "Pitesti",
    "Bucharest",
  ]);

  /* ==========================================================
     CURRENT ALGORITHM LABEL
     ========================================================== */

  const algorithmLabel =
    ALGORITHMS.find(
      (algorithm) => algorithm.id === algoId
    )?.label ?? "Depth First";

  /* ==========================================================
     ALGORITHM CHANGE
     ========================================================== */

  function handleAlgorithmChange(label: string) {
    const selectedAlgorithm = ALGORITHMS.find(
      (algorithm) => algorithm.label === label
    );

    if (!selectedAlgorithm) {
      return;
    }

    setAlgoId(selectedAlgorithm.id);
  }

  /* ==========================================================
     CITY SEARCH
     ========================================================== */

  function findCity(searchText: string): CityName | null {
    const text = searchText.trim().toLowerCase();

    if (!text) {
      return null;
    }

    /* Exact match first */

    const exactCity = CITY_NAMES.find(
      (city) =>
        city.toLowerCase() === text
    );

    if (exactCity) {
      return exactCity;
    }

    /* Partial match */

    const partialCity = CITY_NAMES.find(
      (city) =>
        city.toLowerCase().includes(text)
    );

    return partialCity ?? null;
  }

  /* ==========================================================
     CITY SELECTED FROM SEARCH SUGGESTIONS
     ========================================================== */

  function handleCitySelect(city: string) {
    const selectedCity = city as CityName;

    if (!CITY_NAMES.includes(selectedCity)) {
      return;
    }

    /*
     * Move the selected city to START.
     */

    setStartCity(selectedCity);

    /*
     * Keep the yellow path.
     */

    console.log(
      "Selected city:",
      selectedCity
    );
  }

  /* ==========================================================
     SEARCH SUBMIT
     ========================================================== */

  function handleSearchSubmit() {
    const foundCity = findCity(query);

    if (!foundCity) {
      console.log(
        "City not found:",
        query
      );
      return;
    }

    /*
     * Set the searched city as START.
     */

    setStartCity(foundCity);

    /*
     * Keep yellow path visible.
     */

    console.log(
      "Searching for:",
      foundCity
    );
  }

  /* ==========================================================
     FOCUS CITY
     ========================================================== */

  function handleFocusCity(city: CityName) {
    if (!CITY_NAMES.includes(city)) {
      return;
    }

    /*
     * Set selected city as START.
     */

    setStartCity(city);

    /*
     * Keep yellow path.
     */

    console.log(
      "Focus city:",
      city
    );
  }

  /* ==========================================================
     MAP START CITY CHANGE
     ========================================================== */

  function handleStartCityChange(
    city: CityName
  ) {
    setStartCity(city);
  }

  /* ==========================================================
     MAP GOAL CITY CHANGE
     ========================================================== */

  function handleGoalCityChange(
    city: CityName
  ) {
    setGoalCity(city);
  }

  /* ==========================================================
     RESET
     ========================================================== */

  function handleReset() {
    setStartCity("Arad");

    setGoalCity("Bucharest");

    /*
     * Restore yellow path.
     */

    setPath([
      "Arad",
      "Sibiu",
      "Rimnicu Vilcea",
      "Pitesti",
      "Bucharest",
    ]);

    setQuery("");

    setAlgoId("dfs");
  }

  /* ============================================================
     PAGE
     ============================================================ */

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#4d86b2",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ======================================================
          NAVBAR
          ====================================================== */}

      <Navbar
        algorithmLabel={algorithmLabel}
        cityNames={CITY_NAMES}

        /* Search text */

        onSearchChange={(value) => {
          setQuery(value);
        }}

        /* City selected from dropdown */

        onCitySelect={handleCitySelect}

        /* Enter / search button */

        onSearchSubmit={handleSearchSubmit}

        /*
         * Clicking the search bar opens
         * Algorithm Selector.
         */

        onSearchBarClick={() => {
          setShowAlgorithmSelector(
            (open) => !open
          );
        }}
      />

      {/* ======================================================
          ALGORITHM SELECTOR
          ====================================================== */}

      {showAlgorithmSelector && (
        <>
          {/* ==================================================
              BACKDROP
              ================================================== */}

          <div
            onClick={() =>
              setShowAlgorithmSelector(false)
            }
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 10,
              background: "transparent",
            }}
          />

          {/* ==================================================
              SELECTOR CONTAINER

              IMPORTANT:
              It is positioned BELOW the Navbar.
              ================================================== */}

            <div
              style={{
              position: "absolute",
              top: "100px",
              right: "40px",
              width: "620px",
              zIndex: 20,
              }}
            
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <AlgorithmSelector
              startCity={startCity}
              goalCity={goalCity}
              selectedAlgorithm={
                algorithmLabel
              }
              cityNames={CITY_NAMES}
              algorithms={
                ALGORITHM_LABELS
              }

              /* Start */

              onStartCityChange={
                handleStartCityChange
              }

              /* End */

              onGoalCityChange={
                handleGoalCityChange
              }

              /* Algorithm */

              onAlgorithmChange={
                handleAlgorithmChange
              }

              /* Focus city */

              onFocusCity={
                handleFocusCity
              }

              /* Search */

              onSearch={() => {
                handleSearchSubmit();

                setShowAlgorithmSelector(
                  false
                );
              }}

              /* Reset */

              onReset={handleReset}
            />
          </div>
        </>
      )}

      {/* ======================================================
          MAP
          ====================================================== */}

      <section
        style={{
          width: "100%",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <Map
          /* Start */

          startCity={startCity}

          /* Goal */

          goalCity={goalCity}

          /*
           * IMPORTANT:
           * Keep the yellow path.
           */

          path={path}

          /* Distances */

          showDistances={true}

          /* City names */

          showCityNames={true}

          /* Map -> Main Page */

          onStartCityChange={
            handleStartCityChange
          }

          onGoalCityChange={
            handleGoalCityChange
          }
        />
      </section>
    </main>
  );
}