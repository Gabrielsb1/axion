# Endpoints utilitários (health, download, etc)

from flask import Blueprint, jsonify, send_file, current_app
import os
from config import Config
from datetime import datetime

utils_bp = Blueprint('utils', __name__)

@utils_bp.route('/api/download/<filename>')
def download_file(filename):
    try:
        file_path = os.path.join(Config.PROCESSED_FOLDER, filename)
        if not os.path.exists(file_path):
            return jsonify({'error': 'Arquivo não encontrado'}), 404
        if not filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Apenas arquivos PDF são permitidos'}), 400
        return send_file(
            file_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
    except Exception as e:
        return jsonify({'error': f'Erro no download: {str(e)}'}), 500

@utils_bp.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '8.0.0',
        'mode': 'chatgpt_only',
        'message': 'Sistema funcionando apenas com ChatGPT (OCR removido)',
        'features': {
            'chatgpt_processing': True,
            'ocr_processing': False,
            'pdf_text_extraction': True
        }
    })

# Handlers de erro
@utils_bp.app_errorhandler(413)
def too_large(e):
    return jsonify({'error': 'Arquivo muito grande. Tamanho máximo: 50MB'}), 413

@utils_bp.app_errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint não encontrado'}), 404

@utils_bp.app_errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Erro interno do servidor'}), 500 