"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

interface NavbarProps {
  /** Currently selected algorithm */
  algorithmLabel: string;

  /** List of Romanian cities */
  cityNames?: string[];

  /** Called when user types in search */
  onSearchChange?: (value: string) => void;

  /** Called when user selects a city */
  onCitySelect?: (city: string) => void;

  /** Called when search icon is clicked */
  onSearchSubmit?: () => void;

  /** Called when algorithm section is clicked */
  onSearchBarClick?: () => void;
}

export default function Navbar({
  algorithmLabel,
  cityNames = [],
  onSearchChange,
  onCitySelect,
  onSearchSubmit,
  onSearchBarClick,
}: NavbarProps) {
  const router = useRouter();

  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  /* ============================================================
     FILTER CITIES
     ============================================================ */

  const filteredCities = cityNames
    .filter((city) =>
      city.toLowerCase().includes(searchValue.toLowerCase())
    )
    .slice(0, 6);

  /* ============================================================
     SEARCH CHANGE
     ============================================================ */

  function handleSearchChange(value: string) {
    setSearchValue(value);

    onSearchChange?.(value);

    if (value.trim().length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }

  /* ============================================================
     CITY SELECT
     ============================================================ */

  function handleCitySelect(city: string) {
    setSearchValue(city);
    setShowSuggestions(false);

    onCitySelect?.(city);
  }

  /* ============================================================
     SEARCH SUBMIT
     ============================================================ */

  function handleSearchSubmit() {
    setShowSuggestions(false);

    onSearchSubmit?.();
  }

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "40px",
        padding: "22px 22px",
        background: "#4d85b1",
        flexWrap: "wrap",
      }}
    >
      {/* ============================================================
          BACKGROUND CONTAINER
          ============================================================ */}

      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          right: 8,
          bottom: 8,
          background: "#ffffff",
          borderRadius: 25,
          opacity: 0.5,
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* ============================================================
          LOGO
          ============================================================ */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          flexShrink: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/Map_icon.png"
            alt="Romanian Map"
            width={40}
            height={40}
          />
        </div>

        <span
          className={jaro.className}
          style={{
            color: "#ffffff",
            fontSize: 24,
            fontWeight: 400,
            lineHeight: 1,
          }}
        >
          Romanian
          <br />
          Map
        </span>
      </div>

      {/* ============================================================
          NAVIGATION LINKS
          ============================================================ */}

      <div
        style={{
          display: "flex",
          gap: "35px",
          flexShrink: 0,
          position: "relative",
          zIndex: 1,
          alignItems: "center",
        }}
      >
        {/* HOME */}

        <button
          type="button"
          onClick={() => router.push("/main_page")}
          className={jockey_one.className}
          style={{
            color: "#ffffff",
            fontSize: 24,
            fontWeight: 300,
            whiteSpace: "nowrap",
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          Home
        </button>

        {/* HISTORY */}

        <button
          type="button"
          onClick={() => router.push("/History_page")}
          className={jockey_one.className}
          style={{
            color: "#ffffff",
            fontSize: 24,
            fontWeight: 600,
            whiteSpace: "nowrap",
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          History
        </button>

        {/* CALCULATION */}

        <button
          type="button"
          onClick={() => router.push("/Calculation_page")}
          className={jockey_one.className}
          style={{
            color: "#ffffff",
            fontSize: 24,
            fontWeight: 600,
            whiteSpace: "nowrap",
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          Calculation
        </button>

        {/* COMPARE */}

        <button
          type="button"
          onClick={() => router.push("/Compare_page")}
          className={jockey_one.className}
          style={{
            color: "#ffffff",
            fontSize: 24,
            fontWeight: 600,
            whiteSpace: "nowrap",
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          Compare
        </button>
      </div>

      {/* ============================================================
          CITY SEARCH + ALGORITHM
          ============================================================ */}

      <div
        style={{
          position: "relative",
          flex: "1 1 300px",
          minWidth: "300px",
          zIndex: 20,
        }}
      >
        {/* ========================================================
            SEARCH BAR
            ======================================================== */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(255,255,255,0.14)",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: 999,
            padding: "7px 7px 7px 16px",
            gap: 8,
            minHeight: 42,
          }}
        >
          {/* ======================================================
              CITY SEARCH INPUT
              ====================================================== */}

          <input
            type="text"
            value={searchValue}
            placeholder="Search a city..."
            onChange={(e) =>
              handleSearchChange(e.target.value)
            }
            onFocus={() => {
              if (searchValue.trim()) {
                setShowSuggestions(true);
              }
            }}
            onClick={(e) => {
              // VERY IMPORTANT:
              // Don't open AlgorithmSelector
              e.stopPropagation();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearchSubmit();
              }

              if (e.key === "Escape") {
                setShowSuggestions(false);
              }
            }}
            className={jockey_one.className}
            style={{
              flex: 1,
              fontSize: 16,
              color: "#ffffff",
              background: "transparent",
              border: "none",
              outline: "none",
              minWidth: 0,
            }}
          />

          {/* ======================================================
              ALGORITHM SELECTOR BUTTON
              ====================================================== */}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();

              // Close city suggestions
              setShowSuggestions(false);

              // Open AlgorithmSelector
              onSearchBarClick?.();
            }}
            className={jockey_one.className}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: 999,
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            {algorithmLabel}

            <span
              style={{
                fontSize: 11,
                lineHeight: 1,
              }}
            >
              ▼
            </span>
          </button>

          {/* ======================================================
              SEARCH BUTTON
              ====================================================== */}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSearchSubmit();
            }}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "transparent",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              cursor: "pointer",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/Search.png"
              alt="Search"
              width={16}
              height={16}
            />
          </button>
        </div>

        {/* ========================================================
            CITY SUGGESTIONS
            ======================================================== */}

        {showSuggestions &&
          searchValue.trim() !== "" &&
          filteredCities.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "52px",
                left: 0,
                right: 0,
                background: "#ffffff",
                borderRadius: "12px",
                boxShadow:
                  "0 5px 15px rgba(0,0,0,0.2)",
                overflow: "hidden",
                zIndex: 30,
              }}
            >
              {filteredCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() =>
                    handleCitySelect(city)
                  }
                  className={jockey_one.className}
                  style={{
                    width: "100%",
                    padding: "10px 15px",
                    border: "none",
                    background: "#ffffff",
                    color: "#405777",
                    fontSize: "16px",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "#e9eef5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "#ffffff";
                  }}
                >
                  {city}
                </button>
              ))}
            </div>
          )}

        {/* ========================================================
            CITY NOT FOUND
            ======================================================== */}

        {showSuggestions &&
          searchValue.trim() !== "" &&
          filteredCities.length === 0 && (
            <div
              style={{
                position: "absolute",
                top: "52px",
                left: 0,
                right: 0,
                background: "#ffffff",
                borderRadius: "12px",
                padding: "12px 15px",
                boxShadow:
                  "0 5px 15px rgba(0,0,0,0.2)",
                color: "#405777",
                fontSize: "15px",
                zIndex: 30,
              }}
            >
              City not found
            </div>
          )}
      </div>

      {/* ============================================================
          PROFILE
          ============================================================ */}

      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "#fbf7ee",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* User icon can be added here */}
      </div>
    </div>
  );
}