"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { isSupabaseConfigured } from "../lib/supabase/config";

export default function AuthControls() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (active) setEmail(data.user?.email ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    if (!isSupabaseConfigured) return;
    await createClient().auth.signOut();
    setEmail(null);
    router.push("/main_page");
    router.refresh();
  }

  if (!isSupabaseConfigured) {
    return (
      <span style={{ color: "white", fontSize: "13px" }}>
        Supabase not configured
      </span>
    );
  }

  if (!email) {
    return (
      <Link
        href="/auth"
        style={{
          color: "#405777",
          background: "#fbf7ee",
          borderRadius: "999px",
          padding: "8px 14px",
          fontWeight: 700,
          textDecoration: "none",
          whiteSpace: "nowrap",
        }}
      >
        Sign in
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={signOut}
      title={email}
      style={{
        color: "#405777",
        background: "#fbf7ee",
        border: "none",
        borderRadius: "999px",
        padding: "8px 14px",
        fontWeight: 700,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      Sign out
    </button>
  );
}

