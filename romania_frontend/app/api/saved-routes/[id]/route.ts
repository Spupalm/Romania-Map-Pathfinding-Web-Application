import { NextResponse } from "next/server";
import { BACKEND_ID } from "../../../../lib/pathfinding";
import { isSupabaseConfigured } from "../../../../lib/supabase/config";
import { createClient } from "../../../../lib/supabase/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string") {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id } = await context.params;
  const { data, error } = await supabase
    .from("saved_routes")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .eq("backend_id", BACKEND_ID)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Saved route not found." }, { status: 404 });
  }

  return NextResponse.json({ route: data });
}

