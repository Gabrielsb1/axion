# Endpoints relacionados ao ChatGPT/OpenAI

from flask import Blueprint, request, jsonify
import os
import uuid
import shutil
import re
import tempfile
from werkzeug.utils import secure_filename
from ai.openai_service import extract_fields_with_openai
import PyPDF2
from config import Config

ai_bp = Blueprint('ai', __name__)

def allowed_file(filename):
    """Verifica se o arquivo tem extensão permitida"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

@ai_bp.route('/api/test-openai', methods=['GET'])
def test_openai():
    """Endpoint de teste para verificar se a API key da OpenAI está configurada"""
    try:
        if not Config.OPENAI_API_KEY or Config.OPENAI_API_KEY == 'CHAVE-AQUI':
            return jsonify({
                'error': 'API key da OpenAI não configurada',
                'message': 'Configure a variável de ambiente OPENAI_API_KEY no Render'
            }), 400
        
        # Teste simples com a API
        import openai
        try:
            # Tentar inicializar o cliente com configurações básicas
            client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)
            
            # Teste simples
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": "Responda apenas 'OK' se você está funcionando."}],
                temperature=0.0,
                max_tokens=10
            )
            
            return jsonify({
                'success': True,
                'message': 'API da OpenAI está funcionando',
                'response': response.choices[0].message.content
            })
            
        except Exception as openai_error:
            return jsonify({
                'error': f'Erro na comunicação com OpenAI: {str(openai_error)}',
                'api_key_configured': True,
                'suggestion': 'Verifique se a API key é válida e tem créditos disponíveis'
            }), 500
        
    except Exception as e:
        return jsonify({
            'error': f'Erro ao testar API da OpenAI: {str(e)}',
            'api_key_configured': bool(Config.OPENAI_API_KEY and Config.OPENAI_API_KEY != 'CHAVE-AQUI')
        }), 500

@ai_bp.route('/api/process-file', methods=['POST'])
def process_file_chatgpt():
    """Endpoint otimizado para processamento com ChatGPT - extrai texto diretamente do PDF"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        if not allowed_file(file.filename):
            return jsonify({'error': 'Apenas arquivos PDF são permitidos'}), 400
        
        # Verificar se a API key está configurada
        if not Config.OPENAI_API_KEY or Config.OPENAI_API_KEY == 'CHAVE-AQUI':
            return jsonify({
                'error': 'API key da OpenAI não configurada',
                'message': 'Configure a variável de ambiente OPENAI_API_KEY no Render'
            }), 400
        
        # Obter tipo de serviço
        service_type = request.form.get('service', 'matricula')
        print(f"🎯 Serviço recebido: {service_type}")
        
        original_filename = secure_filename(file.filename or 'unknown.pdf')
        file_id = str(uuid.uuid4())
        upload_filename = f"{file_id}_{original_filename}"
        upload_path = os.path.join(Config.UPLOAD_FOLDER, upload_filename)
        file.save(upload_path)
        
        # Extrair texto diretamente do PDF (sem OCR)
        text_content = ""
        try:
            with open(upload_path, 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)
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
        
        return jsonify({
            'success': True,
            'message': f'PDF processado e campos extraídos com ChatGPT ({service_type})!',
            'original_filename': original_filename,
            'file_id': file_id,
            'campos': campos,
            'model': model,
            'service_type': service_type,
            'text_length': len(text_content),
            'used_ocr_fallback': len(text_content.strip()) < 50
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500 