import osmnx as ox
import psycopg2
import networkx as nx
def populate():
    print("Baixando grafo...")
    G = ox.graph_from_place("Copacabana, Rio de Janeiro, Brazil", network_type="drive")


    print("Convertendo IDs do OSM → IDs pequenos...")
    osm_ids = list(G.nodes())
    mapping = {osm_id: i+1 for i, osm_id in enumerate(osm_ids)}  # 1..N
    G = nx.relabel_nodes(G, mapping)

    print("Conectando ao banco...")
    conn = psycopg2.connect("dbname=graphalgo user=gustavo")
    cur = conn.cursor()

    print("Inserindo vértices...")
    for node_id, data in G.nodes(data=True):
        cur.execute("""
            INSERT INTO vertices (id, name, latitude, longitude)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
        """, (node_id, f"node_{node_id}", data["y"], data["x"]))

    print("Inserindo modo de transporte...")

    for i in range(len(G.edges)):
        cur.execute("""
                INSERT INTO transport_types (id, type_name, avg_speed_kmh)
                VALUES (%s, %s, %s)
                RETURNING id
                """, (i,f'Moto-taxi{i}',100+i))
    
    j = 0
    print("Inserindo arestas...")
    for u, v, data in G.edges(data=True):
        if (u==v):
            continue
        cur.execute("""
            INSERT INTO edges (vertex_start_id, vertex_end_id,transport_type_id)
            VALUES (%s, %s, %s)
            RETURNING id;
        """, (u, v, j))
        j += 1
        edge_id = cur.fetchone()[0]

        length = data.get("length", 1.0)
        cur.execute("""
            INSERT INTO edge_attributes (edge_id, weight_distance, weight_time)
            VALUES (%s, %s, %s)
        """, (edge_id, length, length))

    conn.commit()
    cur.close()
    conn.close()
    print("Banco populado com sucesso!")

if __name__ == "__main__":
    populate()
