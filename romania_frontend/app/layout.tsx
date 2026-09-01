import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Romanian Map — Pathfinding",
  description: "Visualize BFS, DFS, Greedy, A*, and Hub-and-Spoke search on the Romania map",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}