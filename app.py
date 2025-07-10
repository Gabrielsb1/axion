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
from config import Config

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

if __name__ == '__main__':
    print("🚀 Iniciando servidor Flask Axion Modular...")
    
    # Verificar status do OCR
    try:
        from ai.ocr_service import OCR_AVAILABLE, TESSERACT_AVAILABLE
        print("\n🔍 Status do OCR:")
        print("=" * 40)
        
        if OCR_AVAILABLE:
            print("✅ ocrmypdf: Disponível")
        else:
            print("❌ ocrmypdf: Não disponível")
            
        if TESSERACT_AVAILABLE:
            print("✅ Tesseract: Disponível")
        else:
            print("❌ Tesseract: Não disponível")
            
        if OCR_AVAILABLE and TESSERACT_AVAILABLE:
            print("\n🎉 OCR totalmente funcional!")
        else:
            print("\n⚠️ OCR não está totalmente disponível")
            print("   Algumas funcionalidades podem não funcionar corretamente.")
            
    except Exception as e:
        print(f"⚠️ Erro ao verificar OCR: {e}")
    
    print("\n🌐 Servidor rodando em: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000) 