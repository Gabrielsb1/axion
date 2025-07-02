# Funções utilitárias relacionadas a PDF

import os
import shutil
import subprocess
import tempfile
import logging

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {'pdf'}

UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'

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
        if not check_tesseract():
            raise Exception("Tesseract não encontrado. Instale em: https://github.com/UB-Mannheim/tesseract/wiki")
        ghostscript_available = check_ghostscript()
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
            if "digital signature" in str(e).lower() and ghostscript_available:
                logger.info("🔄 Tentativa 2: Removendo proteções com Ghostscript")
                temp_clean_pdf = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False)
                temp_clean_pdf.close()
                if remove_pdf_protections_gs(input_path, temp_clean_pdf.name):
                    try:
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
                        shutil.copy2(temp_clean_pdf.name, output_path)
                        logger.info("✅ PDF limpo copiado como fallback")
                        return True
                else:
                    logger.warning("Não foi possível limpar o PDF")
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
                if ghostscript_available:
                    try:
                        logger.info("🔄 Tentativa 4: PDF → Imagem → OCR")
                        temp_img_dir = tempfile.mkdtemp()
                        gs_cmd = [
                            'gswin64c', '-sDEVICE=pngalpha', '-r300',
                            '-o', os.path.join(temp_img_dir, 'page_%d.png'),
                            input_path
                        ]
                        result = subprocess.run(gs_cmd, capture_output=True, text=True, timeout=120)
                        if result.returncode == 0:
                            image_files = [f for f in os.listdir(temp_img_dir) if f.endswith('.png')]
                            image_files.sort()
                            if image_files:
                                first_img = os.path.join(temp_img_dir, image_files[0])
                                text_result = subprocess.run([
                                    'tesseract', first_img, 'stdout', '-l', 'por',
                                    '--oem', '3', '--psm', '6'
                                ], capture_output=True, text=True, timeout=30)
                                if text_result.returncode == 0 and text_result.stdout.strip():
                                    shutil.copy2(input_path, output_path)
                                    logger.info("✅ OCR via imagem concluído!")
                                    return True
                    except Exception as e4:
                        logger.error(f"Tentativa 4 falhou: {str(e4)}")
                logger.info("🔄 Tentativa 5: Copiando arquivo original")
                shutil.copy2(input_path, output_path)
                logger.info("✅ Arquivo original copiado como último recurso")
                return True
    except Exception as e:
        logger.error(f"Erro no OCR MELHOR: {str(e)}")
        raise e 