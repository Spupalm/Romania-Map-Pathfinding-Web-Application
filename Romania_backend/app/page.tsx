// app/page.tsx
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import RenderMap from "@/components/render-map";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-gray-50/50">
      <div className="flex-1 w-full flex flex-col gap-10 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-white shadow-sm">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold text-lg text-blue-600">
              <Link href={"/"}>Romania Pathfinding Visualizer</Link>
            </div>
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </nav>

        <div className="w-full max-w-5xl p-5 flex flex-col gap-5">
          {/* Header Section พร้อม Color Legend ในพื้นที่วงกลมขวา */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-gray-800">
                Custom Heuristic & Pathfinding Simulation
              </h1>
              <p className="text-sm text-gray-500">
                ทดสอบและเปรียบเทียบการทำงานระหว่าง Custom Hub-and-Spoke Search และ Algorithms มาตรฐาน
              </p>
            </div>

            {/* Color Legend Bar ที่วางไว้ตำแหน่งขวาบน */}
            <div className="flex flex-wrap items-center gap-3 p-2 px-3 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 shadow-sm shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-blue-600 border border-blue-900 rounded-sm"></span>
                <span>Start</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-rose-600 border border-rose-900 rounded-sm"></span>
                <span>Goal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-emerald-500 border border-emerald-700 rounded-sm"></span>
                <span>Path</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-amber-400 border border-amber-600 rounded-sm"></span>
                <span>Explored</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-gray-400 border border-gray-800 rounded-sm"></span>
                <span>Unvisited</span>
              </div>
            </div>
          </div>

          {/* แผนที่และระบบค้นหา */}
          <RenderMap />
        </div>
      </div>
    </main>
  );
}