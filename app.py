from flask import Flask, request, jsonify, send_file
from graph.data import load_graph
from graph.algorithms import *
app = Flask(__name__)

# Carrega o grafo na inicialização do servidor
graph = load_graph()

@app.route('/')
def home():
    return jsonify({"message": "Backend Moovit - API de Rotas ativa 🚀"})

@app.route('/rota', methods=['GET'])
def rota():
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

@app.route('/teste')
def a():
    origem = request.args.get('origem')
    destino = request.args.get('destino')

    if not origem or not destino:
        return jsonify({"error": "Parâmetros 'origem' e 'destino' são obrigatórios."}), 400

    try:
        origem = int(origem)
        destino = int(destino)

        G = load_graph_from_db()
        caminho = dijkstra(G, origem, destino)

        if not caminho:
            return jsonify({"error": "Nenhum caminho encontrado."}), 404

        G.graph["crs"] = "EPSG:4326"

        filename = plot_route(G, caminho)

        # retorna a imagem salva
        return send_file(filename, mimetype="image/png")

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/mensagem')
def mensagem():
    return "Esta é uma mensagem"

if __name__ == '__main__':
    app.run(debug=True)
