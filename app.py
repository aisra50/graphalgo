from flask import Flask, request, jsonify, send_file
from graph.data import *
from graph.algorithms import *

app = Flask(__name__)

def get_special_points():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, name, latitude, longitude 
        FROM vertices
        WHERE especial = TRUE
    """)
    data = [
        {"id": vid, "name": name, "x": lon, "y": lat}
        for vid, name, lat, lon in cur.fetchall()
    ]

    cur.close()
    conn.close()
    return data
# Carrega o grafo na inicialização do servidor

@app.route('/')
def home():
    return jsonify({"message": "Backend Moovit - API de Rotas ativa 🚀"})

@app.route('/rota', methods=['GET'])
def rota():
    ""
    "{"
    " Origem : 123"
    " Destino: 321"
    " turno: dia / noite"
    "}"
    origem = request.args.get('origem')
    destino = request.args.get('destino')

    if not origem or not destino:
        return jsonify({"error": "Parâmetros 'origem' e 'destino' são obrigatórios."}), 400

    try:
        caminho, distancia = dijkstra(origem, destino)
        return jsonify({
            "origem": origem,
            "destino": destino,
            "caminho": caminho,
            "distancia_total": distancia
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/caminho-minimo', methods=['POST'])
def caminho_minimo():
    '''
        {
            origem: id
            destino: id
            turno: dia ou noite
        }
    '''
    data = request.get_json()

    # Agora acessamos corretamente os campos
    origem = data.get('origem')
    destino = data.get('destino')
    turno = data.get('turno')

    if not origem or not destino:
        return jsonify({
            "img_url": "Nada",
            "existe_caminho": False,
            "erro": "Parâmetros 'origem' e 'destino' são obrigatórios."
        }), 400

    try:
        origem = int(origem)
        destino = int(destino)

        G = load_graph_from_db(turno)
        caminho = dijkstra(G, origem, destino)

        # Se não existir caminho
        if not caminho:
            return jsonify({
                "img_url": "Nada",
                "existe_caminho": False
            }), 200

        # Adiciona CRS se necessário
        G.graph["crs"] = "EPSG:4326"

        filename = plot_route(G, caminho)

        # Se quiser enviar a imagem como arquivo:
        # return send_file(filename, mimetype="image/png")

        # Se quiser enviar apenas a URL da imagem:
        return jsonify({
            "img_url": filename,
            "existe_caminho": True
        }), 200

    except Exception as e:
        return jsonify({
            "img_url": "Nada",
            "existe_caminho": False,
            "erro": str(e)
        }), 500


@app.route('/lugares')
def lugares():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, name 
        FROM vertices
        WHERE especial = TRUE;
    """)

    resultados = [
        {"name": name, "id": vid}
        for vid, name in cur.fetchall()
    ]

    cur.close()
    conn.close()

    return jsonify({"lugares": resultados})

@app.route("/ponto-encontro", methods=["POST"])
def ponto_encontro():
    try:
        data = request.get_json()
        casas = data.get("casas-amigos")
        
        if not casas or not isinstance(casas, list):
            return jsonify({"error": "Envie { 'casas-amigos': [id1, id2...] }"}), 400

        # 1. Carregar grafo
        G = load_graph_from_db()

        # 2. Floyd–Warshall (todas-distâncias)
        dist = dict(nx.floyd_warshall(G, weight="weight"))

        # 3. Verificar se todos os vértices existem
        missing = [c for c in casas if c not in G]
        if missing:
            return jsonify({"error": f"Vértices inválidos: {missing}"}), 400

        # 4. Encontrar o ponto E com menor soma de distâncias
        melhor_vertice = None
        melhor_soma = float("inf")

        for v in G.nodes():
            soma = 0
            ok = True
            for c in casas:
                d = dist[c].get(v, float("inf"))
                if d == float("inf"):
                    ok = False
                    break
                soma += d
            if ok and soma < melhor_soma:
                melhor_soma = soma
                melhor_vertice = v

        if melhor_vertice is None:
            return jsonify({"error": "Não existe ponto acessível a todos."}), 404

        # 5. Achar ponto especial mais próximo
        especiais = get_special_points()
        menor_dist_esp = float("inf")
        melhor_especial = None

        for esp in especiais:
            d = dist[melhor_vertice].get(esp["id"], float("inf"))
            if d < menor_dist_esp:
                menor_dist_esp = d
                melhor_especial = esp
        print("oi",type(melhor_vertice))
        # 6. Gerar imagem destacando o ponto
        filename = plot_meeting_point(G, melhor_vertice)
        print("oi")
        # Coordenadas
        x = G.nodes[melhor_vertice]["x"]
        y = G.nodes[melhor_vertice]["y"]
        
        descricao = f"({y:.6f}, {x:.6f})"
        if melhor_especial:
            descricao += f", próximo a {melhor_especial['name']}"
        return jsonify({
            "imagem": f"{filename}",
            "ponto-encontro": descricao
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/ida-e-volta", methods=["POST"])
def ida_e_volta():
    data = request.get_json()
    ponto = data.get("ponto-encontro")
    amigos = data.get("casas-amigos")

    if ponto is None or not amigos:
        return jsonify({"error": "ponto-encontro e casas-amigos são obrigatórios"}), 400

    # 1. Carregar grafos
    G_dia = load_graph_from_db("dia")       # usado para ida
    G_noite = load_graph_from_db("noite")   # usado para volta

    # ----------------------------
    # 2. VERIFICAR IDA (dia): A -> ponto
    # ----------------------------
    ida_falha = []
    for amigo in amigos:
        try:
            nx.shortest_path(G_dia, source=amigo, target=ponto, weight="weight")
        except nx.NetworkXNoPath:
            ida_falha.append(amigo)

    # ----------------------------
    # 3. VERIFICAR VOLTA (noite): ponto -> A
    # ----------------------------
    volta_falha = []
    for amigo in amigos:
        try:
            nx.shortest_path(G_noite, source=ponto, target=amigo, weight="weight")
        except nx.NetworkXNoPath:
            volta_falha.append(amigo)

    # ----------------------------
    # 4. CASO TODOS CONSIGAM
    # ----------------------------
    if not ida_falha and not volta_falha:
        return jsonify({
            "possivel": True,
            "ida": "ok",
            "volta": "ok"
        })

    # ----------------------------
    # 5. CASO NÃO CONSIGAM: retornar lista de quem falha
    # ----------------------------
    conn = get_connection()
    cur = conn.cursor()

    impossiveis = list(set(ida_falha + volta_falha))
    names = []

    if impossiveis:
        placeholders = ",".join(["%s"] * len(impossiveis))
        cur.execute(f"SELECT id, name FROM vertices WHERE id IN ({placeholders})", impossiveis)
        names = [{"id": row[0], "name": row[1]} for row in cur.fetchall()]


    conn.close()

    return jsonify({
        "possivel": False,
        "faltam_ida": ida_falha,
        "faltam_volta": volta_falha,
        "amigos": names
    })


@app.route('/mensagem')
def mensagem():
    return "Esta é uma mensagem"

if __name__ == '__main__':
    app.run(debug=True)
