import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!siteUrl) {
        return NextResponse.json(
            { error: "Missing NEXT_PUBLIC_SITE_URL." },
            { status: 500 }
        );
    }

    const failureUrl = new URL(
        "/login/index.html?error=google_login",
        siteUrl
    );

    try {
        const supabase = await createClient();

        const { data, error } =
            await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: new URL(
                        "/api/auth/callback",
                        siteUrl
                    ).href,
                    queryParams: {
                        prompt: "select_account",
                    },
                },
            });

        if (error || !data.url) {
            console.error("Google sign-in failed:", error);
            return NextResponse.redirect(failureUrl);
        }

        return NextResponse.redirect(data.url);
    } catch (error) {
        console.error("Google sign-in failed:", error);
        return NextResponse.redirect(failureUrl);
    }
}