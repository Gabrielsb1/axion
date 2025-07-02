# Endpoints relacionados ao OCR tradicional

# (O conteúdo será movido do app_ocr_melhor.py) 

from flask import Blueprint, request, jsonify
import os
import uuid
import shutil
from werkzeug.utils import secure_filename
from ocr.ocr_service import allowed_file, get_file_size_mb, best_ocr_with_tesseract, UPLOAD_FOLDER, PROCESSED_FOLDER
from ocr.extract_fields import extract_matricula_3ri_fields

ocr_bp = Blueprint('ocr', __name__)

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
        upload_path = os.path.join(UPLOAD_FOLDER, upload_filename)
        file.save(upload_path)
        
        # Extrair campos diretamente com regex (sem OCR)
        campos = extract_matricula_3ri_fields(upload_path)
        
        if campos is None:
            return jsonify({
                'success': False,
                'error': 'Não foi possível extrair campos do PDF',
                'message': 'Verifique se o arquivo é uma matrícula 3º RI válida'
            }), 400
        
        campos_encontrados = sum(1 for v in campos.values() if v.strip())
        total_campos = len(campos)
        
        return jsonify({
            'success': True,
            'message': f'Campos extraídos com regex! ({campos_encontrados}/{total_campos} campos encontrados)',
            'original_filename': original_filename,
            'file_id': file_id,
            'campos': campos,
            'campos_encontrados': campos_encontrados,
            'total_campos': total_campos,
            'ocr_mode': 'regex_only'
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@ocr_bp.route('/api/extract-matricula/<filename>')
def extract_matricula_fields(filename):
    try:
        file_path = os.path.join(PROCESSED_FOLDER, filename)
        if not os.path.exists(file_path):
            return jsonify({'error': 'Arquivo não encontrado'}), 404
        if not filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Apenas arquivos PDF são permitidos'}), 400
        campos = extract_matricula_3ri_fields(file_path)
        if campos is None:
            return jsonify({
                'success': False,
                'error': 'Não foi possível extrair campos do PDF',
                'message': 'Verifique se o arquivo é uma matrícula 3º RI válida'
            }), 400
        campos_encontrados = sum(1 for v in campos.values() if v.strip())
        total_campos = len(campos)
        return jsonify({
            'success': True,
            'message': f'Campos extraídos com sucesso! ({campos_encontrados}/{total_campos} campos encontrados)',
            'filename': filename,
            'campos_encontrados': campos_encontrados,
            'total_campos': total_campos,
            'campos': campos
        })
    except Exception as e:
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500 