from flask import Flask, request, jsonify, send_file
from graph.data import *
from graph.algorithms import *

app = Flask(__name__)

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
