export const CITY_NAMES = [
  "Arad",
  "Zerind",
  "Oradea",
  "Sibiu",
  "Timisoara",
  "Lugoj",
  "Mehadia",
  "Drobeta",
  "Craiova",
  "Rimnicu Vilcea",
  "Fagaras",
  "Pitesti",
  "Bucharest",
  "Giurgiu",
  "Urziceni",
  "Hirsova",
  "Eforie",
  "Vaslui",
  "Iasi",
  "Neamt",
] as const;

export type CityName = (typeof CITY_NAMES)[number];

export const ALGORITHMS = [
  { id: "dfs", label: "Depth First", runMode: "DFS" },
  { id: "bfs", label: "Breadth First", runMode: "BFS" },
  { id: "greedy", label: "Greedy Best-First", runMode: "Greedy" },
  { id: "astar", label: "A* Search", runMode: "A*" },
  { id: "hub_and_spoke", label: "Hub and Spoke", runMode: "HubAndSpoke" },
  {
    id: "adaptive_astar",
    label: "Adaptive A* (CD + MD)",
    runMode: "Cheby_A_Star",
  },
] as const;

export type AlgorithmId = (typeof ALGORITHMS)[number]["id"];
export type RunMode = (typeof ALGORITHMS)[number]["runMode"];

export const BACKEND_ID = "romania-fastapi-v1";
export const BACKEND_NAME = "Romania FastAPI";

export interface WorkflowStep {
  step: number;
  expanded_node: string;
  [key: string]: unknown;
}

export interface SearchResponse {
  algorithm: RunMode;
  path: CityName[];
  cost: number;
  steps: CityName[];
  steps_log: WorkflowStep[];
  execution_time: string;
  execution_time_ms: number;
  peak_memory_kb: number;
  error?: string;
}

export interface CreateSavedRouteInput {
  start_city: CityName;
  goal_city: CityName;
  route_path: CityName[];
  workflow_steps: WorkflowStep[];
  run_mode: RunMode;
  path_cost_km: number;
  execution_time_ms: number;
  peak_memory_kb: number;
}

export interface SavedRoute extends CreateSavedRouteInput {
  id: string;
  user_id: string;
  backend_id: string;
  backend_name: string;
  saved_at: string;
}

export function isCityName(value: unknown): value is CityName {
  return (
    typeof value === "string" &&
    (CITY_NAMES as readonly string[]).includes(value)
  );
}

export function isRunMode(value: unknown): value is RunMode {
  return ALGORITHMS.some((algorithm) => algorithm.runMode === value);
}

export function algorithmFromId(id: string) {
  return ALGORITHMS.find((algorithm) => algorithm.id === id) ?? ALGORITHMS[0];
}

export function algorithmFromRunMode(runMode: string) {
  return (
    ALGORITHMS.find((algorithm) => algorithm.runMode === runMode) ??
    ALGORITHMS[0]
  );
}

