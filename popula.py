import osmnx as ox
import psycopg2

def populate():
    print("Baixando grafo...")
    G = ox.graph_from_place("Vila Mariana, São Paulo, Brasil", network_type="drive")

    print("Conectando ao banco...")
    conn = psycopg2.connect("dbname=route user=gustavo")  # sem password se seu Postgres não usa
    cur = conn.cursor()

    # Inserir vértices
    print("Inserindo vértices...")
    for node_id, data in G.nodes(data=True):
        cur.execute("""
            INSERT INTO vertices (id, lat, lon)
            VALUES (%s, %s, %s)
            ON CONFLICT DO NOTHING
        """, (node_id, data["y"], data["x"]))

    # Inserir arestas
    print("Inserindo arestas e atributos...")
    for u, v, data in G.edges(data=True):
        cur.execute("""
            INSERT INTO edges (vertex_from, vertex_to)
            VALUES (%s, %s)
            RETURNING id;
        """, (u, v))
        edge_id = cur.fetchone()[0]

        # atributos
        length = data.get("length", 1.0)

        cur.execute("""
            INSERT INTO edge_attributes (edge_id, walk_weight)
            VALUES (%s, %s)
        """, (edge_id, length))

    conn.commit()
    cur.close()
    conn.close()
    print("Banco populado com sucesso!")

if __name__ == "__main__":
    populate()
