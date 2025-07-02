# Funções de extração de campos de matrícula via regex

# (O conteúdo será movido do app_ocr_melhor.py) 

import re
import logging
import PyPDF2
import subprocess

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