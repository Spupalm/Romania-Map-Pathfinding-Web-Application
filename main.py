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

start_city = input("Start city: ").strip().title()
goal_city = input("Destination city: ").strip().title()

if start_city not in romania_map:
    print("INVALID START CITY")
    exit()

if goal_city not in romania_map:
    print("INVALID DESTINATION CITY")
    exit()

# seperator
sep = "="*20

def chebyshev_distance(current, goal):
    """
    Calculate Chebyshev Distance between two points
    8-directional movement
    
    Formula: max(|x1-x2|, |y1-y2|)
    """
    x1, y1 = current
    x2, y2 = goal
    
    dx = abs(x1 - x2)
    dy = abs(y1 - y2)
    
    return max(dx, dy)

def manhattan_distance(current, goal):
    """
    Calculate Manhattan Distance between two points
    4-directional movement (no diagonals)
    
    Formula: |x1-x2| + |y1-y2|
    """
    x1, y1 = current
    x2, y2 = goal
    
    dx = abs(x1 - x2)
    dy = abs(y1 - y2)
    
    return dx + dy

def get_heuristic(city, goal_city="Bucharest"):
    x1, y1 = nodes_coordinates[city]
    x2, y2 = nodes_coordinates[goal_city]
    # สูตรระยะทางเส้นตรง: sqrt((x2 - x1)^2 + (y2 - y1)^2)
    return math.sqrt((x2 - x1)**2 + (y2 - y1)**2)

def get_chebyshev_heuristic(city, goal):
    """Returns Chebyshev distance from city to goal"""
    # Get coordinates for both cities
    city_coords = nodes_coordinates[city]
    goal_coords = nodes_coordinates[goal]
    # Pass coordinates to chebyshev_distance
    return chebyshev_distance(city_coords, goal_coords)

def breadth_first_search(start, goal):
    timer_start = time.perf_counter()
    bfs_frontier = [start]
    bfs_visited = set()
    bfs_parent = {}
    cities_explored = []
    
    while bfs_frontier:
        city = bfs_frontier.pop(0)
        
        # Skip if already visited
        if city in bfs_visited:
            continue
            
        bfs_visited.add(city)
        cities_explored.append(city)

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

            # Print results
            print(sep)
            print("BREADTH FIRST SEARCH")
            print(f"Time elapsed: {time_elapsed:.8f} seconds")
            print(sep)
            print(f"Path: {' -> '.join(path)}")
            print(f"Path length: {len(path)} cities")
            print(f"Cities explored: {len(cities_explored)}")
            print(f"Total road distance: {cost} km")
            print()
            return
        else:
            for next_city in romania_map[city]:
                if next_city not in bfs_visited:
                    bfs_frontier.append(next_city)
                    bfs_parent[next_city] = city

def depth_first_search(start, goal):
    timer_start = time.perf_counter()
    dfs_frontier = [start]
    dfs_visited = set()
    dfs_parent = {}
    cities_explored = []
    
    while dfs_frontier:
        city = dfs_frontier.pop()
        
        # Skip if already visited
        if city in dfs_visited:
            continue
            
        dfs_visited.add(city)
        cities_explored.append(city)

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

            # Print results
            print(sep)
            print("DEPTH FIRST SEARCH")
            print(f"Time elapsed: {time_elapsed:.8f} seconds")
            print(sep)
            print(f"Path: {' -> '.join(path)}")
            print(f"Path length: {len(path)} cities")
            print(f"Cities explored: {len(cities_explored)}")
            print(f"Total road distance: {cost} km")
            print()
            return
        
        else:
            # Get neighbors and add to frontier
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
    
    # Track the lowest g_score recorded for each city
    g_scores = {city: float('inf') for city in nodes_coordinates}
    g_scores[start] = 0
    
    # Set to keep track of visited nodes
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

def cheby_a_star(start_city, goal_city):
    """
    A* pathfinding using Chebyshev Distance as the heuristic.
    
    Parameters:
    - start_city: string (e.g., 'Arad')
    - goal_city: string (e.g., 'Bucharest')
    
    Returns:
    - path: list of cities from start to goal (or None if no path)
    - visited: list of cities explored
    - g_score: dict of actual costs from start to each city
    """
    
    # Start Timer
    timer_start = time.perf_counter()
    
    # Priority queue: (f_score, counter, city)
    open_set = []
    counter = 0
    
    # Get initial heuristic (Chebyshev)
    h_start = get_chebyshev_heuristic(start_city, goal_city)
    heapq.heappush(open_set, (h_start, counter, start_city))
    counter += 1
    
    # Track where we came from (for path reconstruction)
    came_from = {}
    
    # g_score: actual road cost from start to current city
    g_score = {start_city: 0}
    
    # f_score: g_score + heuristic
    f_score = {start_city: h_start}
    
    # Track visited nodes
    visited = []
    
    # PRINT HEADER
    print(sep)
    print("A* WITH CHEBYSHEV HEURISTIC")
    print(sep)
    print()
    print(sep)
    print("EXPLORATION STEPS")
    print(sep)
    print(f"{'Step':<6} {'City':<15} {'g(n)':<10} {'h(n)':<10} {'f(n)':<10} {'Action':<20}")
    print("-"*70)
    
    step = 0
    # A* LOOP
    
    while open_set:
        # Get city with lowest f_score
        current_f, _, current = heapq.heappop(open_set)
        
        # Skip if we already found a better path
        if current_f != f_score.get(current, float('inf')):
            continue
        
        visited.append(current)
        
        # Print current node exploration
        h_current = get_chebyshev_heuristic(current, goal_city)
        g_current = g_score[current]
        f_current = g_current + h_current
        print(f"{step:<6} {current:<15} {g_current:<10.2f} {h_current:<10.2f} {f_current:<10.2f} {'Exploring'}")
        step += 1
        
        # Check if we reached the goal
        if current == goal_city:
            timer_end = time.perf_counter()
            time_elapsed = timer_end - timer_start
            
            print(f"Time elapsed: {time_elapsed:.8f} seconds")
            print("-"*70)
            print(f"GOAL REACHED! ({current})")
            print()
            
            # Reconstruct path
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start_city)
            path.reverse()
            
            # PRINT RESULTS
            print(sep)
            print("RESULTS")
            print(sep)
            print(f"Path: {' → '.join(path)}")
            print(f"Path length: {len(path)} cities")
            print(f"Cities explored: {len(visited)}")
            print()
            
            # Calculate total road distance
            total_distance = 0
            for i in range(len(path) - 1):
                total_distance += romania_map[path[i]][path[i+1]]
            print(f"Total road distance: {total_distance} km")
            print()
            
            # Print detailed breakdown for each city in path
            print(sep)
            print("DETAILED BREAKDOWN (Path Cities)")
            print(sep)
            print(f"{'City':<20} {'g(n)':<12} {'h(n) (CD)':<15} {'f(n)':<12}")
            print("-"*70)
            for city in path:
                g = g_score.get(city, 0)
                h = get_chebyshev_heuristic(city, goal_city)
                f = g + h
                print(f"{city:<20} {g:<12.2f} {h:<15.2f} {f:<12.2f}")
            print()
            
            # Print heuristic values for all cities involved
            print(sep)
            print("HEURISTIC VALUES (Chebyshev to Goal)")
            print(sep)
            print(f"{'City':<20} {'h(n) = CD':<15}")
            print("-"*70)
            
            all_cities = set(visited + path)
            for city in sorted(all_cities):
                h = get_chebyshev_heuristic(city, goal_city)
                print(f"{city:<20} {h:<15.2f}")
            print()
            
            # Compare heuristic vs actual for path edges
            """
            print(sep)
            print("COMPARISON: Chebyshev vs Actual Road Distance")
            print(sep)
            print(f"{'Edge':<30} {'Road Distance':<20} {'CD Heuristic':<15} {'Difference':<12}")
            print("-"*70)
            for i in range(len(path) - 1):
                current_city = path[i]
                next_city = path[i+1]
                road_dist = romania_map[current_city][next_city]
                cd_dist = get_chebyshev_heuristic(current_city, next_city)
                diff = road_dist - cd_dist
                print(f"{current_city} → {next_city:<20} {road_dist:<20} {cd_dist:<15.2f} {diff:<12.2f}")
            print()
            """

            # RETURN RESULTS
            return path, visited, g_score
        
        # EXPLORE NEIGHBORS        
        for neighbor, road_distance in romania_map[current].items():
            # Calculate tentative g_score
            tentative_g = g_score[current] + road_distance
            
            # Only consider if this path is better
            if neighbor not in g_score or tentative_g < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                
                # h(n) = Chebyshev Distance
                h_neighbor = get_chebyshev_heuristic(neighbor, goal_city)
                f_neighbor = tentative_g + h_neighbor
                f_score[neighbor] = f_neighbor
                
                heapq.heappush(open_set, (f_neighbor, counter, neighbor))
                counter += 1
                
                # Print neighbor discovery
                print(f"{'':<6} {neighbor:<15} {tentative_g:<10.2f} {h_neighbor:<10.2f} {f_neighbor:<10.2f} {'→ Found via ' + current}")
    
    # NO PATH FOUND    
    print(sep)
    print("NO PATH FOUND!")
    print(sep)
    print(f"Cities explored: {len(visited)}")
    return None, visited, g_score

print()
breadth_first_search(start_city, goal_city)
depth_first_search(start_city, goal_city)
cheby_a_star(start_city, goal_city)
#greedy_best_first_search(start_city, goal_city)
#a_star_search(start_city, goal_city)