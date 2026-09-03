"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { algorithmFromRunMode, type SavedRoute } from "../lib/pathfinding";

type SavedRouteSummary = Omit<SavedRoute, "workflow_steps">;

export default function HistoryClient() {
  const router = useRouter();
  const [routes, setRoutes] = useState<SavedRouteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRoutes() {
      try {
        const response = await fetch("/api/saved-routes");
        const data = (await response.json()) as {
          routes?: SavedRouteSummary[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(data.error ?? "Could not load saved routes.");
        }
        if (active) setRoutes(data.routes ?? []);
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load saved routes.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadRoutes();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#4d86b2",
        display: "flex",
      }}
    >
      <Sidebar />

      <section
        style={{
          flex: 1,
          minWidth: 0,
          padding: "28px",
          color: "white",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ marginBottom: "6px", fontSize: "36px" }}>Saved Routes</h1>
            <p style={{ marginTop: 0 }}>
              Load a previous route configuration without running it again.
            </p>
          </div>
          <button type="button" onClick={() => router.push("/main_page")} style={newRunStyle}>
            New run
          </button>
        </div>

        {loading && <p>Loading saved routes...</p>}
        {error && <p role="alert">{error}</p>}
        {!loading && !error && routes.length === 0 && (
          <div style={emptyStyle}>
            No saved routes yet. Enable “Save this run” before running an algorithm.
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "18px",
            marginTop: "24px",
          }}
        >
          {routes.map((route) => (
            <article key={route.id} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                <strong style={{ fontSize: "20px" }}>
                  {route.start_city} → {route.goal_city}
                </strong>
                <time style={{ fontSize: "12px", color: "#687b93" }}>
                  {new Date(route.saved_at).toLocaleString()}
                </time>
              </div>

              <p style={{ color: "#405777", fontWeight: 700 }}>
                {algorithmFromRunMode(route.run_mode).label}
              </p>
              <p style={{ fontSize: "13px", lineHeight: 1.5 }}>
                {route.route_path.join(" → ")}
              </p>

              <dl style={metricsStyle}>
                <div>
                  <dt>Path cost</dt>
                  <dd>{route.path_cost_km} km</dd>
                </div>
                <div>
                  <dt>Execution</dt>
                  <dd>{route.execution_time_ms.toFixed(3)} ms</dd>
                </div>
                <div>
                  <dt>Peak memory</dt>
                  <dd>{route.peak_memory_kb.toFixed(2)} KiB</dd>
                </div>
              </dl>

              <div style={{ fontSize: "12px", color: "#687b93", marginBottom: "14px" }}>
                {route.backend_name} · {route.backend_id}
              </div>

              <button
                type="button"
                onClick={() => router.push(`/main_page?savedRoute=${route.id}`)}
                style={loadButtonStyle}
              >
                Load route
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  padding: "20px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.96)",
  color: "#26384f",
  boxShadow: "0 8px 24px rgba(0,0,0,0.16)",
};

const metricsStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "8px",
  margin: "16px 0",
};

const loadButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "none",
  borderRadius: "999px",
  background: "#405777",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const newRunStyle: React.CSSProperties = {
  alignSelf: "center",
  padding: "10px 18px",
  border: "none",
  borderRadius: "999px",
  background: "white",
  color: "#405777",
  fontWeight: 700,
  cursor: "pointer",
};

const emptyStyle: React.CSSProperties = {
  marginTop: "24px",
  padding: "28px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.18)",
};

