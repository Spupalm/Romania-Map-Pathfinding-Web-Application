"use client";

import { useState } from "react";
import { Jockey_One } from "next/font/google";

const jockey_one = Jockey_One({
  subsets: ["latin"],
  weight: "400",
});

interface SearcherProps {
  cityNames?: string[];
  onCitySelect?: (city: string) => void;
}

export default function Searcher({
  cityNames = [],
  onCitySelect,
}: SearcherProps) {
  const [searchValue, setSearchValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter cities
  const filteredCities = cityNames
    .filter((city) =>
      city.toLowerCase().includes(searchValue.toLowerCase())
    )
    .slice(0, 6);

  function handleSearchChange(value: string) {
    setSearchValue(value);

    if (value.trim() !== "") {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }

  function handleCitySelect(city: string) {
    setSearchValue(city);
    setShowSuggestions(false);

    onCitySelect?.(city);
  }

  function handleSearch() {
    const city = cityNames.find(
      (item) =>
        item.toLowerCase() ===
        searchValue.trim().toLowerCase()
    );

    if (city) {
      handleCitySelect(city);
    }
  }

  return (
    <header
      style={{
        width: "100%",
        height: "65px",
        background: "#4d86b2",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        boxSizing: "border-box",
      }}
    >
      {/* =====================================================
          SEARCH BAR
          ===================================================== */}

      <div
        style={{
          position: "relative",
          width: "235px",
        }}
      >
        <div
          style={{
            width: "543px",
            height: "44px",
            background: "rgba(255,255,255,0.55)",
            border: "1px solid rgba(255,255,255,0.7)",
            borderRadius: "999px",
            display: "flex",
            alignItems: "center",
            padding: "0 8px 0 14px",
            boxSizing: "border-box",
            boxShadow:
              "0 2px 4px rgba(0,0,0,0.15)",
          }}
        >
          <input
            type="text"
            value={searchValue}
            placeholder="what are you looking for ?"
            onChange={(e) =>
              handleSearchChange(e.target.value)
            }
            onFocus={() => {
              if (searchValue.trim() !== "") {
                setShowSuggestions(true);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }

              if (e.key === "Escape") {
                setShowSuggestions(false);
              }
            }}
            className={jockey_one.className}
            style={{
              flex: 1,
              minWidth: 0,
              border: "none",
              outline: "none",
              background: "transparent",
              color: "white",
              fontSize: "16px",
              padding: 0,
            }}
          />

          {/* SEARCH ICON */}

          <button
            type="button"
            onClick={handleSearch}
            style={{
              width: "20px",
              height: "20px",
              border: "none",
              background: "transparent",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/Search.png"
              alt="Search"
              width={20}
              height={20}
            />
          </button>
        </div>

        {/* =================================================
            SEARCH RESULTS
            ================================================= */}

        {showSuggestions &&
          searchValue.trim() !== "" && (
            <div
              style={{
                position: "absolute",
                top: "34px",
                left: 0,
                width: "235px",
                background: "white",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow:
                  "0 5px 15px rgba(0,0,0,0.25)",
                zIndex: 100,
              }}
            >
              {filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() =>
                      handleCitySelect(city)
                    }
                    className={jockey_one.className}
                    style={{
                      width: "100%",
                      padding: "7px 12px",
                      border: "none",
                      background: "white",
                      color: "#405777",
                      fontSize: "12px",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    {city}
                  </button>
                ))
              ) : (
                <div
                  className={jockey_one.className}
                  style={{
                    padding: "9px 12px",
                    color: "#405777",
                    fontSize: "12px",
                  }}
                >
                  City not found
                </div>
              )}
            </div>
          )}
      </div>

      {/* =====================================================
          USER
          ===================================================== */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginRight: "0px",
        }}
      >
        {/* USER CIRCLE */}

        <div
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "100%",
            background: "#fbf7ee",
            boxShadow:
              "0 2px 4px rgba(0,0,0,0.15)",
          }}
        />

        {/* USER TEXT */}

        <span
          className={jockey_one.className}
          style={{
            color: "white",
            fontSize: "32px",
          }}
        >
          User
        </span>

        {/* DROPDOWN ARROW */}

        <span
          style={{
            color: "white",
            fontSize: "20px",
            marginLeft: "12px",
          }}
        >
         ⌄
        </span>
      </div>
    </header>
  );
}