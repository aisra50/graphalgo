import heapq

def find_path(graph, origem, destino):
    """
    Algoritmo de Dijkstra para encontrar o menor caminho entre dois nós.

    Parâmetros:
        graph (dict): dicionário de adjacência, ex:
            {
                'A': {'B': 5, 'C': 2},
                'B': {'A': 5, 'D': 1},
                'C': {'A': 2, 'D': 7},
                'D': {'B': 1, 'C': 7}
            }
        origem (str): vértice inicial
        destino (str): vértice final

    Retorna:
        caminho (list): lista de vértices na ordem do trajeto
        distancia_total (float): custo total do caminho
    """

    if origem not in graph or destino not in graph:
        raise ValueError("Origem ou destino não existem no grafo.")

    # Distâncias iniciais: infinito para todos, 0 para origem
    dist = {node: float('inf') for node in graph}
    dist[origem] = 0

    # Dicionário para reconstruir o caminho
    anterior = {node: None for node in graph}

    # Fila de prioridade (min-heap)
    fila = [(0, origem)]  # (distância, nó)

    while fila:
        dist_atual, atual = heapq.heappop(fila)

        # Se chegamos ao destino, podemos encerrar
        if atual == destino:
            break

        # Se a distância for maior que o registro atual, ignore (nó desatualizado)
        if dist_atual > dist[atual]:
            continue

        # Percorre vizinhos
        for vizinho, peso in graph[atual].items():
            nova_dist = dist_atual + peso

            # Relaxamento da aresta
            if nova_dist < dist[vizinho]:
                dist[vizinho] = nova_dist
                anterior[vizinho] = atual
                heapq.heappush(fila, (nova_dist, vizinho))

    # Reconstruir o caminho
    caminho = []
    atual = destino
    while atual is not None:
        caminho.insert(0, atual)
        atual = anterior[atual]

    # Se o destino for inalcançável
    if dist[destino] == float('inf'):
        raise ValueError(f"Não existe caminho entre {origem} e {destino}.")

    return caminho, dist[destino]
