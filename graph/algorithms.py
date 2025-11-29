import networkx as nx
import matplotlib.pyplot as plt
import osmnx as ox
from shapely.geometry import LineString
import heapq
import math

def dijkstra(G,source, target, weight="length"):

    # distância inicial infinita
    dist = {node: math.inf for node in G.nodes()}
    dist[source] = 0
    
    # predecessor para reconstruir a rota
    prev = {}
    
    # min-heap (priority queue)
    pq = [(0, source)]

    while pq:
        current_dist, u = heapq.heappop(pq)

        # se já achamos o destino, pode parar
        if u == target:
            break

        # ignora estados piores
        if current_dist > dist[u]:
            continue

        # percorre as arestas
        for v in G.neighbors(u):
            # MultiDiGraph pode ter várias arestas u->v
            # pega a menor delas
            min_weight = math.inf
            for key in G[u][v]:
                w = G[u][v][key].get(weight, 1.0)
                if w < min_weight:
                    min_weight = w

            alt = current_dist + min_weight

            if alt < dist[v]:
                dist[v] = alt
                prev[v] = u
                heapq.heappush(pq, (alt, v))

    # reconstrução do caminho
    if target not in prev and source != target:
        return None  # sem rota

    path = []
    u = target
    while True:
        path.append(u)
        if u == source:
            break
        u = prev[u]

    path.reverse()
    return path

def plot_route(G, route, filename="rota.png"):
    # garantir que pasta existe

    # gerar figura do OSMnx
    fig, ax = ox.plot_graph_route(
        G,
        route,
        route_color="red",
        route_linewidth=3,
        node_size=0,
        bgcolor="white",
        show=False,   # NÃO mostra na tela
        close=False   # NÃO fecha a figura automaticamente
    )

    # salvar imagem
    fig.savefig(filename, dpi=150, bbox_inches="tight")
    plt.close(fig)  # fechar para não vazar memória
    return filename

def plot_graph(G): #Mostra a imagem do bairro
    ox.plot_graph(
        G,
        bgcolor="white",
        node_size=3,
        node_color="black",
        edge_color="gray",
        edge_linewidth=0.7,
        show=True,
        close=True
    )
