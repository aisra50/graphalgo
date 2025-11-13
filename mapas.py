import osmnx as ox
import networkx as nx
# Baixa o grafo de ruas da cidade (modo "drive" = ruas para veículos)
def bairro(bairro = "Copacabana, Rio de Janeiro, Brazil"):
    G = ox.graph_from_place(bairro, network_type="drive")

    # Exibe informações básicas
    print("Nós:", len(G.nodes))
    print("Arestas:", len(G.edges))

    ox.plot_graph(G)
    origem = list(G.nodes())[0]
    destino = list(G.nodes())[50]

    # Caminho mais curto (por distância)
    rota = nx.shortest_path(G, origem, destino, weight='length')
    distancia = nx.shortest_path_length(G, origem, destino, weight='length')

    print("Caminho:", rota)
    print("Distância total (m):", distancia)

    ox.plot_graph_route(G, rota, route_linewidth=4, node_size=0)
    return G
def coords(x,y):
    centro = (x,y)  # Exemplo: CCMN

    # Baixa ruas num raio de 100 m a partir do ponto central
    G = ox.graph_from_point(centro, dist=1000, network_type="drive")

    ox.plot_graph(G)
    return G

def osm_to_dict(G):
    graph_dict = {}
    for u, v, data in G.edges(data=True):
        distance = data.get('length', 1)  # pega a distância da aresta
        if u not in graph_dict:
            graph_dict[u] = {}
        graph_dict[u][v] = distance

        # Se o grafo não for direcionado, adiciona o caminho reverso
        if not G.is_directed():
            if v not in graph_dict:
                graph_dict[v] = {}
            graph_dict[v][u] = distance
    return graph_dict

G = bairro()
graph = osm_to_dict(G)
