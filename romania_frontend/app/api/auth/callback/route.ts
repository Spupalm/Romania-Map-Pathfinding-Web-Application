import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!siteUrl) {
        return NextResponse.json(
            { error: "Missing NEXT_PUBLIC_SITE_URL." },
            { status: 500 }
        );
    }

    const params = new URL(request.url).searchParams;
    const code = params.get("code");

    if (code && !params.has("error")) {
        try {
            const supabase = await createClient();

            const { error } =
                await supabase.auth.exchangeCodeForSession(code);

            if (!error) {
                return NextResponse.redirect(
                    new URL("/main_page", siteUrl)
                );
            }

            console.error("Session exchange failed:", error);
        } catch (error) {
            console.error("Google callback failed:", error);
        }
    }

    return NextResponse.redirect(
        new URL("/login/index.html?error=google_login", siteUrl)
    );
}