from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import math
import heapq
import time
import threading
import tracemalloc

app = FastAPI()

# tracemalloc is process-global. Serialising the very small search runs keeps
# per-request peak allocation measurements from being mixed together.
search_metrics_lock = threading.Lock()

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

def chebyshev_distance(current, goal):
    x1, y1 = current
    x2, y2 = goal
    dx = abs(x1 - x2)
    dy = abs(y1 - y2)
    return max(dx, dy)

def get_chebyshev_heuristic(city, goal):
    city_coords = nodes_coordinates[city]
    goal_coords = nodes_coordinates[goal]
    return chebyshev_distance(city_coords, goal_coords)

def manhattan_distance(current, goal):
    x1, y1 = current
    x2, y2 = goal
    dx = abs(x1 - x2)
    dy = abs(y1 - y2)
    return dx + dy

def get_manhattan_heuristic(city, goal):
    """Returns Manhattan distance from city to goal"""
    # Get coordinates for both cities
    city_coords = nodes_coordinates[city]
    goal_coords = nodes_coordinates[goal]
    # Pass coordinates to manhattan_distance
    return manhattan_distance(city_coords, goal_coords)

# ==================== SEPARATED SEARCH FUNCTIONS ====================

def BFS(start, goal):
    bfs_frontier = [start]
    bfs_visited = {start}
    bfs_parent = {}
    steps = []
    steps_log = []

    while bfs_frontier:
        city = bfs_frontier.pop(0)
        steps.append(city)
        
        # เพิ่มการเก็บ Visited Array ณ ปัจจุบัน และคำนวณ Cost รวมของเมืองใน Visited Array
        visited_list = list(bfs_visited)
        visited_total_cost = 0
        for v_city in visited_list:
            if v_city in bfs_parent:
                p_city = bfs_parent[v_city]
                visited_total_cost += romania_map[v_city][p_city]

        step_info = {
            "step": len(steps), 
            "expanded_node": city, 
            "neighbors": [],
            "visited": visited_list,
            "visited_cost": visited_total_cost
        }

        if city == goal:
            cost = 0
            path = []
            current = goal

            while current != start:
                path.append(current)
                previous = bfs_parent[current]
                cost += romania_map[current][previous]
                current = previous

            path.append(start)
            path.reverse()
            step_info["current_path"] = path
            steps_log.append(step_info)
            return path, cost, steps, steps_log
        else:
            for next_city in romania_map[city]:
                if next_city not in bfs_visited:
                    bfs_visited.add(next_city)
                    bfs_frontier.append(next_city)
                    bfs_parent[next_city] = city
                    step_info["neighbors"].append({"city": next_city})

        steps_log.append(step_info)

    return [], float('inf'), steps, steps_log

def DFS(start, goal):
    dfs_frontier = [start]
    dfs_visited = set()
    dfs_parent = {}
    steps = []
    steps_log = []

    while dfs_frontier:
        city = dfs_frontier.pop()
        if city in dfs_visited:
            continue
        dfs_visited.add(city)
        steps.append(city)
        
        # เพิ่มการเก็บ Visited Array ณ ปัจจุบัน และคำนวณ Cost รวมของเมืองใน Visited Array
        visited_list = list(dfs_visited)
        visited_total_cost = 0
        for v_city in visited_list:
            if v_city in dfs_parent:
                p_city = dfs_parent[v_city]
                visited_total_cost += romania_map[v_city][p_city]

        step_info = {
            "step": len(steps), 
            "expanded_node": city, 
            "neighbors": [],
            "visited": visited_list,
            "visited_cost": visited_total_cost
        }

        if city == goal:
            cost = 0
            path = []
            current = goal

            while current != start:
                path.append(current)
                previous = dfs_parent[current]
                cost += romania_map[current][previous]
                current = previous

            path.append(start)
            path.reverse()
            step_info["current_path"] = path
            steps_log.append(step_info)
            return path, cost, steps, steps_log
        else:
            for next_city in romania_map[city]:
                if next_city not in dfs_visited:
                    dfs_frontier.append(next_city)
                    dfs_parent[next_city] = city
                    step_info["neighbors"].append({"city": next_city})

        steps_log.append(step_info)

    return [], float('inf'), steps, steps_log

def greedy_best_first_search(start, goal):
    open_set = []
    h_start = get_heuristic(start, goal)
    heapq.heappush(open_set, (h_start, start, [start], 0))
    visited = set()
    steps = []
    steps_log = []

    while open_set:
        h, curr, path, g = heapq.heappop(open_set)
        if curr in visited:
            continue
        visited.add(curr)
        steps.append(curr)

        step_info = {
            "step": len(steps),
            "expanded_node": curr,
            "g": round(g, 1),
            "h": round(h, 1),
            "f": round(h, 1),
            "current_path": path,
            "neighbors": []
        }

        if curr == goal:
            steps_log.append(step_info)
            return path, g, steps, steps_log

        for nxt, edge_cost in romania_map[curr].items():
            if nxt in visited:
                continue
            tentative_g = g + edge_cost
            h_neighbor = get_heuristic(nxt, goal)
            heapq.heappush(open_set, (h_neighbor, nxt, path + [nxt], tentative_g))
            step_info["neighbors"].append({
                "city": nxt,
                "g": round(tentative_g, 1),
                "h": round(h_neighbor, 1),
                "f": round(h_neighbor, 1)
            })

        steps_log.append(step_info)

    return [], float('inf'), steps, steps_log

def a_star_search(start, goal):
    open_set = []
    h_start = get_heuristic(start, goal)
    heapq.heappush(open_set, (h_start, start, [start], 0))
    visited = set()
    g_scores = {c: float('inf') for c in romania_map}
    g_scores[start] = 0
    steps = []
    steps_log = []

    while open_set:
        f, curr, path, g = heapq.heappop(open_set)
        if curr in visited:
            continue
        visited.add(curr)
        steps.append(curr)

        step_info = {
            "step": len(steps),
            "expanded_node": curr,
            "g": round(g, 1),
            "h": round(get_heuristic(curr, goal), 1),
            "f": round(f, 1),
            "current_path": path,
            "neighbors": []
        }

        if curr == goal:
            steps_log.append(step_info)
            return path, g, steps, steps_log

        for nxt, edge_cost in romania_map[curr].items():
            if nxt in visited:
                continue
            tentative_g = g + edge_cost
            if tentative_g < g_scores[nxt]:
                g_scores[nxt] = tentative_g
                h_val = get_heuristic(nxt, goal)
                f_val = tentative_g + h_val
                heapq.heappush(open_set, (f_val, nxt, path + [nxt], tentative_g))
                step_info["neighbors"].append({
                    "city": nxt,
                    "g": round(tentative_g, 1),
                    "h": round(h_val, 1),
                    "f": round(f_val, 1)
                })

        steps_log.append(step_info)

    return [], float('inf'), steps, steps_log

def a_star_search_adaptive(start_city, goal_city): # Nah, I'd adapt - "Mahoraga"
    """
    A* pathfinding using dynamic adaptive weighting of Chebyshev and Manhattan.
    
    The weights adapt based on the geometry ratio r = MD/CD:
    - When r is low (straight paths): Uses more MD (more informed)
    - When r is high (diagonal paths): Uses more CD (safer)
    
    Returns:
    - path: list of cities from start to goal
    - cost: total path cost
    - explored: list of cities explored
    - steps_log: step-by-step exploration data for frontend
    """
    
    # ==========================================
    # CUSTOM HEURISTIC: Dynamic Adaptive CD + MD
    # ==========================================
    
    def get_heuristic_with_details(city, goal):
        """
        Returns: custom_h, cd, md, alpha, beta
        - alpha: weight for CD
        - beta: weight for MD
        """
        cd = get_chebyshev_heuristic(city, goal)
        md = get_manhattan_heuristic(city, goal)
        
        if cd == 0:
            return 0, 0, 0, 1.0, 0.0
        
        r = md / cd
        
        if r <= 1.0:
            beta = 1.0
            alpha = 0.0
        else:
            beta = 1.0 / (98.0 * (r - 1.0))
            beta = min(beta, 1.0)
            alpha = 1.0 - beta
        
        custom = alpha * cd + beta * md
        return custom, cd, md, alpha, beta
    
    # ==========================================
    # INITIALIZATION
    # ==========================================
    
    frontier = []
    counter = 0
    
    h_start, cd_start, md_start, alpha_start, beta_start = get_heuristic_with_details(start_city, goal_city)
    heapq.heappush(frontier, (h_start, counter, start_city, [start_city], 0))
    counter += 1
    
    explored = []
    visited = set()
    best_cost = {city: float('inf') for city in romania_map}
    best_cost[start_city] = 0
    steps_log = []
    
    # ==========================================
    # A* LOOP
    # ==========================================
    
    while frontier:
        priority, _, current_city, path, cost_so_far = heapq.heappop(frontier)
        
        if current_city in visited:
            continue
        
        visited.add(current_city)
        explored.append(current_city)
        
        h_current, cd_current, md_current, alpha_current, beta_current = get_heuristic_with_details(current_city, goal_city)
        
        step_info = {
            "step": len(explored),
            "expanded_node": current_city,
            "g": round(cost_so_far, 1),
            "h": round(h_current, 1),
            "f": round(priority, 1),
            "cd": round(cd_current, 1),
            "md": round(md_current, 1),
            "alpha": round(alpha_current * 100, 1),
            "beta": round(beta_current * 100, 1),
            "current_path": path,
            "neighbors": []
        }
        if current_city == goal_city:
            steps_log.append(step_info)
            return path, cost_so_far, explored, steps_log
        
        for neighbor, road_distance in romania_map[current_city].items():
            if neighbor in visited:
                continue
            
            new_cost = cost_so_far + road_distance
            if new_cost < best_cost[neighbor]:
                best_cost[neighbor] = new_cost
                h_neighbor, cd_neighbor, md_neighbor, alpha_neighbor, beta_neighbor = get_heuristic_with_details(neighbor, goal_city)
                neighbor_priority = new_cost + h_neighbor
                heapq.heappush(frontier, (neighbor_priority, counter, neighbor, path + [neighbor], new_cost))
                counter += 1
                step_info["neighbors"].append({
                    "city": neighbor,
                    "g": round(new_cost, 1),
                    "h": round(h_neighbor, 1),
                    "f": round(neighbor_priority, 1),
                    "cd": round(cd_neighbor, 1),
                    "md": round(md_neighbor, 1),
                    "alpha": round(alpha_neighbor * 100, 1),
                    "beta": round(beta_neighbor * 100, 1)
                })
        
        steps_log.append(step_info)
    
    return [], float('inf'), explored, steps_log

def hub_and_spoke_search(start, goal):
    open_set = []
    h_start = get_heuristic(start, goal)
    heapq.heappush(open_set, (h_start, start, [start], 0))
    visited = set()
    g_scores = {c: float('inf') for c in romania_map}
    g_scores[start] = 0
    steps = []
    steps_log = []

    while open_set:
        f, curr, path, g = heapq.heappop(open_set)
        if curr in visited:
            continue
        visited.add(curr)
        steps.append(curr)

        step_info = {
            "step": len(steps),
            "expanded_node": curr,
            "g": round(g, 1),
            "h": round(get_heuristic(curr, goal), 1),
            "f": round(f, 1),
            "current_path": path,
            "neighbors": []
        }

        if curr == goal:
            steps_log.append(step_info)
            return path, g, steps, steps_log

        for nxt, edge_cost in romania_map[curr].items():
            if nxt in visited:
                continue
            tentative_g = g + edge_cost
            if tentative_g < g_scores[nxt]:
                g_scores[nxt] = tentative_g
                h_val = get_heuristic(nxt, goal)
                f_val = tentative_g + h_val - (node_degrees[nxt] * 20)
                heapq.heappush(open_set, (f_val, nxt, path + [nxt], tentative_g))
                step_info["neighbors"].append({
                    "city": nxt,
                    "g": round(tentative_g, 1),
                    "h": round(h_val, 1),
                    "f": round(f_val, 1)
                })

        steps_log.append(step_info)

    return [], float('inf'), steps, steps_log

# ==================== FASTAPI API ROUTE ====================

class SearchRequest(BaseModel):
    start: str
    goal: str
    algorithm: str

@app.post("/api/search")
def run_search(req: SearchRequest):
    start, goal, algo = req.start, req.goal, req.algorithm
    
    if start not in romania_map or goal not in romania_map:
        return {"error": "Invalid start or goal city"}

    search_functions = {
        "BFS": BFS,
        "DFS": DFS,
        "Greedy": greedy_best_first_search,
        "A*": a_star_search,
        "HubAndSpoke": hub_and_spoke_search,
        "Cheby_A_Star": a_star_search_adaptive,
    }
    search_function = search_functions.get(algo)

    if search_function is None:
        return {"error": "Invalid algorithm name"}

    with search_metrics_lock:
        tracemalloc.start()
        timer_start = time.perf_counter()

        try:
            final_path, cost, steps, steps_log = search_function(start, goal)
        finally:
            time_elapsed = time.perf_counter() - timer_start
            _, peak_memory_bytes = tracemalloc.get_traced_memory()
            tracemalloc.stop()

    execution_time_ms = time_elapsed * 1000
    peak_memory_kb = peak_memory_bytes / 1024

    return {
        "algorithm": algo,
        "path": final_path,
        "cost": cost,
        "steps": steps,
        "steps_log": steps_log,
        "execution_time": f"{time_elapsed:.6f} s",
        "execution_time_ms": round(execution_time_ms, 6),
        "peak_memory_kb": round(peak_memory_kb, 3),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
