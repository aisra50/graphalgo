from flask import Flask, request, jsonify, send_file
from graph.data import *
from graph.algorithms import *
from flask_cors import CORS
import matplotlib
import math
from collections import defaultdict

app = Flask(__name__)
CORS(app)

# Force matplotlib to not use any Xwindow/GUI backend
matplotlib.use('Agg')
# Carrega o grafo na inicialização do servidor

@app.route('/')
def home():
    return jsonify({"message": "Backend Moovit - API de Rotas ativa 🚀"})

@app.route('/rota', methods=['POST'])
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

@app.route('/ponto-encontro', methods=['POST'])
def ponto_encontro():
    '''
    {
        "casas-amigos": [201, 300, 504]
    }
    '''
    data = request.get_json()

    # Agora acessamos corretamente os campos
    casas_amigos = data.get('casas-amigos')

    if not casas_amigos or not isinstance(casas_amigos, list):
        return jsonify({
            "imagem": "Nada",
            "ponto-encontro": "Erro",
            "erro": "Parâmetro 'casas-amigos' é obrigatório e deve conter uma lista de ids"
        }), 400

    try:

        G = load_graph_from_db('dia')
        dist, nxt, nodes = floyd_warshall(G, weight="length")
        
        ponto_encontro = melhor_ponto_encontro(nodes, dist, casas_amigos)
        
        cor = defaultdict(lambda: 'gray')
        for casa in casas_amigos:
            cor[casa] = 'blue'
        cor[ponto_encontro] = 'red'

        node_colors = [cor[node] for node in G.nodes()]
        node_sizes = [0.5 if x == 'gray' else 150 for x in node_colors]

        G.graph["crs"] = "EPSG:4326"
        fig, ax = ox.plot_graph(
            G,
            bgcolor="w",
            node_size=node_sizes,             
            node_color=node_colors,   
            node_zorder=5,            
            edge_linewidth=0.5,
            edge_color="k",
            show=False,
            close=False
        )
        filename = 'rota.png'
        fig.savefig(filename, dpi=300, bbox_inches='tight')

        # Se quiser enviar a imagem como arquivo:
        # return send_file(filename, mimetype="image/png")

        # Se quiser enviar apenas a URL da imagem:
        return jsonify({
            "imagem": filename,
            "ponto-encontro": f'id:{ponto_encontro}'
        }), 200

    except Exception as e:
        return jsonify({
            "imagem": "Nada",
            "ponto-encontro": False,
            "erro": str(e)
        }), 500

def melhor_ponto_encontro(vertices, distancias, amigos):
    melhor_dist = float('inf')
    melhor_encontro = -1

    for vertice in vertices:
        dist_total = 0
        for amigo in amigos:
            if min(distancias[amigo][vertice], distancias[vertice][amigo]) != math.inf:
                dist_total += min(distancias[amigo][vertice], distancias[vertice][amigo])
        
        if dist_total < melhor_dist:
            melhor_dist = dist_total
            melhor_encontro = vertice
    return melhor_encontro

@app.route('/lugares')
def lugares():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, name 
        FROM vertices
        WHERE LENGTH(name) <> 0
    """)

    resultados = [
        {"nome": nome, "id": vid}
        for vid, nome in cur.fetchall()
    ]

    cur.close()
    conn.close()

    return jsonify({"lugares": resultados})

@app.route('/mensagem')
def mensagem():
    return "Esta é uma mensagem"

if __name__ == '__main__':
    app.run(debug=True)
