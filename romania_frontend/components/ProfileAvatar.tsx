"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProfileAvatar() {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState("ผู้ใช้");
    const [imageFailed, setImageFailed] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        let active = true;
        let authChanged = false;

        function updateProfile(
            metadata?: Record<string, unknown>
        ) {
            if (!active) return;

            const picture =
                metadata?.avatar_url || metadata?.picture;
            const name =
                metadata?.full_name || metadata?.name;

            setAvatarUrl(
                typeof picture === "string" ? picture : null
            );
            setDisplayName(
                typeof name === "string" ? name : "ผู้ใช้"
            );
            setImageFailed(false);
        }

        const { data: { subscription } } =
            supabase.auth.onAuthStateChange((_event, session) => {
                authChanged = true;
                updateProfile(session?.user.user_metadata);
            });

        supabase.auth.getUser().then(({ data, error }) => {
            if (!active || authChanged) return;
            updateProfile(
                error ? undefined : data.user?.user_metadata
            );
        }).catch(() => {
            if (active && !authChanged) updateProfile();
        });

        return () => {
            active = false;
            subscription.unsubscribe();
        };
    }, []);

    return (
        <span
            title={displayName}
            style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                overflow: "hidden",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                background: "#fff",
                color: "#523477",
                verticalAlign: "middle",
            }}
        >
            {avatarUrl && !imageFailed ? (
                <img
                    src={avatarUrl}
                    alt={`รูปโปรไฟล์ ${displayName}`}
                    referrerPolicy="no-referrer"
                    onError={() => setImageFailed(true)}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                />
            ) : (
                <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    role="img"
                    aria-label="โปรไฟล์ผู้ใช้"
                >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 22v-2a8 8 0 0 1 16 0v2H4Z" />
                </svg>
            )}
        </span>
    );
}