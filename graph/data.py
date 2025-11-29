# Arquivo para funções que envolvam conectar com o banco de dados
db = "graphalgo" #Nome do banco de dados
user = "gustavo" #Nome do usuário

import psycopg2
import networkx as nx

def get_connection():
    return psycopg2.connect(f"dbname={db} user={user}")

def load_graph_from_db(turno='dia'):

    # Mapeamento do parâmetro para o id do período no BD
    # Ajuste se você mudar no banco
    periodo_id = {
        'dia': 0,
        'noite': 1
    }.get(turno.lower())

    if periodo_id is None:
        raise ValueError(f"Turno inválido: {turno}. Use 'dia' ou 'noite'")

    G = nx.MultiDiGraph()
    G.graph["crs"] = "EPSG:4326"

    conn = get_connection()
    cur = conn.cursor()

    # Carregar vértices
    cur.execute("SELECT id, latitude, longitude FROM vertices")
    for node_id, lat, lon in cur.fetchall():
        G.add_node(node_id, y=lat, x=lon)

    # Carregar arestas APENAS do período solicitado
    cur.execute("""
        SELECT 
            e.id, 
            e.vertex_start_id, 
            e.vertex_end_id,
            a.weight_distance
        FROM edges e
        JOIN edge_attributes a ON e.id = a.edge_id
        WHERE a.time_period_id = %s
    """, (periodo_id,))

    for edge_id, u, v, weight in cur.fetchall():
        G.add_edge(
            u,
            v,
            key=edge_id,
            length=weight
        )

    cur.close()
    conn.close()

    return G

