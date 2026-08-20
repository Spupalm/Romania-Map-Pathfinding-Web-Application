# Only Backend in this version!
import time
import math
import heapq


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
    "Arad": (92, 492),
    "Bucharest": (400, 328),
    "Zerind": (110, 532),
    "Oradea": (132, 572),
    "Timisoara": (95, 410),
    "Lugoj": (166, 380),
    "Mehadia": (168, 340),
    "Drobeta": (166, 300),
    "Sibiu": (208, 458),
    "Rimnicu Vilcea": (233, 411),
    "Craiova": (253, 288),
    "Fagaras": (306, 448),
    "Pitesti": (320, 368),
    "Giurgiu": (376, 270),
    "Neamt": (390, 538),
    "Iasi": (473, 506),
    "Vaslui": (510, 444),
    "Urziceni": (457, 350),
    "Hirsova": (535, 350),
    "Eforie": (563, 293),
}
node_degrees = {
    'Arad': 3, 'Zerind': 2, 'Oradea': 2, 'Sibiu': 4,
    'Fagaras': 2, 'Rimnicu Vilcea': 3, 'Pitesti': 3,
    'Timisoara': 2, 'Lugoj': 2, 'Mehadia': 2, 'Drobeta': 2,
    'Craiova': 3, 'Bucharest': 4, 'Giurgiu': 1, 'Urziceni': 3,
    'Vaslui': 2, 'Iasi': 2, 'Neamt': 1, 'Hirsova': 2, 'Eforie': 1
}
start_city = input("Start city: ")
goal_city = input("Destination city: ")

if start_city not in romania_map:
    print("Invalid start city")
    exit()

if goal_city not in romania_map:
    print("Invalid destination city")
    exit()

sep = "====================="
def get_heuristic(city, goal_city="Bucharest"):
    x1, y1 = nodes_coordinates[city]
    x2, y2 = nodes_coordinates[goal_city]
    # สูตรระยะทางเส้นตรง: sqrt((x2 - x1)^2 + (y2 - y1)^2)
    return math.sqrt((x2 - x1)**2 + (y2 - y1)**2)

def BFS(start, goal):
    timer_start = time.perf_counter()
    bfs_frontier = [start]
    bfs_visited = set(start)
    bfs_parent = {}
    while bfs_frontier:
        city = bfs_frontier.pop(0)
        bfs_visited.add(city)

        if city == goal:
            cost = 0
            path = []
            current = goal

            while current != start:
                path.append(current)
                previous = bfs_parent[current]
                cost += romania_map[current][previous]
                current = previous

            timer_end = time.perf_counter()
            time_elapsed = timer_end - timer_start

            # Add the start city
            path.append(start)

            # Reverse so it becomes Start -> Goal
            path.reverse()

            # For debugging/showing path
            print(sep)
            print("Breadth First Search")
            print(f"Time elapsed: {time_elapsed:.8f} seconds")
            print(sep)
            print("Path:", " -> ".join(path))
            print("Cost:", cost)
            return
        else:

            for next_city in romania_map[city]:
                if next_city not in bfs_visited:
                    bfs_frontier.append(next_city)
                    bfs_parent[next_city] = city

def DFS(start, goal):
    timer_start = time.perf_counter()
    dfs_frontier = [start]
    dfs_visited = set(start)
    dfs_parent = {}
    while dfs_frontier:
        city = dfs_frontier.pop()
        dfs_visited.add(city)

        if city == goal:
            cost = 0
            path = []
            current = goal
            while current != start:
                path.append(current)
                previous = dfs_parent[current]
                cost += romania_map[current][previous]
                current = previous
                
            timer_end = time.perf_counter()
            time_elapsed = timer_end - timer_start

            # Add the start city
            path.append(start)

            # Reverse so it becomes Start -> Goal
            path.reverse()

            # For debugging/showing path
            print(sep)
            print("Depth First Search")
            print(f"Time elapsed: {time_elapsed:.8f} seconds")
            print(sep)
            print("Path:", " -> ".join(path))
            print("Cost:", cost)
            return
        else:

            for next_city in romania_map[city]:
                if next_city not in dfs_visited:
                    dfs_frontier.append(next_city)
                    dfs_parent[next_city] = city
def greedy_best_first_search(start, goal):
    # Priority Queue stores tuples of: (h_score, current_node, path, g_score)
    timer_start = time.perf_counter()
    open_set = []
    
    # Calculate initial heuristic h(start)
    h_start = get_heuristic(start, goal)
    heapq.heappush(open_set, (h_start, start, [start], 0))
    
    visited = set()
    step = 1
    
    print(sep)
    print(f"=== Starting Greedy Best-First Search from {start} to {goal} ===\n")
    
    while open_set:
        # Pop node with the lowest h(n) value
        h, current, path, g = heapq.heappop(open_set)
        
        if current in visited:
            continue
            
        print(f"Iteration {step}:")
        print(f"  -> Expanding Node: [ {current} ]")
        print(f"     h({current}) = {h:.1f}, path cost so far g({current}) = {g}")
        
        # Goal check
        if current == goal:
            timer_end = time.perf_counter()
            time_elapsed = timer_end - timer_start
            print(f"\n==========================================")
            print(f"Greedy Best-First Search Completed!")
            print(f"Path: {' -> '.join(path)}")
            print(f"Total Cost: {g}")
            print(f"Time elapsed: {time_elapsed:.8f} seconds")
            print(f"==========================================")
            return path, g
            
        visited.add(current)
        
        # Explore neighbors
        print("     Possible Next Neighbor Nodes:")
        for neighbor, edge_cost in romania_map[current].items():
            if neighbor in visited:
                continue
                
            tentative_g = g + edge_cost
            h_neighbor = get_heuristic(neighbor, goal)
            heapq.heappush(open_set, (h_neighbor, neighbor, path + [neighbor], tentative_g))
            print(f"       - {neighbor}: h = {h_neighbor:.1f} (edge cost = {edge_cost})")
                
        print("-" * 50)
        step += 1

    print("No valid path found to the destination.")
    return None, float('inf')

def a_star_search(start, goal):
    # Priority Queue stores tuples of: (f_score, current_node, path, g_score)
    timer_start = time.perf_counter()
    open_set = []
    
    # Calculate initial heuristic h(start)
    h_start = get_heuristic(start, goal)
    heapq.heappush(open_set, (h_start, start, [start], 0))
    
    g_scores = {city: float('inf') for city in nodes_coordinates}
    g_scores[start] = 0

    visited = set()
    
    step = 1
    print(f"=== Starting A* Search from {start} to {goal} ===\n")
    
    while open_set:
        # Pop the node with the lowest f(n) value
        f, current, path, g = heapq.heappop(open_set)
        
        if current in visited:
            continue
            
        print(f"Iteration {step}:")
        print(f"  -> Expanding Node: [ {current} ]")
        print(f"     g({current}) = {g:.1f}, h({current}) = {get_heuristic(current, goal):.1f}, f({current}) = {f:.1f}")
        
        # Goal check
        if current == goal:
            timer_end = time.perf_counter()
            time_elapsed = timer_end - timer_start
            print(f"\n==========================================")
            print(f"A* Search Completed!")
            print(f"Path: {' -> '.join(path)}")
            print(f"Total Cost: {g}")
            print(f"Time elapsed: {time_elapsed:.8f} seconds")
            print(f"==========================================")
            return path, g
            
        visited.add(current)
        
        # Explore neighbors
        print("     Possible Next Neighbor Nodes:")
        for neighbor, edge_cost in romania_map[current].items():
            if neighbor in visited:
                continue
                
            tentative_g = g + edge_cost
            if tentative_g < g_scores[neighbor]:
                g_scores[neighbor] = tentative_g
                h = get_heuristic(neighbor, goal)
                f_neighbor = tentative_g + h
                heapq.heappush(open_set, (f_neighbor, neighbor, path + [neighbor], tentative_g))
                print(f"       - {neighbor}: g = {tentative_g}, h = {h:.1f} ==> f = {f_neighbor:.1f}")
                
        print("-" * 50)
        step += 1

    print("No valid path found to the destination.")
    return None, float('inf')
def Hub_and_Spoke_Search(start, goal):
    # Priority Queue stores tuples of: (f_score, current_node, path, g_score)
    timer_start = time.perf_counter()
    open_set = []
    
    # Calculate initial heuristic h(start)
    h_start = get_heuristic(start, goal)
    heapq.heappush(open_set, (h_start, start, [start], 0))
    
    g_scores = {city: float('inf') for city in nodes_coordinates}
    g_scores[start] = 0

    visited = set()
    
    step = 1
    print(f"=== Starting Hub and Spoke Search from {start} to {goal} ===\n")
    
    while open_set:
        # Pop the node with the lowest f(n) value
        f, current, path, g = heapq.heappop(open_set)
        
        if current in visited:
            continue
            
        print(f"Iteration {step}:")
        print(f"  -> Expanding Node: [ {current} ]")
        print(f"     g({current}) = {g:.1f}, h({current}) = {get_heuristic(current, goal):.1f}, f({current}) = {f:.1f}")
        
        # Goal check
        if current == goal:
            timer_end = time.perf_counter()
            time_elapsed = timer_end - timer_start
            print(f"\n==========================================")
            print(f"Hub and Spoke Search Completed!")
            print(f"Path: {' -> '.join(path)}")
            print(f"Total Cost: {g}")
            print(f"Time elapsed: {time_elapsed:.8f} seconds")
            print(f"==========================================")
            return path, g
            
        visited.add(current)
        
        # Explore neighbors
        print("     Possible Next Neighbor Nodes:")
        for neighbor, edge_cost in romania_map[current].items():
            if neighbor in visited:
                continue
                
            tentative_g = g + edge_cost
            if tentative_g < g_scores[neighbor]:
                g_scores[neighbor] = tentative_g
                h = get_heuristic(neighbor, goal)
                f_neighbor = tentative_g + h - (node_degrees[neighbor] * 20)  # Adjust f(n) based on node degree
                heapq.heappush(open_set, (f_neighbor, neighbor, path + [neighbor], tentative_g))
                print(f"       - {neighbor}: g = {tentative_g}, h = {h:.1f} ==> f = {f_neighbor:.1f}")
                
        print("-" * 50)
        step += 1

    print("No valid path found to the destination.")
    return None, float('inf')

BFS(start_city, goal_city)
DFS(start_city, goal_city)
greedy_best_first_search(start_city, goal_city)
a_star_search(start_city, goal_city)
Hub_and_Spoke_Search(start_city, goal_city)