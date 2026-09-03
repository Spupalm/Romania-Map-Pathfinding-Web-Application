"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Map from "../../components/Map";
import AlgorithmSelector from "../../components/AlgorithmSelector";
import {
  ALGORITHMS,
  CITY_NAMES,
  algorithmFromId,
  algorithmFromRunMode,
  type AlgorithmId,
  type CityName,
  type SavedRoute,
  type SearchResponse,
  type WorkflowStep,
} from "../../lib/pathfinding";
import { createClient } from "../../lib/supabase/client";
import { isSupabaseConfigured } from "../../lib/supabase/config";

const ALGORITHM_LABELS = ALGORITHMS.map((algorithm) => algorithm.label);

export default function MainPage() {
  const router = useRouter();
  const [algoId, setAlgoId] = useState<AlgorithmId>("dfs");
  const [query, setQuery] = useState("");
  const [showAlgorithmSelector, setShowAlgorithmSelector] = useState(false);
  const [startCity, setStartCity] = useState<CityName>("Arad");
  const [goalCity, setGoalCity] = useState<CityName>("Bucharest");
  const [path, setPath] = useState<CityName[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [pathCostKm, setPathCostKm] = useState<number | null>(null);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [peakMemoryKb, setPeakMemoryKb] = useState<number | null>(null);
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedAlgorithm = algorithmFromId(algoId);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (active) setCurrentUserId(data.user?.id ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserId(session?.user.id ?? null);
      if (!session?.user) setSaveEnabled(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const savedRouteId = new URLSearchParams(window.location.search).get(
      "savedRoute",
    );
    if (!savedRouteId) return;

    let active = true;

    async function loadSavedRoute() {
      try {
        const response = await fetch(
          `/api/saved-routes/${encodeURIComponent(savedRouteId!)}`,
        );
        const data = (await response.json()) as {
          route?: SavedRoute;
          error?: string;
        };

        if (!response.ok || !data.route) {
          throw new Error(data.error ?? "Could not load the saved route.");
        }
        if (!active) return;

        const route = data.route;
        setStartCity(route.start_city);
        setGoalCity(route.goal_city);
        setAlgoId(algorithmFromRunMode(route.run_mode).id);
        setPath(route.route_path);
        setWorkflowSteps(route.workflow_steps);
        setPathCostKm(route.path_cost_km);
        setExecutionTimeMs(route.execution_time_ms);
        setPeakMemoryKb(route.peak_memory_kb);
        setSaveEnabled(false);
        setNotice("Saved route loaded. Press Run to execute it again.");
        setError("");
      } catch (loadError) {
        if (!active) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load the saved route.",
        );
      }
    }

    void loadSavedRoute();
    return () => {
      active = false;
    };
  }, []);

  function clearResult() {
    setPath([]);
    setWorkflowSteps([]);
    setPathCostKm(null);
    setExecutionTimeMs(null);
    setPeakMemoryKb(null);
    setNotice("");
  }

  function findCity(searchText: string): CityName | null {
    const text = searchText.trim().toLowerCase();
    if (!text) return null;

    return (
      CITY_NAMES.find((city) => city.toLowerCase() === text) ??
      CITY_NAMES.find((city) => city.toLowerCase().includes(text)) ??
      null
    );
  }

  function handleCitySelect(city: string) {
    if (!CITY_NAMES.includes(city as CityName)) return;
    setStartCity(city as CityName);
    clearResult();
  }

  function handleSearchSubmit() {
    const foundCity = findCity(query);
    if (!foundCity) {
      setError("City not found.");
      return;
    }
    setStartCity(foundCity);
    clearResult();
    setError("");
  }

  function handleAlgorithmChange(label: string) {
    const algorithm = ALGORITHMS.find((item) => item.label === label);
    if (!algorithm) return;
    setAlgoId(algorithm.id);
    clearResult();
  }

  function handleReset() {
    setStartCity("Arad");
    setGoalCity("Bucharest");
    setAlgoId("dfs");
    setQuery("");
    setSaveEnabled(false);
    setError("");
    clearResult();
  }

  async function handleRun() {
    if (startCity === goalCity) {
      setError("Start and End cities cannot be the same.");
      return;
    }

    setRunning(true);
    setError("");
    setNotice("");
    clearResult();

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
      const response = await fetch(`${apiUrl}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: startCity,
          goal: goalCity,
          algorithm: selectedAlgorithm.runMode,
        }),
      });
      const result = (await response.json()) as SearchResponse;

      if (!response.ok || result.error) {
        throw new Error(result.error ?? `Server returned ${response.status}`);
      }

      const resultPath = Array.isArray(result.path) ? result.path : [];
      const resultSteps = Array.isArray(result.steps_log) ? result.steps_log : [];
      const resultExecutionTime = Number(result.execution_time_ms ?? 0);
      const resultPeakMemory = Number(result.peak_memory_kb ?? 0);

      setPath(resultPath);
      setWorkflowSteps(resultSteps);
      setPathCostKm(result.cost);
      setExecutionTimeMs(resultExecutionTime);
      setPeakMemoryKb(resultPeakMemory);

      if (saveEnabled && currentUserId && resultPath.length > 0) {
        try {
          const saveResponse = await fetch("/api/saved-routes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              start_city: startCity,
              goal_city: goalCity,
              route_path: resultPath,
              workflow_steps: resultSteps,
              run_mode: selectedAlgorithm.runMode,
              path_cost_km: result.cost,
              execution_time_ms: resultExecutionTime,
              peak_memory_kb: resultPeakMemory,
            }),
          });
          const saveResult = (await saveResponse.json()) as { error?: string };
          if (!saveResponse.ok) {
            throw new Error(saveResult.error ?? "Could not save the route.");
          }
          setNotice("Route saved successfully.");
        } catch (saveError) {
          setNotice(
            `Run completed, but saving failed: ${
              saveError instanceof Error ? saveError.message : "Unknown error"
            }`,
          );
        }
      }
    } catch (runError) {
      setError(
        runError instanceof Error
          ? runError.message
          : "Could not connect to the pathfinding server.",
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#4d86b2",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Navbar
        algorithmLabel={selectedAlgorithm.label}
        cityNames={[...CITY_NAMES]}
        onSearchChange={setQuery}
        onCitySelect={handleCitySelect}
        onSearchSubmit={handleSearchSubmit}
        onSearchBarClick={() => setShowAlgorithmSelector((open) => !open)}
      />

      {showAlgorithmSelector && (
        <>
          <div
            onClick={() => setShowAlgorithmSelector(false)}
            style={{ position: "fixed", inset: 0, zIndex: 10 }}
          />
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              position: "absolute",
              top: "100px",
              right: "40px",
              width: "min(620px, calc(100% - 80px))",
              zIndex: 20,
            }}
          >
            <AlgorithmSelector
              startCity={startCity}
              goalCity={goalCity}
              selectedAlgorithm={selectedAlgorithm.label}
              cityNames={[...CITY_NAMES]}
              algorithms={ALGORITHM_LABELS}
              onStartCityChange={(city) => {
                setStartCity(city);
                clearResult();
              }}
              onGoalCityChange={(city) => {
                setGoalCity(city);
                clearResult();
              }}
              onAlgorithmChange={handleAlgorithmChange}
              onFocusCity={(city) => {
                setStartCity(city);
                clearResult();
              }}
              onSearch={() => {
                void handleRun();
                setShowAlgorithmSelector(false);
              }}
              onReset={handleReset}
              showSaveControl
              saveEnabled={saveEnabled}
              canSave={Boolean(currentUserId && isSupabaseConfigured)}
              isRunning={running}
              onSaveEnabledChange={setSaveEnabled}
              onSignIn={() => router.push("/auth")}
            />
          </div>
        </>
      )}

      {(error || notice) && (
        <div
          role="status"
          style={{
            margin: "12px 20px 0",
            padding: "12px 16px",
            borderRadius: "12px",
            background: error ? "#9f2f2f" : "#285f4a",
            color: "white",
            fontWeight: 700,
          }}
        >
          {error || notice}
        </div>
      )}

      <section style={{ width: "100%", padding: "20px", boxSizing: "border-box" }}>
        <Map
          startCity={startCity}
          goalCity={goalCity}
          path={path}
          pathCostKm={pathCostKm}
          executionTimeMs={executionTimeMs}
          peakMemoryKb={peakMemoryKb}
          workflowSteps={workflowSteps}
          showDistances
          showCityNames
          onStartCityChange={setStartCity}
          onGoalCityChange={setGoalCity}
          onRouteChange={clearResult}
        />
      </section>
    </main>
  );
}

