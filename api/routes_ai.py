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

@ai_bp.route('/api/certidao', methods=['POST'])
def process_certidao():
    """Endpoint para processar PDF de matrícula, extrair campos via OpenAI e gerar certidão personalizada"""
    from ai.ocr_service import extract_text_from_pdf, process_pdf_with_ocr
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4
    import io

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

        # Obter tipo de certidão e modelo
        tipo_certidao = 'STNegativa'
        motivo_certidao = 'Não há ônus real identificado.'

        # O restante do código permanece igual, mas usar tipo_certidao para o título
        # e retornar tipo_certidao e motivo_certidao no response.

        original_filename = secure_filename(file.filename or 'unknown.pdf')
        # Processar arquivo de forma segura
        if Config.SECURE_PROCESSING:
            temp_file_path, file_id = secure_manager.process_file_securely(
                file, original_filename, user_ip
            )
        else:
            file_id = str(uuid.uuid4())
            upload_filename = f"{file_id}_{original_filename}"
            temp_file_path = os.path.join(Config.UPLOAD_FOLDER, upload_filename)
            file.save(temp_file_path)

        # Extrair texto do PDF (OCR se necessário)
        text_content = ""
        temp_ocr_path = None
        
        try:
            # Descriptografar se necessário
            if Config.SECURE_PROCESSING and Config.ENCRYPT_TEMP_FILES:
                temp_file_path = secure_manager.decrypt_file(temp_file_path)
            
            # Tentar extrair texto diretamente primeiro
            with open(temp_file_path, 'rb') as f:
                pdf_reader = pypdf.PdfReader(f)
                for page in pdf_reader.pages:
                    text_content += page.extract_text() + "\n"
        except Exception as e:
            print(f"❌ Erro ao extrair texto diretamente: {str(e)}")
            text_content = ""
        
        # Limpar e normalizar texto
        text_content = re.sub(r'\s+', ' ', text_content.replace('\n', ' ')).strip()
        
        # Se não houver texto suficiente, tentar OCR
        if not text_content or len(text_content.strip()) < 50:
            print("📄 Tentando OCR para extrair texto...")
            try:
                temp_ocr_path = temp_file_path + '_ocr.pdf'
                ocr_result = process_pdf_with_ocr(temp_file_path, temp_ocr_path)
                if ocr_result.get('success'):
                    print("✅ OCR bem-sucedido, extraindo texto...")
                    text_content = extract_text_from_pdf(temp_ocr_path)
                    # Limpar novamente
                    text_content = re.sub(r'\s+', ' ', text_content.replace('\n', ' ')).strip()
                else:
                    print(f"❌ OCR falhou: {ocr_result.get('error', 'Erro desconhecido')}")
                    # Tentar processar mesmo com pouco texto
                    if len(text_content.strip()) > 10:
                        print("⚠️ Continuando com texto mínimo extraído...")
                    else:
                        return jsonify({
                            'error': 'Não foi possível extrair texto suficiente do PDF.',
                            'details': 'O arquivo pode estar corrompido, protegido por senha, ou ser uma imagem escaneada de baixa qualidade.',
                            'suggestion': 'Tente com um arquivo PDF diferente ou verifique se o arquivo não está protegido.',
                            'ocr_error': ocr_result.get('error', 'Erro desconhecido')
                        }), 400
            except Exception as ocr_error:
                print(f"❌ Erro durante OCR: {str(ocr_error)}")
                # Se temos pelo menos algum texto, continuar
                if len(text_content.strip()) > 10:
                    print("⚠️ Continuando com texto mínimo extraído...")
                else:
                    return jsonify({
                        'error': 'Erro durante processamento OCR.',
                        'details': str(ocr_error),
                        'suggestion': 'Verifique se o arquivo é um PDF válido e não está corrompido.'
                    }), 400
        
        # Verificar se temos texto suficiente para processar
        if not text_content or len(text_content.strip()) < 10:
            return jsonify({
                'error': 'Texto insuficiente para processamento.',
                'details': f'Extraído apenas {len(text_content)} caracteres.',
                'suggestion': 'O arquivo pode estar vazio ou não conter texto legível.',
                'text_preview': text_content[:200] if text_content else ''
            }), 400
        
        print(f"✅ Texto extraído com sucesso: {len(text_content)} caracteres")
        
        # Debug: mostrar preview do texto extraído
        print(f"📄 Preview do texto (primeiros 500 chars): {text_content[:500]}")
        
        # Extrair campos com OpenAI
        print("🤖 Iniciando extração com IA...")
        model = request.form.get('model', 'gpt-3.5-turbo')
        if not Config.OPENAI_API_KEY or Config.OPENAI_API_KEY.strip() == '':
            return jsonify({
                'error': 'Chave da API OpenAI não configurada.',
                'details': 'Configure a variável de ambiente OPENAI_API_KEY para usar a funcionalidade de IA.',
                'suggestion': 'Adicione sua chave da OpenAI nas configurações do sistema.'
            }), 500
        campos = None
        temp_ocr_path = None
        try:
            campos = extract_fields_with_openai(text_content, model=model, service_type='certidao')
        except Exception as ia_error:
            print(f"❌ Erro na extração de campos pela IA: {ia_error}")
            return jsonify({'error': 'Erro ao extrair campos da certidão com IA.', 'details': str(ia_error)}), 500

        # --- Lógica para identificar o tipo de certidão ---
        if not campos or not isinstance(campos, dict):
            return jsonify({'error': 'Não foi possível extrair os campos necessários da certidão.'}), 500
        tipo_certidao = 'STNegativa'
        motivo_certidao = 'Não há ônus real identificado.'
        onus = (campos.get('onus_certidao_negativa') or '').lower()
        descricao = (campos.get('descricao_imovel') or '').lower()
        enfiteuta = (campos.get('enfiteuta') or '').lower()
        senhorio = (campos.get('senhorio_direto') or '').lower()
        if 'foreiro' in descricao or 'enfiteuta' in descricao or enfiteuta or senhorio:
            tipo_certidao = 'STForeiro'
            motivo_certidao = 'Imóvel foreiro (domínio útil/enfiteuta) identificado.'
        elif any(palavra in onus for palavra in ['hipoteca', 'alienação', 'penhora', 'ônus', 'restrição', 'gravame', 'fiduciária', 'ação judicial', 'usucapião', 'usufruto', 'servidão', 'penhor', 'protesto', 'bloqueio', 'penalidade', 'penal', 'ação', 'execução']):
            tipo_certidao = 'STPositiva'
            motivo_certidao = 'Ônus real ou restrição identificado.'
        else:
            tipo_certidao = 'STNegativa'
            motivo_certidao = 'Não há ônus real identificado.'

        # O restante do código permanece igual, mas usar tipo_certidao para o título
        # e retornar tipo_certidao e motivo_certidao no response.

        # Gerar PDF personalizado da certidão conforme o tipo (layout avançado)
        from reportlab.lib.units import cm
        from reportlab.lib.styles import ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph
        from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
        from reportlab.pdfbase.ttfonts import TTFont
        from reportlab.pdfbase import pdfmetrics
        from datetime import datetime
        from reportlab.lib import colors
        import io

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4,
            leftMargin=3*cm, rightMargin=3*cm, topMargin=3*cm, bottomMargin=2*cm)

        # Fonte Times New Roman se disponível
        try:
            pdfmetrics.registerFont(TTFont('TimesNewRoman', 'times.ttf'))
            base_font = 'TimesNewRoman'
        except:
            base_font = 'Times-Roman'

        # Estilos
        style_title = ParagraphStyle('title', fontName=base_font, fontSize=13, alignment=TA_CENTER, leading=18, spaceAfter=10, textDecoration='underline', fontWeight='bold')
        style_body = ParagraphStyle('body', fontName=base_font, fontSize=12, alignment=TA_JUSTIFY, leading=19)

        # Cores
        cor_vermelho = '#FF0000'
        cor_azul = '#0070C0'
        cor_azul_escuro = '#002060'

        # Data
        data_certidao = datetime.now().strftime('%d/%m/%Y')

        # Montar o parágrafo principal
        texto = (
            '<b>CERTIFICO</b>, nos termos dos arts. 17 e 19, §9º, da Lei n.º 6.015/1973, e art. 123, caput, do Provimento n.º 149/2023, do Conselho Nacional de Justiça - CNJ, que, revendo os livros, arquivos e sistemas eletrônicos desta Serventia, inclusive cadastro interno de ações reais e pessoais reipersecutórias envolvendo imóveis desta circunscrição, encontrei o lançamento relativo ao registro de imóvel seguinte: '
            f'<b><u>CADASTRO NACIONAL DE MATRÍCULA - CNM:</u></b> <font color="{cor_vermelho}">{campos.get("cnm", "")}</font>, '
            f'<b><u>DESCRIÇÃO DO IMÓVEL:</u></b> <font color="{cor_azul}">{campos.get("descricao_imovel", "")}</font>, '
        )
        if campos.get('senhorio_direto'):
            texto += f'<b><u>SENHORIO DIRETO:</u></b> {campos.get("senhorio_direto")}, '
        if campos.get('enfiteuta'):
            texto += f'<b><u>ENFITEUTA:</u></b> {campos.get("enfiteuta")}, '
        texto += f'<b><u>PROPRIETÁRIO(S):</u></b> <font color="{cor_azul_escuro}">{campos.get("proprietarios", "")}</font>, '
        texto += f'<b><u>INSCRIÇÃO IMOBILIÁRIA:</u></b> <font color="{cor_azul_escuro}">{campos.get("inscricao_imobiliaria", "")}</font>, '
        if campos.get('rip'):
            texto += f'<b><u>REGISTRO IMOBILIÁRIO PATRIMONIAL (RIP):</u></b> {campos.get("rip")}, '
        texto += f'<b><u>DIREITOS, ÔNUS REAIS E RESTRIÇÕES JUDICIAIS E ADMINISTRATIVAS:</u></b> <b>{campos.get("onus_certidao_negativa", "")}</b>. '
        texto += f'O referido é verdade e dou fé. São Luís/MA, {data_certidao}. '
        texto += f'<b>Emolumentos:</b> Certidão: Ato 16.24.4 - <font color="{cor_azul}">R$ 87,31</font>; FEMP: <font color="{cor_azul}">R$ 3,49</font>; FADEP: <font color="{cor_azul}">R$ 3,49</font>; FERC: <font color="{cor_azul}">R$ 2,61</font>. '
        texto += '<b>João Gabriel Santos Barros, Escrevente Autorizado.</b> '
        texto += f'<br/><b><font color="{cor_azul_escuro}">Validade: 30 dias.</font></b>'

        # Ajustar tags HTML para ReportLab
        texto = texto.replace('class="bold"', 'b').replace('class="underline"', 'u')
        texto = texto.replace('b u', 'b u').replace('u b', 'u b')  # garantir ordem
        texto = texto.replace('style="color:'+cor_azul_escuro+'"', f'color="{cor_azul_escuro}"')

        from reportlab.platypus import Flowable
        
        elements: list[Flowable] = [
            Paragraph('<u><b>CERTIDÃO DE SITUAÇÃO JURÍDICA DO IMÓVEL</b></u>', style_title),
            Paragraph(texto, style_body)
        ]

        doc.build(elements)
        buffer.seek(0)

        # Limpar arquivos temporários
        if Config.SECURE_PROCESSING and temp_file_path:
            secure_manager.cleanup_file(temp_file_path, user_ip)
        if 'temp_ocr_path' in locals() and temp_ocr_path and os.path.exists(temp_ocr_path):
            try:
                os.remove(temp_ocr_path)
            except Exception:
                pass

        # Retornar PDF gerado e info do tipo/motivo
        return (buffer.getvalue(), 200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': f'attachment; filename=certidao_{tipo_certidao}_{file_id}.pdf',
            'X-Certidao-Tipo': tipo_certidao,
            'X-Certidao-Motivo': motivo_certidao
        })
    except Exception as e:
        # Garantir limpeza em caso de erro
        if Config.SECURE_PROCESSING and temp_file_path:
            secure_manager.cleanup_file(temp_file_path, user_ip)
        if 'temp_ocr_path' in locals() and temp_ocr_path and os.path.exists(temp_ocr_path):
            try:
                os.remove(temp_ocr_path)
            except Exception:
                pass
        return jsonify({'error': f'Erro interno do servidor: {str(e)}'}), 500 