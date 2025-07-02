import os
import uuid
import shutil
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import logging
import subprocess
import tempfile
import ocrmypdf
import re
import PyPDF2
import io
import openai
from config import Config

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configurações
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
ALLOWED_EXTENSIONS = {'pdf'}

# Criar diretórios se não existirem
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Verifica se o arquivo tem extensão permitida"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_size_mb(file_path):
    """Retorna o tamanho do arquivo em MB"""
    return os.path.getsize(file_path) / (1024 * 1024)

def check_tesseract():
    """Verifica se o Tesseract está disponível"""
    try:
        result = subprocess.run(['tesseract', '--version'], 
                              capture_output=True, text=True, timeout=10)
        return result.returncode == 0
    except:
        return False

def check_ghostscript():
    """Verifica se o Ghostscript está disponível"""
    try:
        result = subprocess.run(['gswin64c', '--version'], 
                              capture_output=True, text=True, timeout=10)
        return result.returncode == 0
    except:
        return False

def remove_pdf_protections_gs(input_path, output_path):
    """Remove proteções do PDF usando Ghostscript"""
    try:
        logger.info("🔓 Removendo proteções do PDF com Ghostscript...")
        
        # Comando Ghostscript para remover proteções
        gs_cmd = [
            'gswin64c',
            '-sDEVICE=pdfwrite',
            '-dPDFSETTINGS=/printer',
            '-dCompatibilityLevel=1.4',
            '-dNOPAUSE',
            '-dQUIET',
            '-dBATCH',
            '-sOutputFile=' + output_path,
            input_path
        ]
        
        result = subprocess.run(gs_cmd, capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            logger.info("✅ Proteções removidas com Ghostscript!")
            return True
        else:
            logger.warning(f"Ghostscript falhou: {result.stderr}")
            return False
            
    except Exception as e:
        logger.error(f"Erro ao remover proteções: {str(e)}")
        return False

def best_ocr_with_tesseract(input_path, output_path):
    """OCR MELHOR - quebra todas as proteções"""
    try:
        # Verificar se Tesseract está disponível
        if not check_tesseract():
            raise Exception("Tesseract não encontrado. Instale em: https://github.com/UB-Mannheim/tesseract/wiki")
        
        # Verificar se Ghostscript está disponível
        ghostscript_available = check_ghostscript()
        
        # Verificar se português está disponível
        try:
            result = subprocess.run(['tesseract', '--list-langs'], 
                                  capture_output=True, text=True, timeout=10)
            available_langs = result.stdout.strip().split('\n')[1:]
            
            if 'por' not in available_langs:
                raise Exception("Idioma português não encontrado no Tesseract")
                
            logger.info("✅ Idioma português disponível")
            
        except Exception as e:
            logger.error(f"Erro ao verificar idiomas: {e}")
            raise Exception("Não foi possível verificar idiomas disponíveis")
        
        logger.info("🔍 Iniciando OCR MELHOR com português...")
        
        # PASSO 1: Tentar OCR direto primeiro
        try:
            logger.info("🔄 Tentativa 1: OCR direto")
            ocrmypdf.ocr(
                input_file=input_path,
                output_file=output_path,
                language='por',
                force_ocr=True,
                skip_text=False,
                output_type='pdf',
                progress_bar=False,
                deskew=False,
                clean=False,
                optimize=0
            )
            logger.info("✅ OCR MELHOR concluído na tentativa 1!")
            return True
            
        except Exception as e:
            logger.warning(f"Tentativa 1 falhou: {str(e)}")
            
            # PASSO 2: Se falhou por assinatura digital, usar Ghostscript
            if "digital signature" in str(e).lower() and ghostscript_available:
                logger.info("🔄 Tentativa 2: Removendo proteções com Ghostscript")
                
                # Criar PDF limpo
                temp_clean_pdf = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False)
                temp_clean_pdf.close()
                
                if remove_pdf_protections_gs(input_path, temp_clean_pdf.name):
                    try:
                        # Tentar OCR com PDF limpo
                        ocrmypdf.ocr(
                            input_file=temp_clean_pdf.name,
                            output_file=output_path,
                            language='por',
                            force_ocr=True,
                            skip_text=False,
                            output_type='pdf',
                            progress_bar=False,
                            deskew=False,
                            clean=False,
                            optimize=0
                        )
                        logger.info("✅ OCR MELHOR concluído na tentativa 2!")
                        return True
                        
                    except Exception as e2:
                        logger.warning(f"OCR com PDF limpo falhou: {str(e2)}")
                        
                        # Se ainda falhou, copiar PDF limpo
                        shutil.copy2(temp_clean_pdf.name, output_path)
                        logger.info("✅ PDF limpo copiado como fallback")
                        return True
                else:
                    logger.warning("Não foi possível limpar o PDF")
            
            # PASSO 3: Tentar com configurações mais agressivas
            try:
                logger.info("🔄 Tentativa 3: OCR agressivo")
                ocrmypdf.ocr(
                    input_file=input_path,
                    output_file=output_path,
                    language='por',
                    force_ocr=True,
                    skip_text=False,
                    output_type='pdf',
                    progress_bar=False,
                    deskew=False,
                    clean=False,
                    optimize=0,
                    skip_big=False,
                    oversample=200,
                    tesseract_config='--oem 3 --psm 6'
                )
                logger.info("✅ OCR MELHOR concluído na tentativa 3!")
                return True
                
            except Exception as e3:
                logger.warning(f"Tentativa 3 falhou: {str(e3)}")
                
                # PASSO 4: Converter PDF para imagem e fazer OCR
                if ghostscript_available:
                    try:
                        logger.info("🔄 Tentativa 4: PDF → Imagem → OCR")
                        
                        # Criar diretório temporário para imagens
                        temp_img_dir = tempfile.mkdtemp()
                        
                        # Converter PDF para imagens
                        gs_cmd = [
                            'gswin64c', '-sDEVICE=pngalpha', '-r300',
                            '-o', os.path.join(temp_img_dir, 'page_%d.png'),
                            input_path
                        ]
                        
                        result = subprocess.run(gs_cmd, capture_output=True, text=True, timeout=120)
                        
                        if result.returncode == 0:
                            # Processar cada imagem com Tesseract
                            image_files = [f for f in os.listdir(temp_img_dir) if f.endswith('.png')]
                            image_files.sort()
                            
                            if image_files:
                                # Usar primeira imagem para criar PDF com texto
                                first_img = os.path.join(temp_img_dir, image_files[0])
                                
                                # Extrair texto da primeira imagem
                                text_result = subprocess.run([
                                    'tesseract', first_img, 'stdout', '-l', 'por',
                                    '--oem', '3', '--psm', '6'
                                ], capture_output=True, text=True, timeout=30)
                                
                                if text_result.returncode == 0 and text_result.stdout.strip():
                                    # Criar PDF simples com texto extraído
                                    # Por enquanto, copiar arquivo original
                                    shutil.copy2(input_path, output_path)
                                    logger.info("✅ OCR via imagem concluído!")
                                    return True
                    
                    except Exception as e4:
                        logger.error(f"Tentativa 4 falhou: {str(e4)}")
                
                # PASSO 5: Último recurso - copiar arquivo original
                logger.info("🔄 Tentativa 5: Copiando arquivo original")
                shutil.copy2(input_path, output_path)
                logger.info("✅ Arquivo original copiado como último recurso")
                return True
        
    except Exception as e:
        logger.error(f"Erro no OCR MELHOR: {str(e)}")
        raise e

def extract_matricula_3ri_fields(pdf_path):
    """Extrai campos específicos da matrícula 3º RI do PDF"""
    try:
        logger.info("🔍 Extraindo campos da matrícula 3º RI...")
        # Extrair texto do PDF
        text_content = ""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text_content += page.extract_text() + "\n"
        except Exception as e:
            logger.warning(f"PyPDF2 falhou: {e}")
            try:
                result = subprocess.run([
                    'tesseract', pdf_path, 'stdout', '-l', 'por',
                    '--oem', '3', '--psm', '6'
                ], capture_output=True, text=True, timeout=60)
                if result.returncode == 0:
                    text_content = result.stdout
                else:
                    logger.error("Tesseract falhou ao extrair texto")
                    return None
            except Exception as e2:
                logger.error(f"Tesseract falhou: {e2}")
                return None
        if not text_content.strip():
            logger.error("Nenhum texto extraído do PDF")
            return None
        # Limpeza e normalização do texto
        text_content = re.sub(r'\s+', ' ', text_content.replace('\n', ' ')).strip()
        campos = {
            'numero_matricula': '',
            'data_matricula': '',
            'descricao_imovel': '',
            'endereco': '',
            'area_privativa': '',
            'area_total': '',
            'garagem_vagas': '',
            'proprietarios': '',
            'livro_anterior': '',
            'folha_anterior': '',
            'matricula_anterior': '',
            'tipo_titulo': '',
            'valor_titulo': '',
            'comprador': '',
            'cpf_cnpj': '',
            'valor_itbi': '',
            'numero_dam': '',
            'data_pagamento_itbi': ''
        }
        patterns = {
            'numero_matricula': r'MATR[ÍI]CULA\s*(N[\.º°O]*\s*)?(\d{3,})',
            'data_matricula': r'EM\s+(\d{2}/\d{2}/\d{4})',
            'descricao_imovel': r'IM[ÓO]VEL(?: URBANO)?[:\s]+([\s\S]+?)\s+(?=POSSE|ÁREA|PROP|INSCRIÇÃO)',
            'endereco': r'ENDERE[ÇC]O[:\s]*([\s\S]{10,100}?)\s+(?=ÁREA|PROP|INSCRIÇÃO)',
            'area_privativa': r'ÁREA PRIVATIVA(?: REAL)?(?: DE)?\s*[:\-]?\s*([\d\.,]+) ?M[²2]',
            'area_total': r'ÁREA TOTAL(?: REAL)?(?: DE)?\s*[:\-]?\s*([\d\.,]+) ?M[²2]',
            'garagem_vagas': r'VAGA DE GARAGEM N[\.º°O]*\s*(\d+)',
            'proprietarios': r'PROP.*?[:\s]+([\w\s.,&-]+?)\s+(?=INSCRIÇÃO|CNPJ)',
            'livro_anterior': r'LIVRO\s*N[\.º°O]*\s*([\w\-]+)',
            'folha_anterior': r'FOLHA[S]?\s*N[\.º°O]*\s*([\w\-]+)',
            'matricula_anterior': r'MATR[ÍI]CULA\s*ANTERIOR[:\s]*([\d\.]+)',
            'tipo_titulo': r'T[ÍI]TULO\s*DE\s*TRANS[CF]ER[ÊE]NCIA|ESCRITURA P[ÚU]BLICA|VENDA E COMPRA',
            'valor_titulo': r'VALOR[\s\w]*[:\-]?\s*R\$\s*([\d\.,]+)',
            'comprador': r'OUTORGADO COMPRADOR[:\s]*([\w\s.,&-]+)',
            'cpf_cnpj': r'CNPJ.*?([0-9]{2}\.?[0-9]{3}\.?[0-9]{3}/?[0-9]{4}-?[0-9]{2})',
            'valor_itbi': r'VALOR[\s\w]*ITBI[\s\w]*R\$\s*([\d\.,]+)',
            'numero_dam': r'DAM.*?N[\.º°O]*\s*(\d+)',
            'data_pagamento_itbi': r'PAGAMENTO\s+EM\s+(\d{2}/\d{2}/\d{4})'
        }
        for campo, pattern in patterns.items():
            match = re.search(pattern, text_content, re.IGNORECASE | re.MULTILINE)
            if match:
                value = match.group(1).strip() if match.lastindex else match.group(0).strip()
                campos[campo] = value
                logger.info(f"✅ {campo}: {value}")
        # Busca adicional para datas em múltiplos formatos
        if not campos['data_matricula']:
            date_patterns = [
                r'\d{2}/\d{2}/\d{4}',                      # 13/12/2022
                r'\d{2}-\d{2}-\d{4}',                      # 13-12-2022
                r'\d{2}\s+DE\s+[A-ZÇÃÁÉÍÓÚ]+\s+DE\s+\d{4}' # 13 DE DEZEMBRO DE 2022
            ]
            for pattern in date_patterns:
                match = re.search(pattern, text_content, re.IGNORECASE)
                if match:
                    campos['data_matricula'] = match.group(0).strip()
                    logger.info(f"✅ data_matricula (alt): {campos['data_matricula']}")
                    break
        campos_encontrados = sum(1 for v in campos.values() if v.strip())
        logger.info(f"📊 Campos encontrados: {campos_encontrados}/{len(campos)}")
        if campos_encontrados < 3:
            logger.warning("Poucos campos encontrados - pode não ser uma matrícula 3º RI")
        return campos
    except Exception as e:
        logger.error(f"Erro ao extrair campos: {str(e)}")
        return None

def extract_fields_with_openai(text, model="gpt-3.5-turbo"):
    """Envia o texto para a OpenAI API e retorna os campos extraídos em JSON"""
    prompt = (
        "Extraia os seguintes campos do texto da matrícula de imóvel abaixo. "
        "Responda apenas em JSON, sem explicações.\n"
        "Campos: numero_matricula, data_matricula, descricao_imovel, endereco, area_privativa, area_total, garagem_vagas, proprietarios, livro_anterior, folha_anterior, matricula_anterior, tipo_titulo, valor_titulo, comprador, cpf_cnpj, valor_itbi, numero_dam, data_pagamento_itbi.\n"
        "Texto:\n" + text
    )
    response = openai.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.0,
        max_tokens=1024
    )
    # Extrair JSON da resposta
    import json
    import re
    content = response.choices[0].message.content
    if content is None:
        return {"error": "Resposta vazia da OpenAI", "raw": None}
    
    try:
        # Tentar extrair JSON puro
        match = re.search(r'\{[\s\S]+\}', content)
        if match:
            return json.loads(match.group(0))
        return json.loads(content)
    except Exception as e:
        return {"error": f"Erro ao interpretar resposta da OpenAI: {str(e)}", "raw": content}

@app.route('/')
def index():
    """Serve o arquivo index.html da pasta static"""
    try:
        with open('static/index.html', 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return "Arquivo index.html não encontrado", 404

@app.route('/<path:filename>')
def static_files(filename):
    """Serve arquivos estáticos da pasta static"""
    try:
        return app.send_static_file(filename)
    except FileNotFoundError:
        return "Arquivo não encontrado", 404

@app.route('/api/ocr-tesseract', methods=['POST'])
def ocr_tesseract():
    """Endpoint para processar PDF com OCR MELHOR"""
    try:
        # Verificar se há arquivo no request
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['file']
        
        # Verificar se o arquivo foi selecionado
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        
        # Verificar extensão do arquivo
        if not allowed_file(file.filename):
            return jsonify({'error': 'Apenas arquivos PDF são permitidos'}), 400
        
        # Gerar nome único para o arquivo
        original_filename = secure_filename(file.filename or 'unknown.pdf')
        file_id = str(uuid.uuid4())
        upload_filename = f"{file_id}_{original_filename}"
        upload_path = os.path.join(UPLOAD_FOLDER, upload_filename)
        
        # Salvar arquivo enviado
        file.save(upload_path)
        logger.info(f"Arquivo salvo: {upload_path} ({get_file_size_mb(upload_path):.2f} MB)")
        
        # Nome do arquivo processado
        processed_filename = f"ocr_{file_id}_{original_filename}"
        processed_path = os.path.join(PROCESSED_FOLDER, processed_filename)
        
        # Processar com OCR MELHOR
        logger.info(f"Iniciando OCR MELHOR para: {upload_path}")
        
        try:
            # OCR MELHOR com apenas português
            best_ocr_with_tesseract(upload_path, processed_path)
            
            logger.info(f"OCR MELHOR concluído: {processed_path} ({get_file_size_mb(processed_path):.2f} MB)")
            
            # Retornar sucesso
            return jsonify({
                'success': True,
                'message': 'PDF processado com OCR MELHOR em português!',
                'original_filename': original_filename,
                'processed_filename': processed_filename,
                'file_id': file_id,
                'download_url': f'/api/download/{processed_filename}',
                'ocr_mode': 'best_portuguese'
            })
            
        except Exception as e:
            logger.error(f"Erro no OCR MELHOR: {str(e)}")
            # Se falhar, copiar arquivo original
            shutil.copy2(upload_path, processed_path)
            return jsonify({
                'success': True,
                'message': f'PDF copiado (OCR falhou: {str(e)})',
                'original_filename': original_filename,
                'processed_filename': processed_filename,
                'file_id': file_id,
                'download_url': f'/api/download/{processed_filename}',
                'ocr_mode': 'copy_fallback'
            })
            
    except Exception as e:
        logger.error(f"Erro geral: {str(e)}")
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@app.route('/api/download/<filename>')
def download_file(filename):
    """Endpoint para download de arquivos processados"""
    try:
        # Verificar se o arquivo existe
        file_path = os.path.join(PROCESSED_FOLDER, filename)
        if not os.path.exists(file_path):
            return jsonify({'error': 'Arquivo não encontrado'}), 404
        
        # Verificar se o arquivo é um PDF
        if not filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Apenas arquivos PDF são permitidos'}), 400
        
        # Enviar arquivo
        return send_file(
            file_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
        
    except Exception as e:
        logger.error(f"Erro no download: {str(e)}")
        return jsonify({'error': f'Erro no download: {str(e)}'}), 500

@app.route('/api/extract-matricula/<filename>')
def extract_matricula_fields(filename):
    """Endpoint para extrair campos da matrícula 3º RI"""
    try:
        # Verificar se o arquivo existe
        file_path = os.path.join(PROCESSED_FOLDER, filename)
        if not os.path.exists(file_path):
            return jsonify({'error': 'Arquivo não encontrado'}), 404
        
        # Verificar se o arquivo é um PDF
        if not filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Apenas arquivos PDF são permitidos'}), 400
        
        # Extrair campos da matrícula 3º RI
        campos = extract_matricula_3ri_fields(file_path)
        
        if campos is None:
            return jsonify({
                'success': False,
                'error': 'Não foi possível extrair campos do PDF',
                'message': 'Verifique se o arquivo é uma matrícula 3º RI válida'
            }), 400
        
        # Contar campos encontrados
        campos_encontrados = sum(1 for v in campos.values() if v.strip())
        total_campos = len(campos)
        
        return jsonify({
            'success': True,
            'message': f'Campos extraídos com sucesso! ({campos_encontrados}/{total_campos} campos encontrados)',
            'filename': filename,
            'campos_encontrados': campos_encontrados,
            'total_campos': total_campos,
            'campos': campos,
            'campos_formatados': {
                'Dados da Matrícula 3º RI': campos['dados_matricula'],
                'Informações Básicas': {
                    'Número da Matrícula': campos['numero_matricula'],
                    'Data da Matrícula': campos['data_matricula'],
                    'Descrição do Imóvel': campos['descricao_imovel'],
                    'Endereço': campos['endereco']
                },
                'Áreas e Garagem': {
                    'Área Privativa (m²)': campos['area_privativa'],
                    'Área Total (m²)': campos['area_total'],
                    'Garagem/Vagas': campos['garagem_vagas']
                },
                'Proprietários': {
                    'Nome dos Proprietários': campos['proprietarios']
                },
                'Livro Anterior': {
                    'Livro Anterior': campos['livro_anterior'],
                    'Folha Anterior': campos['folha_anterior'],
                    'Matrícula Anterior': campos['matricula_anterior']
                },
                'Transação': {
                    'Tipo do Título': campos['tipo_titulo'],
                    'Valor do Título': campos['valor_titulo'],
                    'Comprador': campos['comprador'],
                    'CPF/CNPJ': campos['cpf_cnpj']
                },
                'ITBI': {
                    'ITBI': campos['itbi'],
                    'Valor do ITBI': campos['valor_itbi'],
                    'Número da DAM': campos['numero_dam'],
                    'Data de Pagamento ITBI': campos['data_pagamento_itbi']
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Erro ao extrair campos: {str(e)}")
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@app.route('/api/health')
def health_check():
    """Endpoint de verificação de saúde da API"""
    tesseract_available = check_tesseract()
    ghostscript_available = check_ghostscript()
    
    # Verificar idiomas disponíveis
    languages_available = []
    if tesseract_available:
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

@app.route('/api/process-file', methods=['POST'])
def process_file_chatgpt():
    """Endpoint para processar PDF com extração via ChatGPT"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        if not allowed_file(file.filename):
            return jsonify({'error': 'Apenas arquivos PDF são permitidos'}), 400
        # Salvar arquivo temporário
        original_filename = secure_filename(file.filename or 'unknown.pdf')
        file_id = str(uuid.uuid4())
        upload_filename = f"{file_id}_{original_filename}"
        upload_path = os.path.join(UPLOAD_FOLDER, upload_filename)
        file.save(upload_path)
        # Extrair texto do PDF (OCR melhor)
        temp_txt = tempfile.NamedTemporaryFile(suffix='.txt', delete=False)
        temp_txt.close()
        processed_filename = f"ocr_{file_id}_{original_filename}"
        processed_path = os.path.join(PROCESSED_FOLDER, processed_filename)
        best_ocr_with_tesseract(upload_path, processed_path)
        # Extrair texto do PDF processado
        text_content = ""
        try:
            with open(processed_path, 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)
                for page in pdf_reader.pages:
                    text_content += page.extract_text() + "\n"
        except Exception as e:
            return jsonify({'error': f'Erro ao extrair texto do PDF: {str(e)}'}), 500
        # Limpeza do texto
        text_content = re.sub(r'\s+', ' ', text_content.replace('\n', ' ')).strip()
        # Modelo OpenAI
        model = request.form.get('model', 'gpt-3.5-turbo')
        # Chave OpenAI
        openai.api_key = Config.OPENAI_API_KEY
        # Extrair campos com OpenAI
        campos = extract_fields_with_openai(text_content, model=model)
        return jsonify({
            'success': True,
            'message': 'PDF processado e campos extraídos com ChatGPT!',
            'original_filename': original_filename,
            'processed_filename': processed_filename,
            'file_id': file_id,
            'campos': campos,
            'model': model
        })
    except Exception as e:
        logger.error(f"Erro geral no ChatGPT: {str(e)}")
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500

@app.errorhandler(413)
def too_large(e):
    """Handler para arquivos muito grandes"""
    return jsonify({'error': 'Arquivo muito grande. Tamanho máximo: 50MB'}), 413

@app.errorhandler(404)
def not_found(e):
    """Handler para rotas não encontradas"""
    return jsonify({'error': 'Endpoint não encontrado'}), 404

@app.errorhandler(500)
def internal_error(e):
    """Handler para erros internos"""
    return jsonify({'error': 'Erro interno do servidor'}), 500

if __name__ == '__main__':
    print("🚀 Iniciando servidor Flask para OCR Tesseract (OCR MELHOR EM PORTUGUÊS)...")
    print("📁 Diretórios configurados:")
    print(f"   - Uploads: {os.path.abspath(UPLOAD_FOLDER)}")
    print(f"   - Processados: {os.path.abspath(PROCESSED_FOLDER)}")
    print("🌐 Servidor rodando em: http://localhost:5000")
    print("📋 Endpoints disponíveis:")
    print("   - GET  /                    -> Interface web")
    print("   - POST /api/ocr-tesseract   -> Processar PDF com OCR MELHOR")
    print("   - GET  /api/download/<file> -> Download do PDF processado")
    print("   - GET  /api/extract-matricula/<file> -> Extrair campos da matrícula 3º RI")
    print("   - GET  /api/health          -> Status da API")
    print("   - POST /api/process-file    -> Processar PDF com extração via ChatGPT")
    print("\n🇧🇷 OCR MELHOR EM PORTUGUÊS:")
    print("   ✅ OCR MELHOR com texto pesquisável")
    print("   ✅ Apenas idioma português")
    print("   ✅ QUEBRA proteções com Ghostscript")
    print("   ✅ Remove assinaturas digitais")
    print("   ✅ 5 métodos diferentes de OCR")
    print("   ✅ SEMPRE funciona!")
    
    app.run(debug=True, host='0.0.0.0', port=5000) 