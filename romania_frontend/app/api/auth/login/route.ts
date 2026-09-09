import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        // Check required fields
        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password are required." },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Find the email associated with the username
        const { data: email, error: lookupError } =
            await supabase.rpc("get_email_by_username", {
                input_username: username,
            });

        if (lookupError || !email) {
            return NextResponse.json(
                { error: "Invalid username or password." },
                { status: 401 }
            );
        }

        // Login using Supabase Auth
        const { error: loginError } =
            await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

        if (loginError) {
            return NextResponse.json(
                { error: "Invalid username or password." },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Login successful.",
        });

    } catch (error) {
        console.error("Login error:", error);

        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}