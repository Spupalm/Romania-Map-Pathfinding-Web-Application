import { redirect } from "next/navigation";
import HistoryClient from "../../components/HistoryClient";
import { isSupabaseConfigured } from "../../lib/supabase/config";
import { createClient } from "../../lib/supabase/server";

export default async function HistoryPage() {
  if (!isSupabaseConfigured) {
    return (
      <main style={{ minHeight: "100vh", padding: "40px", background: "#4d86b2" }}>
        <p style={{ color: "white", fontWeight: 700 }}>
          Configure Supabase environment variables to use route history.
        </p>
      </main>
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || typeof data?.claims?.sub !== "string") {
    redirect("/auth?next=/History_page");
  }

  return <HistoryClient />;
}

