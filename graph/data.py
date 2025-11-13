def load_graph():
    """
    Função de exemplo que cria e retorna um grafo simples.
    No futuro, você pode substituir isso por dados vindos de um banco de dados ou arquivo JSON.
    """
    graph = {
        'A': {'B': 5, 'C': 2},
        'B': {'A': 5, 'D': 1},
        'C': {'A': 2, 'D': 7},
        'D': {'B': 1, 'C': 7}
    }
    return graph
