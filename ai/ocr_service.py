"""
AxionDocs - Sistema OCR integrado com API OpenAI
Desenvolvido por João Gabriel Santos Barros (2025)

Licenciado sob MIT License - consulte LICENSE.txt

Este software é fornecido "no estado em que se encontra", sem garantias.

O uso da API OpenAI requer chave configurada via variável de ambiente: OPENAI_API_KEY.
Os custos gerados são responsabilidade do usuário da chave.

Projeto iniciado como parte do TCC no Cartório de Registro de Imóveis de São Luís.
"""

import os
import subprocess
import tempfile
import time
import logging
from datetime import datetime
from config import Config
from security import secure_manager

# Caminho do qpdf - ajuste conforme necessário
import platform
if platform.system() == "Windows":
    QPDF_PATH = r"C:\Users\gabri\OneDrive\Documentos\qpdf-12.2.0-mingw64\bin\qpdf.exe"
else:
    # No Linux/Docker, usar qpdf do sistema
    QPDF_PATH = "qpdf"

# Verificação mais robusta do ocrmypdf
OCR_AVAILABLE = False
try:
    import ocrmypdf
    # Teste adicional para verificar se o ocrmypdf está funcionando
    try:
        # Teste básico para verificar se o ocrmypdf pode ser usado
        ocrmypdf.__version__
        OCR_AVAILABLE = True
        logging.info(f"ocrmypdf disponível - versão: {ocrmypdf.__version__}")
    except Exception as e:
        OCR_AVAILABLE = False
        logging.warning(f"ocrmypdf importado mas não funcional: {e}")
except ImportError as e:
    OCR_AVAILABLE = False
    logging.warning(f"ocrmypdf não está disponível. OCR não funcionará. Erro: {e}")

# Verificação do Tesseract
TESSERACT_AVAILABLE = False
try:
    result = subprocess.run(['tesseract', '--version'], 
                          capture_output=True, text=True, timeout=10)
    if result.returncode == 0:
        TESSERACT_AVAILABLE = True
        logging.info(f"Tesseract disponível: {result.stdout.split()[1] if result.stdout else 'versão desconhecida'}")
    else:
        logging.warning(f"Tesseract não está funcionando: {result.stderr}")
except Exception as e:
    logging.warning(f"Tesseract não encontrado: {e}")

if not OCR_AVAILABLE:
    logging.warning("ocrmypdf não está disponível. OCR não funcionará.")
if not TESSERACT_AVAILABLE:
    logging.warning("Tesseract não está disponível. OCR não funcionará.")

try:
    from PyPDF2 import PdfReader, PdfWriter
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    logging.warning("PyPDF2 não está disponível. Algumas funcionalidades podem não funcionar.")

def is_pdf_signed(filepath):
    """Verifica se o PDF possui assinatura digital"""
    if not PDF_AVAILABLE:
        return False
    
    try:
        reader = PdfReader(filepath)
        for page in reader.pages:
            if '/Annots' in page:
                try:
                    # Verificar se há anotações de assinatura
                    # Como PyPDF2 pode ter diferentes estruturas, vamos ser conservadores
                    annots = page['/Annots']
                    # Se chegamos até aqui, há anotações - assumir que pode ter assinatura
                    # Em um sistema real, você pode implementar verificação mais detalhada
                    return True
                except (TypeError, AttributeError, KeyError):
                    # Se não conseguir acessar anotações, continuar
                    continue
        return False
    except Exception as e:
        logging.error(f"Erro ao verificar assinatura em {filepath}: {e}")
        return False

def remove_signature_qpdf(input_path, temp_qpdf_path):
    """Remove assinatura digital usando qpdf"""
    try:
        subprocess.run([
            QPDF_PATH,
            '--decrypt',
            input_path,
            '--linearize',
            '--object-streams=generate',
            temp_qpdf_path
        ], check=True)
        logging.info(f"Assinatura removida com qpdf: {input_path}")
        return True
    except subprocess.CalledProcessError as e:
        logging.error(f"Erro ao rodar qpdf: {e}")
        return False
    except FileNotFoundError:
        logging.error(f"qpdf não encontrado em: {QPDF_PATH}")
        return False

def reescrever_pdf_sem_assinatura(input_path, output_path):
    """Reescreve PDF para limpar metadados e assinaturas"""
    if not PDF_AVAILABLE:
        return False
    
    try:
        reader = PdfReader(input_path)
        writer = PdfWriter()
        for page in reader.pages:
            writer.add_page(page)
        with open(output_path, "wb") as f:
            writer.write(f)
        logging.info(f"PDF regravado para limpar metadados: {output_path}")
        return True
    except Exception as e:
        logging.error(f"Erro ao regravar PDF: {e}")
        return False

def aplicar_ocr(pdf_entrada, pdf_saida):
    """Aplica OCR no PDF usando ocrmypdf"""
    if not OCR_AVAILABLE:
        raise Exception("OCR não está disponível. Instale ocrmypdf: pip install ocrmypdf")
    
    if not TESSERACT_AVAILABLE:
        raise Exception("Tesseract não está disponível. Instale tesseract-ocr")
    
    try:
        # Primeira tentativa: OCR normal
        ocrmypdf.ocr(
            pdf_entrada,
            pdf_saida,
            deskew=True,
            force_ocr=True,
            language='por',
            output_type='pdf'
        )
        logging.info(f"OCR aplicado com sucesso: {pdf_saida}")
    except Exception as e:
        error_msg = str(e)
        if "digital signature" in error_msg.lower() or "signature" in error_msg.lower():
            logging.warning(f"PDF com assinatura digital detectado, tentando processar mesmo assim: {pdf_entrada}")
            try:
                # Segunda tentativa: OCR com opções especiais para PDFs assinados
                ocrmypdf.ocr(
                    pdf_entrada,
                    pdf_saida,
                    deskew=True,
                    force_ocr=True,
                    language='por',
                    output_type='pdf',
                    skip_text=True,  # Pula texto existente para evitar conflitos
                    skip_pdf_validation=True  # Pula validação de PDF
                )
                logging.info(f"OCR aplicado com sucesso (modo assinatura): {pdf_saida}")
            except Exception as e2:
                logging.error(f"Erro no OCR de {pdf_entrada} (modo assinatura): {e2}")
                # Terceira tentativa: OCR mais básico
                try:
                    logging.warning(f"Tentando OCR básico para PDF assinado: {pdf_entrada}")
                    ocrmypdf.ocr(
                        pdf_entrada,
                        pdf_saida,
                        deskew=False,
                        force_ocr=False,
                        language='por',
                        output_type='pdf'
                    )
                    logging.info(f"OCR aplicado com sucesso (modo básico): {pdf_saida}")
                except Exception as e3:
                    logging.error(f"Erro no OCR básico de {pdf_entrada}: {e3}")
                    raise e3
        else:
            logging.error(f"Erro no OCR de {pdf_entrada}: {e}")
            raise

def process_pdf_with_ocr(input_file_path, output_file_path, options=None):
    """
    Processa PDF com OCR, removendo assinaturas digitais se necessário
    """
    if not OCR_AVAILABLE:
        return {
            'success': False,
            'error': 'OCR não está disponível. Instale ocrmypdf: pip install ocrmypdf'
        }
    
    if not TESSERACT_AVAILABLE:
        return {
            'success': False,
            'error': 'Tesseract não está disponível. Instale tesseract-ocr'
        }
    
    start_time = time.time()
    temp_files = []
    
    try:
        # Tentar OCR diretamente primeiro
        try:
            aplicar_ocr(input_file_path, output_file_path)
        except Exception as e:
            error_msg = str(e)
            if "digital signature" in error_msg.lower() or "signature" in error_msg.lower():
                logging.info(f"PDF com assinatura digital detectado, tentando limpar: {input_file_path}")
                
                # Verificar se o PDF tem assinatura digital
                if is_pdf_signed(input_file_path):
                    # Criar arquivo temporário para qpdf
                    temp_qpdf_path = input_file_path + '_qpdf_temp.pdf'
                    temp_files.append(temp_qpdf_path)
                    
                    # Remover assinatura com qpdf
                    if remove_signature_qpdf(input_file_path, temp_qpdf_path):
                        # Reescrever PDF para limpar metadados
                        temp_clean_path = input_file_path + '_clean_temp.pdf'
                        temp_files.append(temp_clean_path)
                        
                        if reescrever_pdf_sem_assinatura(temp_qpdf_path, temp_clean_path):
                            # Aplicar OCR no PDF limpo
                            aplicar_ocr(temp_clean_path, output_file_path)
                        else:
                            # Fallback: aplicar OCR diretamente no arquivo qpdf
                            aplicar_ocr(temp_qpdf_path, output_file_path)
                    else:
                        # Fallback: tentar OCR com opções especiais para PDFs assinados
                        logging.warning("qpdf não disponível, tentando OCR com opções especiais")
                        aplicar_ocr(input_file_path, output_file_path)
                else:
                    # Se não detectou assinatura mas deu erro, tentar OCR com opções especiais
                    logging.warning("Erro no OCR, tentando com opções especiais")
                    aplicar_ocr(input_file_path, output_file_path)
            else:
                # Re-raise o erro original se não for relacionado a assinatura
                raise
        
        # Calcular tempo de processamento
        processing_time = time.time() - start_time
        
        # Contar páginas processadas
        pages_processed = 0
        try:
            with open(output_file_path, 'rb') as f:
                pdf_reader = PdfReader(f)
                pages_processed = len(pdf_reader.pages)
        except Exception:
            pages_processed = 0
        
        return {
            'success': True,
            'processing_time': processing_time,
            'pages_processed': pages_processed,
            'output_file': output_file_path,
            'message': f'PDF processado com sucesso em {processing_time:.2f} segundos (OCR + remoção de assinatura)'
        }
        
    except Exception as e:
        import traceback
        logging.error(traceback.format_exc())
        return {
            'success': False,
            'error': f'Erro no processamento OCR: {str(e)}',
            'processing_time': time.time() - start_time
        }
    finally:
        # Limpar arquivos temporários
        for temp_file in temp_files:
            if os.path.exists(temp_file):
                try:
                    os.remove(temp_file)
                except Exception:
                    pass

def extract_text_from_pdf(pdf_path):
    """
    Extrai texto de um PDF (com ou sem OCR)
    
    Args:
        pdf_path: Caminho do PDF
    
    Returns:
        str: Texto extraído
    """
    try:
        if not PDF_AVAILABLE:
            return "Erro: PyPDF2 não está disponível"
        
        text = ""
        with open(pdf_path, 'rb') as file:
            pdf_reader = PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        
        return text.strip()
        
    except Exception as e:
        return f"Erro ao extrair texto: {str(e)}"

def get_ocr_info(pdf_path):
    """
    Obtém informações sobre um PDF processado
    
    Args:
        pdf_path: Caminho do PDF
    
    Returns:
        dict: Informações do PDF
    """
    try:
        if not PDF_AVAILABLE:
            return {
                'error': 'PyPDF2 não está disponível',
                'pages': 0,
                'text_length': 0,
                'has_text': False,
                'text_preview': ""
            }
        
        with open(pdf_path, 'rb') as file:
            pdf_reader = PdfReader(file)
            
            # Contar páginas
            num_pages = len(pdf_reader.pages)
            
            # Extrair texto para análise
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            
            # Calcular estatísticas básicas
            text_length = len(text)
            has_text = text_length > 100  # Considera que tem texto se mais de 100 caracteres
            
            return {
                'pages': num_pages,
                'text_length': text_length,
                'has_text': has_text,
                'text_preview': text[:500] if text else ""
            }
            
    except Exception as e:
        return {
            'error': f'Erro ao analisar PDF: {str(e)}',
            'pages': 0,
            'text_length': 0,
            'has_text': False,
            'text_preview': ""
        } 

def processar_pdfs(diretorio_pdf, diretorio_saida):
    """
    Processa todos os PDFs em um diretório
    Função utilitária para processamento em lote
    """
    os.makedirs(diretorio_saida, exist_ok=True)
    
    for nome_arquivo in os.listdir(diretorio_pdf):
        if not nome_arquivo.lower().endswith('.pdf'):
            continue

        caminho_pdf = os.path.join(diretorio_pdf, nome_arquivo)
        caminho_qpdf_tmp = os.path.join(diretorio_saida, f"qpdf_{nome_arquivo}")
        caminho_pdf_limpo = os.path.join(diretorio_saida, f"limpo_{nome_arquivo}")
        caminho_pdf_saida = os.path.join(diretorio_saida, f"ocr_{nome_arquivo}")

        if is_pdf_signed(caminho_pdf):
            logging.info(f"PDF assinado detectado: {nome_arquivo}")
            if remove_signature_qpdf(caminho_pdf, caminho_qpdf_tmp):
                if reescrever_pdf_sem_assinatura(caminho_qpdf_tmp, caminho_pdf_limpo):
                    aplicar_ocr(caminho_pdf_limpo, caminho_pdf_saida)
                    os.remove(caminho_pdf_limpo)
                os.remove(caminho_qpdf_tmp)
        else:
            aplicar_ocr(caminho_pdf, caminho_pdf_saida) 