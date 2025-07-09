# Endpoints relacionados ao ChatGPT/OpenAI

from flask import Blueprint, request, jsonify
import os
import uuid
import shutil
import re
import tempfile
from werkzeug.utils import secure_filename
from ai.openai_service import extract_fields_with_openai
import pypdf
from config import Config
from security import secure_manager

ai_bp = Blueprint('ai', __name__)

def allowed_file(filename):
    """Verifica se o arquivo tem extensão permitida"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@ai_bp.route('/api/process-file', methods=['POST'])
def process_file_chatgpt():
    """Endpoint otimizado para processamento com ChatGPT - extrai texto diretamente do PDF"""
    temp_file_path = None
    user_ip = request.remote_addr
    
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        if not allowed_file(file.filename):
            return jsonify({'error': 'Apenas arquivos PDF são permitidos'}), 400
        
        # Obter tipo de serviço
        service_type = request.form.get('service', 'matricula')
        print(f"🎯 Serviço recebido: {service_type}")
        
        original_filename = secure_filename(file.filename or 'unknown.pdf')
        
        # Processar arquivo de forma segura
        if Config.SECURE_PROCESSING:
            temp_file_path, file_id = secure_manager.process_file_securely(
                file, original_filename, user_ip
            )
        else:
            # Fallback para processamento não seguro (apenas para compatibilidade)
            file_id = str(uuid.uuid4())
            upload_filename = f"{file_id}_{original_filename}"
            temp_file_path = os.path.join(Config.UPLOAD_FOLDER, upload_filename)
            file.save(temp_file_path)
        
        # Extrair texto diretamente do PDF (sem OCR)
        text_content = ""
        try:
            # Descriptografar se necessário
            if Config.SECURE_PROCESSING and Config.ENCRYPT_TEMP_FILES:
                temp_file_path = secure_manager.decrypt_file(temp_file_path)
            
            with open(temp_file_path, 'rb') as f:
                pdf_reader = pypdf.PdfReader(f)
                for page in pdf_reader.pages:
                    text_content += page.extract_text() + "\n"
        except Exception as e:
            return jsonify({'error': f'Erro ao extrair texto do PDF: {str(e)}'}), 500
        
        # Limpar e normalizar texto
        text_content = re.sub(r'\s+', ' ', text_content.replace('\n', ' ')).strip()
        
        # Se o texto estiver vazio, retornar erro (ChatGPT não usa OCR)
        if not text_content or len(text_content.strip()) < 50:
            return jsonify({
                'error': 'PDF não contém texto pesquisável. Use OCR Tesseract para PDFs escaneados.',
                'message': 'O ChatGPT funciona apenas com PDFs que já contêm texto.'
            }), 400
        
        # Obter modelo selecionado
        model = request.form.get('model', 'gpt-3.5-turbo')
        print(f"🎯 Modelo recebido no backend: {model}")
        
        # Extrair campos com OpenAI
        campos = extract_fields_with_openai(text_content, model=model, service_type=service_type)
        
        # Limpar arquivo temporário após processamento
        if Config.SECURE_PROCESSING and temp_file_path:
            secure_manager.cleanup_file(temp_file_path, user_ip)
        
        return jsonify({
            'success': True,
            'message': f'PDF processado e campos extraídos com ChatGPT ({service_type})!',
            'original_filename': original_filename,
            'file_id': file_id,
            'campos': campos,
            'model': model,
            'service_type': service_type,
            'text_length': len(text_content),
            'used_ocr_fallback': len(text_content.strip()) < 50,
            'secure_processing': Config.SECURE_PROCESSING
        })
        
    except Exception as e:
        # Garantir limpeza em caso de erro
        if Config.SECURE_PROCESSING and temp_file_path:
            secure_manager.cleanup_file(temp_file_path, user_ip)
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500 