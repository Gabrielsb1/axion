# Funções de extração de campos de matrícula via regex

# (O conteúdo será movido do app_ocr_melhor.py) 

import re
import logging
import PyPDF2

def extract_matricula_3ri_fields(pdf_path):
    """Extrai campos específicos da matrícula 3º RI do PDF"""
    logger = logging.getLogger(__name__)
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
            return None
        if not text_content.strip():
            logger.error("Nenhum texto extraído do PDF")
            return None
        # Limpeza e normalização do texto
        text_content = re.sub(r'\s+', ' ', text_content.replace('\n', ' ')).strip()
        # Aqui você pode adicionar regex para extrair campos específicos
        return text_content
    except Exception as e:
        logger.error(f"Erro ao extrair campos: {str(e)}")
        return None 