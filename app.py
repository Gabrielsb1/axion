from flask import Flask, send_from_directory
from flask_cors import CORS
from api.routes_ai import ai_bp
from api.routes_utils import utils_bp
import os
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

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

# Endpoint de teste
@app.route('/api/test')
def test():
    logger.info("🧪 Endpoint de teste chamado")
    return {'status': 'ok', 'message': 'Aplicação funcionando'}

if __name__ == '__main__':
    logger.info("🚀 Iniciando servidor Flask Axion Modular...")
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"🌐 Servidor rodando na porta: {port}")
    app.run(host='0.0.0.0', port=port) 