# Only Backend in this version!
import time
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

start_city = input("Start city: ")
goal_city = input("Destination city: ")

if start_city not in romania_map:
    print("Invalid start city")
    exit()

if goal_city not in romania_map:
    print("Invalid destination city")
    exit()

sep = "====================="

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

BFS(start_city, goal_city)
DFS(start_city, goal_city)