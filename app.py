from flask import Flask, send_from_directory
from flask_cors import CORS
from api.routes_ai import ai_bp
from api.routes_utils import utils_bp
import os

app = Flask(__name__, static_folder='static')
CORS(app)

# Registrar blueprints
app.register_blueprint(ai_bp)
app.register_blueprint(utils_bp)

# Servir index.html
@app.route('/')
def index():
    static_folder = app.static_folder or 'static'
    return send_from_directory(static_folder, 'index.html')

# Servir arquivos estáticos
@app.route('/<path:filename>')
def static_files(filename):
    static_folder = app.static_folder or 'static'
    return send_from_directory(static_folder, filename)

if __name__ == '__main__':
    print("🚀 Iniciando servidor Flask Axion Modular...")
    print("🌐 Servidor rodando em: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000) 