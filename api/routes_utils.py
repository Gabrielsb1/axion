# Endpoints utilitários (health, download, etc)

# (O conteúdo será movido do app_ocr_melhor.py)

from flask import Blueprint, jsonify, send_file, current_app
import os
from ocr.ocr_service import PROCESSED_FOLDER
from ocr.ocr_service import check_tesseract, check_ghostscript
from datetime import datetime

utils_bp = Blueprint('utils', __name__)

@utils_bp.route('/api/download/<filename>')
def download_file(filename):
    try:
        file_path = os.path.join(PROCESSED_FOLDER, filename)
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
    tesseract_available = check_tesseract()
    ghostscript_available = check_ghostscript()
    languages_available = []
    if tesseract_available:
        import subprocess
        try:
            result = subprocess.run(['tesseract', '--list-langs'], 
                                  capture_output=True, text=True, timeout=10)
            available_langs = result.stdout.strip().split('\n')[1:]
            languages_available = [lang for lang in available_langs if lang and not lang.startswith('script')]
        except:
            pass
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '7.0.0',
        'tesseract_available': tesseract_available,
        'ghostscript_available': ghostscript_available,
        'portuguese_available': 'por' in languages_available,
        'languages_count': len(languages_available),
        'mode': 'best_ocr_portuguese',
        'message': 'Sistema funcionando com OCR MELHOR em português'
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