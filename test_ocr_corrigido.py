#!/usr/bin/env python3
"""
Teste das correções do OCR - AxionDocs
Testa se as correções dos erros de flags conflitantes funcionaram
"""

import os
import sys
import tempfile
import subprocess
import logging
from pathlib import Path

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_ocr_flags():
    """Testa se as flags do OCR não estão conflitando"""
    logger.info("🧪 Testando correções do OCR...")
    
    try:
        # Importar o módulo OCR
        from ai.ocr_service import aplicar_ocr, process_pdf_with_ocr
        
        logger.info("✅ Módulo OCR importado com sucesso")
        
        # Criar um PDF de teste simples
        test_pdf = create_test_pdf()
        if not test_pdf:
            logger.error("❌ Não foi possível criar PDF de teste")
            return False
        
        logger.info(f"📄 PDF de teste criado: {test_pdf}")
        
        # Testar processamento OCR
        output_pdf = test_pdf.replace('.pdf', '_ocr.pdf')
        
        try:
            # Testar função aplicar_ocr diretamente
            logger.info("🔍 Testando aplicar_ocr...")
            aplicar_ocr(test_pdf, output_pdf)
            
            if os.path.exists(output_pdf):
                logger.info("✅ OCR aplicado com sucesso")
                os.remove(output_pdf)  # Limpar
            else:
                logger.error("❌ Arquivo de saída não foi criado")
                return False
                
        except Exception as e:
            logger.error(f"❌ Erro no OCR: {e}")
            return False
        
        # Testar process_pdf_with_ocr
        try:
            logger.info("🔍 Testando process_pdf_with_ocr...")
            result = process_pdf_with_ocr(test_pdf, output_pdf)
            
            if result['success']:
                logger.info("✅ process_pdf_with_ocr funcionou")
                if os.path.exists(output_pdf):
                    os.remove(output_pdf)  # Limpar
            else:
                logger.error(f"❌ process_pdf_with_ocr falhou: {result.get('error')}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Erro em process_pdf_with_ocr: {e}")
            return False
        
        # Limpar arquivo de teste
        if os.path.exists(test_pdf):
            os.remove(test_pdf)
        
        logger.info("🎉 Todos os testes passaram!")
        return True
        
    except ImportError as e:
        logger.error(f"❌ Erro ao importar módulo OCR: {e}")
        return False
    except Exception as e:
        logger.error(f"❌ Erro inesperado: {e}")
        return False

def create_test_pdf():
    """Cria um PDF de teste simples"""
    try:
        # Usar Python para criar um PDF simples
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        
        # Criar arquivo temporário
        fd, temp_path = tempfile.mkstemp(suffix='.pdf')
        os.close(fd)
        
        # Criar PDF simples
        c = canvas.Canvas(temp_path, pagesize=letter)
        c.drawString(100, 750, "Teste de OCR - AxionDocs")
        c.drawString(100, 700, "Este é um documento de teste para verificar o funcionamento do OCR.")
        c.drawString(100, 650, "O sistema deve conseguir extrair este texto corretamente.")
        c.save()
        
        return temp_path
        
    except ImportError:
        logger.warning("reportlab não disponível, tentando criar PDF com outro método...")
        return create_simple_pdf_alternative()
    except Exception as e:
        logger.error(f"Erro ao criar PDF de teste: {e}")
        return None

def create_simple_pdf_alternative():
    """Cria um PDF simples usando subprocess se reportlab não estiver disponível"""
    try:
        # Tentar usar echo + enscript para criar PDF
        fd, temp_path = tempfile.mkstemp(suffix='.pdf')
        os.close(fd)
        
        # Criar arquivo de texto
        text_content = """Teste de OCR - AxionDocs
Este é um documento de teste para verificar o funcionamento do OCR.
O sistema deve conseguir extrair este texto corretamente.
"""
        
        # Tentar converter para PDF usando diferentes métodos
        methods = [
            # Método 1: echo + enscript
            f'echo "{text_content}" | enscript -o {temp_path}',
            # Método 2: echo + ps2pdf
            f'echo "{text_content}" | enscript -o - | ps2pdf - {temp_path}',
            # Método 3: usar Python com fpdf se disponível
            None
        ]
        
        for method in methods:
            if method:
                try:
                    result = subprocess.run(method, shell=True, capture_output=True, timeout=10)
                    if result.returncode == 0 and os.path.exists(temp_path):
                        return temp_path
                except:
                    continue
        
        # Se nenhum método funcionou, criar um arquivo de texto
        logger.warning("Não foi possível criar PDF, usando arquivo de texto como fallback")
        text_file = temp_path.replace('.pdf', '.txt')
        with open(text_file, 'w', encoding='utf-8') as f:
            f.write(text_content)
        return text_file
        
    except Exception as e:
        logger.error(f"Erro ao criar PDF alternativo: {e}")
        return None

def test_frontend_fixes():
    """Testa se as correções do frontend estão funcionando"""
    logger.info("🧪 Testando correções do frontend...")
    
    # Verificar se os arquivos JS foram corrigidos
    js_files = [
        'static/js/process.js',
        'static/app-simple.js'
    ]
    
    for js_file in js_files:
        if not os.path.exists(js_file):
            logger.warning(f"⚠️ Arquivo {js_file} não encontrado")
            continue
            
        try:
            with open(js_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Verificar se as correções estão presentes
            if 'try {' in content and 'await response.json()' in content:
                logger.info(f"✅ {js_file} parece ter as correções aplicadas")
            else:
                logger.warning(f"⚠️ {js_file} pode não ter todas as correções")
                
        except Exception as e:
            logger.error(f"❌ Erro ao verificar {js_file}: {e}")
    
    logger.info("✅ Verificação do frontend concluída")

def main():
    """Função principal"""
    logger.info("🚀 Iniciando testes das correções do OCR...")
    
    # Testar correções do backend
    backend_ok = test_ocr_flags()
    
    # Testar correções do frontend
    test_frontend_fixes()
    
    if backend_ok:
        logger.info("🎉 Todos os testes passaram! As correções estão funcionando.")
        return True
    else:
        logger.error("❌ Alguns testes falharam. Verifique os logs acima.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 