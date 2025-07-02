# Endpoints relacionados ao OCR tradicional

from flask import Blueprint, request, jsonify
import os
import uuid
import shutil
from werkzeug.utils import secure_filename
from config import Config

ocr_bp = Blueprint('ocr', __name__)

def allowed_file(filename):
    """Verifica se o arquivo tem extensão permitida"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def get_file_size_mb(file_path):
    """Retorna o tamanho do arquivo em MB"""
    return os.path.getsize(file_path) / (1024 * 1024)

@ocr_bp.route('/api/ocr-tesseract', methods=['POST'])
def ocr_tesseract():
    """Endpoint removido: OCR não está mais disponível."""
    return jsonify({'error': 'Funcionalidade de OCR removida. Só é possível processar PDFs com texto pesquisável.'}), 400

@ocr_bp.route('/api/ocr-traditional', methods=['POST'])
def ocr_traditional():
    """Endpoint para OCR Tradicional (apenas regex - sem Tesseract)"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        if not allowed_file(file.filename):
            return jsonify({'error': 'Apenas arquivos PDF são permitidos'}), 400
        
        original_filename = secure_filename(file.filename or 'unknown.pdf')
        file_id = str(uuid.uuid4())
        upload_filename = f"{file_id}_{original_filename}"
        upload_path = os.path.join(Config.UPLOAD_FOLDER, upload_filename)
        file.save(upload_path)
        
        # Retornar erro informando que OCR foi removido
        return jsonify({
            'success': False,
            'error': 'Funcionalidade de OCR removida',
            'message': 'Use o método ChatGPT para processar PDFs com texto pesquisável'
        }), 400
        
    except Exception as e:
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@ocr_bp.route('/api/extract-matricula/<filename>')
def extract_matricula_fields(filename):
    try:
        file_path = os.path.join(Config.PROCESSED_FOLDER, filename)
        if not os.path.exists(file_path):
            return jsonify({'error': 'Arquivo não encontrado'}), 404
        if not filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Apenas arquivos PDF são permitidos'}), 400
        
        # Retornar erro informando que OCR foi removido
        return jsonify({
            'success': False,
            'error': 'Funcionalidade de OCR removida',
            'message': 'Use o método ChatGPT para processar PDFs com texto pesquisável'
        }), 400
        
    except Exception as e:
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500 