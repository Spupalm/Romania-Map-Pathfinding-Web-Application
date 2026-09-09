import { NextResponse } from "next/server";
import { BACKEND_ID, BACKEND_NAME } from "../../../lib/pathfinding";
import { parseSavedRouteInput } from "../../../lib/saved-routes";
import { isSupabaseConfigured } from "../../../lib/supabase/config";
import { createClient } from "../../../lib/supabase/server";

async function authenticatedUserId() {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  return error || typeof userId !== "string" ? null : { supabase, userId };
}

export async function GET() {
  const auth = await authenticatedUserId();
  if (!auth) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data, error } = await auth.supabase
    .from("saved_routes")
    .select(
      "id,user_id,backend_id,backend_name,start_city,goal_city,route_path,run_mode,path_cost_km,execution_time_ms,peak_memory_kb,saved_at",
    )
    .eq("user_id", auth.userId)
    .eq("backend_id", BACKEND_ID)
    .order("saved_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ routes: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await authenticatedUserId();
  if (!auth) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseSavedRouteInput(rawBody);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("saved_routes")
    .insert({
      ...parsed.data,
      user_id: auth.userId,
      backend_id: BACKEND_ID,
      backend_name: BACKEND_NAME,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ route: data }, { status: 201 });
}

