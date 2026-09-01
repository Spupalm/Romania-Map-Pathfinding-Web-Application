"use client";

import { useRouter, usePathname } from "next/navigation";
import { Jaro } from "next/font/google";
import { Jockey_One } from "next/font/google";

const jaro = Jaro({
  subsets: ["latin"],
  weight: "400",
});

const jockey_one = Jockey_One({
  subsets: ["latin"],
  weight: "400",
});

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Home",
      path: "/main_page",
    },
    {
      name: "History",
      path: "/History_page",
    },
    {
      name: "Calculation",
      path: "/Calculation_page",
    },
    {
      name: "Compare",
      path: "/Compare_page",
    },
  ];

  return (
    <aside
      style={{
        width: "201px",
        minWidth: "201px",
        height: "944px",
        margin: "20px 0 20px 14px",
        background: "#405777",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
        overflow: "hidden",
      }}
    >
      {/* ============================================================
          LOGO
          ============================================================ */}

      <div
        style={{
          width: "100%",
          padding: "20px 15px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          boxSizing: "border-box",
        }}
      >
        {/* Map Logo */}
        <img
          src="/icons/Map_icon.png"
          alt="Romanian Map"
          width={48}
          height={48}
          style={{
            flexShrink: 0,
          }}
        />

        {/* Romanian Map Text */}
        <span
          className={jaro.className}
          style={{
            color: "white",
            fontSize: "20px",
            fontWeight: 400,
            lineHeight: "20px",
            textAlign: "left",
          }}
        >
          Romanian
          <br />
          Map
        </span>
      </div>

      {/* ============================================================
          MENU
          ============================================================ */}

      <nav
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "44px",
          alignItems: "center",
          marginTop: "25px",
        }}
      >
        {menuItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <button
              key={item.name}
              onClick={() => router.push(item.path)}
              className={jockey_one.className}
              style={{
                width: "calc(100% - 8px)",
                minHeight: "38px",
                border: "none",
                borderRadius: "7px",
                background: isActive
                  ? "#718db7"
                  : "transparent",
                color: "white",
                fontSize: "30px",
                fontWeight: isActive ? 700 : 500,
                cursor: "pointer",
                padding: "4px 8px",
              }}
            >
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* ============================================================
          LOGOUT
          ============================================================ */}

      <button
        onClick={() => {
          console.log("Logout");
        }}
        style={{
          marginTop: "auto",
          marginBottom: "25px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <img
          src="/icons/Log out.png"
          alt="Logout"
          width={48}
          height={48}
        />
      </button>
    </aside>
  );
}