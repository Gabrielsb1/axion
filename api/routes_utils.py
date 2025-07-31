# Endpoints utilitários (health, download, etc)

from flask import Blueprint, jsonify, send_file, current_app, request
import os
import uuid
import tempfile
from datetime import datetime
from config import Config
from security import secure_manager
from ai.ocr_service import process_pdf_with_ocr, extract_text_from_pdf, get_ocr_info, is_pdf_signed
import logging

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

@utils_bp.route('/api/ocr', methods=['POST'])
def process_ocr():
    """Endpoint para processar PDFs com OCR - Nova implementação com detecção de assinatura digital"""
    temp_input_path = None
    temp_output_path = None
    user_ip = request.remote_addr
    
    try:
        # Verificar se arquivo foi enviado
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        
        # Verificar extensão
        if not file.filename or not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Apenas arquivos PDF são permitidos'}), 400
        
        # Processar arquivo de forma segura
        original_filename = file.filename
        if Config.SECURE_PROCESSING:
            temp_input_path, file_id = secure_manager.process_file_securely(
                file, original_filename, user_ip
            )
        else:
            file_id = str(uuid.uuid4())
            temp_input_path = os.path.join(Config.UPLOAD_FOLDER, f"{file_id}_{original_filename}")
            file.save(temp_input_path)
        
        # Verificar se já existe um arquivo OCR para este file_id
        output_filename = f"ocr_{file_id}_{original_filename}"
        temp_output_path = os.path.join(Config.TEMP_DIRECTORY, output_filename)
        
        if os.path.exists(temp_output_path):
            # Se o arquivo já existe, retornar sucesso sem reprocessar
            ocr_info = get_ocr_info(temp_output_path)
            return jsonify({
                'success': True,
                'message': 'Arquivo OCR já processado anteriormente',
                'file_id': file_id,
                'original_filename': original_filename,
                'output_filename': output_filename,
                'processing_time': 0,
                'pages_processed': ocr_info.get('pages', 0),
                'ocr_info': ocr_info,
                'secure_processing': Config.SECURE_PROCESSING,
                'cached': True
            })
        
        # Descriptografar se necessário
        if Config.SECURE_PROCESSING and Config.ENCRYPT_TEMP_FILES:
            temp_input_path = secure_manager.decrypt_file(temp_input_path)
        
        # Verificar se o PDF tem assinatura digital
        has_signature = is_pdf_signed(temp_input_path)
        
        # Processar com nova implementação OCR
        result = process_pdf_with_ocr(temp_input_path, temp_output_path)
        
        if not result['success']:
            return jsonify({'error': result['error']}), 500
        
        # Obter informações do resultado
        ocr_info = get_ocr_info(temp_output_path)
        
        return jsonify({
            'success': True,
            'message': result['message'],
            'file_id': file_id,
            'original_filename': original_filename,
            'output_filename': output_filename,
            'processing_time': result['processing_time'],
            'pages_processed': result.get('pages_processed', 0),
            'ocr_info': ocr_info,
            'has_signature': has_signature,
            'secure_processing': Config.SECURE_PROCESSING
        })
        
    except Exception as e:
        # Garantir limpeza em caso de erro
        if Config.SECURE_PROCESSING:
            if temp_input_path:
                secure_manager.cleanup_file(temp_input_path, user_ip)
            if temp_output_path:
                secure_manager.cleanup_file(temp_output_path, user_ip)
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@utils_bp.route('/api/ocr/download/<file_id>', methods=['GET'])
def download_ocr_result(file_id):
    """Download do resultado do OCR"""
    try:
        # Construir nome do arquivo
        filename = request.args.get('filename', 'ocr_result.pdf')
        
        # Caminho do arquivo - usar o diretório temporário correto
        file_path = os.path.join(Config.TEMP_DIRECTORY, f"ocr_{file_id}_{filename}")
        
        print(f"🔍 Tentando download OCR - file_id: {file_id}, filename: {filename}")
        print(f"📁 Caminho do arquivo: {file_path}")
        
        # Verificar se o arquivo existe
        if not os.path.exists(file_path):
            print(f"❌ Arquivo não encontrado em: {file_path}")
            # Tentar procurar no diretório de uploads como fallback
            fallback_path = os.path.join(Config.UPLOAD_FOLDER, f"ocr_{file_id}_{filename}")
            print(f"🔍 Tentando fallback em: {fallback_path}")
            if os.path.exists(fallback_path):
                file_path = fallback_path
                print(f"✅ Arquivo encontrado no fallback: {file_path}")
            else:
                print(f"❌ Arquivo não encontrado em nenhum local")
                return jsonify({'error': f'Arquivo não encontrado: {file_path}'}), 404
        else:
            print(f"✅ Arquivo encontrado: {file_path}")
        
        return send_file(
            file_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
        
    except Exception as e:
        return jsonify({'error': f'Erro no download: {str(e)}'}), 500

@utils_bp.route('/api/ocr/text/<file_id>', methods=['GET'])
def download_ocr_text(file_id):
    """Download do texto extraído do OCR"""
    try:
        # Construir nome do arquivo
        filename = request.args.get('filename', 'ocr_result.pdf')
        
        # Caminho do arquivo - usar o diretório temporário correto
        file_path = os.path.join(Config.TEMP_DIRECTORY, f"ocr_{file_id}_{filename}")
        
        # Verificar se o arquivo existe
        if not os.path.exists(file_path):
            # Tentar procurar no diretório de uploads como fallback
            fallback_path = os.path.join(Config.UPLOAD_FOLDER, f"ocr_{file_id}_{filename}")
            if os.path.exists(fallback_path):
                file_path = fallback_path
            else:
                return jsonify({'error': f'Arquivo não encontrado: {file_path}'}), 404
        
        # Extrair texto
        text = extract_text_from_pdf(file_path)
        
        # Criar arquivo temporário com o texto
        temp_text_file = os.path.join(Config.TEMP_DIRECTORY, f"text_{file_id}.txt")
        with open(temp_text_file, 'w', encoding='utf-8') as f:
            f.write(text)
        
        return send_file(
            temp_text_file,
            as_attachment=True,
            download_name=f"texto_extraido_{file_id}.txt",
            mimetype='text/plain'
        )
        
    except Exception as e:
        return jsonify({'error': f'Erro ao extrair texto: {str(e)}'}), 500

@utils_bp.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '8.0.0',
        'mode': 'chatgpt_and_ocr',
        'message': 'Sistema funcionando com ChatGPT e OCR',
        'features': {
            'ocr': True,
            'chatgpt': True,
            'signature_detection': True,
            'secure_processing': Config.SECURE_PROCESSING
        }
    })

@utils_bp.app_errorhandler(413)
def too_large(e):
    return jsonify({'error': 'Arquivo muito grande'}), 413

@utils_bp.app_errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint não encontrado'}), 404

@utils_bp.app_errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Erro interno do servidor'}), 500 