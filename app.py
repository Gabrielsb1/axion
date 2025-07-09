"""
AxionDocs - Sistema OCR integrado com API OpenAI
Desenvolvido por João Gabriel Santos Barros (2025)

Licenciado sob MIT License - consulte LICENSE.txt

Este software é fornecido "no estado em que se encontra", sem garantias.

O uso da API OpenAI requer chave configurada via variável de ambiente: OPENAI_API_KEY.
Os custos gerados são responsabilidade do usuário da chave.

Projeto iniciado como parte do TCC no Cartório de Registro de Imóveis de São Luís.
"""
from flask import Flask, send_from_directory
from flask_cors import CORS
from api.routes_ai import ai_bp
from api.routes_utils import utils_bp
import os
import atexit
from config import Config
from security import secure_manager

app = Flask(__name__, static_folder='static')
CORS(app)

# Inicializar configurações
Config.init_app(app)

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

def cleanup_on_exit():
    """Função de limpeza executada ao encerrar o aplicativo"""
    print("🧹 Executando limpeza de segurança...")
    if Config.SECURE_PROCESSING:
        secure_manager.stop_cleanup_thread()
        # Limpar todos os arquivos temporários
        if os.path.exists(Config.TEMP_DIRECTORY):
            for filename in os.listdir(Config.TEMP_DIRECTORY):
                file_path = os.path.join(Config.TEMP_DIRECTORY, filename)
                if os.path.isfile(file_path):
                    secure_manager.secure_delete(file_path)
    print("✅ Limpeza de segurança concluída")

# Registrar função de limpeza
atexit.register(cleanup_on_exit)

if __name__ == '__main__':
    print("🚀 Iniciando servidor Flask Axion Modular...")
    print("🔒 Modo de segurança ativado" if Config.SECURE_PROCESSING else "⚠️ Modo de segurança desativado")
    print("🌐 Servidor rodando em: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000) 