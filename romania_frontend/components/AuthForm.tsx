"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { isSupabaseConfigured } from "../lib/supabase/config";

interface AuthFormProps {
  nextPath: string;
}

export default function AuthForm({ nextPath }: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!isSupabaseConfigured) {
      setMessage("Supabase environment variables are not configured.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(nextPath);
        router.refresh();
      } else {
        const redirectTo = new URL("/auth/confirm", window.location.origin);
        redirectTo.searchParams.set("next", nextPath);
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo.toString() },
        });
        if (error) throw error;
        setMessage("Check your email to confirm your account.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        width: "min(440px, calc(100% - 32px))",
        padding: "30px",
        borderRadius: "24px",
        background: "rgba(255,255,255,0.96)",
        color: "#405777",
        boxShadow: "0 15px 45px rgba(0,0,0,0.2)",
      }}
    >
      <h1 style={{ marginTop: 0 }}>
        {mode === "sign-in" ? "Sign in" : "Create account"}
      </h1>
      <p>Sign in to save and reload your pathfinding routes.</p>

      <form onSubmit={submit} style={{ display: "grid", gap: "14px" }}>
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={inputStyle}
          />
        </label>
        <button type="submit" disabled={loading} style={primaryButtonStyle}>
          {loading
            ? "Please wait..."
            : mode === "sign-in"
              ? "Sign in"
              : "Sign up"}
        </button>
      </form>

      {message && <p role="status">{message}</p>}

      <button
        type="button"
        onClick={() => {
          setMode((current) => (current === "sign-in" ? "sign-up" : "sign-in"));
          setMessage("");
        }}
        style={secondaryButtonStyle}
      >
        {mode === "sign-in"
          ? "Need an account? Sign up"
          : "Already have an account? Sign in"}
      </button>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  marginTop: "6px",
  padding: "11px 13px",
  border: "1px solid #b8c7d9",
  borderRadius: "10px",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "12px",
  border: "none",
  borderRadius: "10px",
  background: "#405777",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "12px",
  border: "none",
  background: "transparent",
  color: "#405777",
  textDecoration: "underline",
  cursor: "pointer",
};

