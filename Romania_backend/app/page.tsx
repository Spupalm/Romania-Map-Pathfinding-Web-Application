import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import dynamic from "next/dynamic"; // 1. เพิ่มการ Import dynamic
import RenderMap from "@/components/render-map";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>Map Pathfinder</Link>
              <div className="flex items-center gap-2">

              </div>
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
          <h2 className="text-xl font-bold">Romania Map Network</h2>
          {/* 3. กำหนดความสูงให้ Container เพื่อให้แผนที่มีพื้นที่แสดงผล */}
          <div className="w-full h-[600px] border rounded-lg overflow-hidden relative">
            <RenderMap />
          </div>
        </div>

      </div>
    </main>
  );
}
