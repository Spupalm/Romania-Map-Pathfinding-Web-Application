# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import math
import heapq
import time

app = FastAPI()

# อนุญาตให้ Next.js (port 3000) เรียกใช้งานได้
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

romania_map = {
    'Oradea': {'Zerind': 71, 'Sibiu': 151},
    'Zerind': {'Oradea': 71, 'Arad': 75},
    'Arad': {'Zerind': 75, 'Sibiu': 140, 'Timisoara': 118},
    'Timisoara': {'Arad': 118, 'Lugoj': 111},
    'Lugoj': {'Timisoara': 111, 'Mehadia': 70},
    'Mehadia': {'Lugoj': 70, 'Drobeta': 75},
    'Drobeta': {'Mehadia': 75, 'Craiova': 120},
    'Craiova': {'Drobeta': 120, 'Rimnicu Vilcea': 146, 'Pitesti': 138},
    'Sibiu': {'Oradea': 151, 'Arad': 140, 'Fagaras': 99, 'Rimnicu Vilcea': 80},
    'Rimnicu Vilcea': {'Sibiu': 80, 'Craiova': 146, 'Pitesti': 97},
    'Fagaras': {'Sibiu': 99, 'Bucharest': 211},
    'Pitesti': {'Rimnicu Vilcea': 97, 'Craiova': 138, 'Bucharest': 101},
    'Bucharest': {'Fagaras': 211, 'Pitesti': 101, 'Giurgiu': 90, 'Urziceni': 85},
    'Giurgiu': {'Bucharest': 90},
    'Urziceni': {'Bucharest': 85, 'Vaslui': 142, 'Hirsova': 98},
    'Hirsova': {'Urziceni': 98, 'Eforie': 86},
    'Eforie': {'Hirsova': 86},
    'Vaslui': {'Urziceni': 142, 'Iasi': 92},
    'Iasi': {'Vaslui': 92, 'Neamt': 87},
    'Neamt': {'Iasi': 87}
}

nodes_coordinates = {
    "Arad": (92, 492), "Bucharest": (400, 328), "Zerind": (110, 532),
    "Oradea": (132, 572), "Timisoara": (95, 410), "Lugoj": (166, 380),
    "Mehadia": (168, 340), "Drobeta": (166, 300), "Sibiu": (208, 458),
    "Rimnicu Vilcea": (233, 411), "Craiova": (253, 288), "Fagaras": (306, 448),
    "Pitesti": (320, 368), "Giurgiu": (376, 270), "Neamt": (390, 538),
    "Iasi": (473, 506), "Vaslui": (510, 444), "Urziceni": (457, 350),
    "Hirsova": (535, 350), "Eforie": (563, 293),
}

node_degrees = {node: len(neighbors) for node, neighbors in romania_map.items()}

def get_heuristic(city, goal_city):
    x1, y1 = nodes_coordinates[city]
    x2, y2 = nodes_coordinates[goal_city]
    return math.sqrt((x2 - x1)**2 + (y2 - y1)**2)

class SearchRequest(BaseModel):
    start: str
    goal: str
    algorithm: str

@app.post("/api/search")
def run_search(req: SearchRequest):
    start, goal, algo = req.start, req.goal, req.algorithm
    
    if start not in romania_map or goal not in romania_map:
        return {"error": "Invalid start or goal city"}

    timer_start = time.perf_counter()
    steps = []
    final_path = []
    cost = 0

    if algo == "BFS":
        frontier = [start]
        visited = set([start])
        parent = {}
        while frontier:
            curr = frontier.pop(0)
            steps.append(curr)
            if curr == goal:
                break
            for nxt in romania_map[curr]:
                if nxt not in visited:
                    visited.add(nxt)
                    frontier.append(nxt)
                    parent[nxt] = curr
        
        # reconstruct path
        curr = goal
        while curr != start:
            final_path.append(curr)
            prev = parent[curr]
            cost += romania_map[curr][prev]
            curr = prev
        final_path.append(start)
        final_path.reverse()

    elif algo == "DFS":
        frontier = [start]
        visited = set()
        parent = {}
        while frontier:
            curr = frontier.pop()
            if curr in visited:
                continue
            visited.add(curr)
            steps.append(curr)
            if curr == goal:
                break
            for nxt in romania_map[curr]:
                if nxt not in visited:
                    frontier.append(nxt)
                    parent[nxt] = curr
        
        curr = goal
        while curr != start:
            final_path.append(curr)
            prev = parent[curr]
            cost += romania_map[curr][prev]
            curr = prev
        final_path.append(start)
        final_path.reverse()

    elif algo in ["Greedy", "A*", "HubAndSpoke"]:
        open_set = []
        h_start = get_heuristic(start, goal)
        heapq.heappush(open_set, (h_start, start, [start], 0))
        visited = set()
        g_scores = {c: float('inf') for c in romania_map}
        g_scores[start] = 0

        while open_set:
            f, curr, path, g = heapq.heappop(open_set)
            if curr in visited:
                continue
            visited.add(curr)
            steps.append(curr)

            if curr == goal:
                final_path = path
                cost = g
                break

            for nxt, edge_cost in romania_map[curr].items():
                if nxt in visited:
                    continue
                tentative_g = g + edge_cost
                h_val = get_heuristic(nxt, goal)

                if algo == "Greedy":
                    f_val = h_val
                elif algo == "A*":
                    f_val = tentative_g + h_val
                elif algo == "HubAndSpoke":
                    # Custom Heuristic using Node Degree
                    f_val = tentative_g + h_val - (node_degrees[nxt] * 20)

                if algo == "Greedy" or tentative_g < g_scores[nxt]:
                    g_scores[nxt] = tentative_g
                    heapq.heappush(open_set, (f_val, nxt, path + [nxt], tentative_g))

    time_elapsed = time.perf_counter() - timer_start

    return {
        "algorithm": algo,
        "path": final_path,
        "cost": cost,
        "steps": steps,
        "execution_time": f"{time_elapsed:.6f} s"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)