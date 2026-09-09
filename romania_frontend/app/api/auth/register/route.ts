import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    try {
        const { username, email, password } = await request.json();

        // Check required fields
        if (!username || !email || !password) {
            return NextResponse.json(
                { error: "All fields are required." },
                { status: 400 }
            );
        }

        // Remove unnecessary spaces
        const cleanUsername = username.trim();
        const cleanEmail = email.trim();

        // Check username format
        if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
            return NextResponse.json(
                {
                    error:
                        "Username can only contain letters, numbers, and underscores.",
                },
                { status: 400 }
            );
        }

        // Check password length
        if (password.length < 6) {
            return NextResponse.json(
                {
                    error: "Password must be at least 6 characters.",
                },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Check whether username already exists
        const { data: existingEmail, error: lookupError } =
            await supabase.rpc("get_email_by_username", {
                input_username: cleanUsername,
            });

        if (lookupError) {
            console.error("Username lookup error:", lookupError);

            return NextResponse.json(
                { error: "Could not check username." },
                { status: 500 }
            );
        }

        if (existingEmail) {
            return NextResponse.json(
                { error: "Username is already taken." },
                { status: 409 }
            );
        }

        // Create Supabase Auth account
        const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password: password,
            options: {
                data: {
                    username: cleanUsername,
                },
            },
        });

        if (error) {
            console.error("Registration error:", error);

            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        if (!data.user) {
            return NextResponse.json(
                { error: "Could not create account." },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Account created successfully.",
        });

    } catch (error) {
        console.error("Register error:", error);

        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}