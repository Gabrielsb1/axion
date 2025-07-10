#!/usr/bin/env python3
"""
Script para testar OCR localmente
"""

import os
import sys
import tempfile
import logging
from pathlib import Path

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def test_ocr_import():
    """Testa se o módulo OCR pode ser importado"""
    try:
        from ai.ocr_service import OCR_AVAILABLE, TESSERACT_AVAILABLE, aplicar_ocr
        logging.info(f"✅ Módulo OCR importado com sucesso")
        logging.info(f"   - OCR_AVAILABLE: {OCR_AVAILABLE}")
        logging.info(f"   - TESSERACT_AVAILABLE: {TESSERACT_AVAILABLE}")
        return OCR_AVAILABLE and TESSERACT_AVAILABLE
    except Exception as e:
        logging.error(f"❌ Erro ao importar módulo OCR: {e}")
        return False

def create_test_pdf():
    """Cria um PDF de teste simples"""
    try:
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        
        # Criar PDF temporário
        temp_pdf = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False)
        temp_pdf.close()
        
        # Criar PDF com texto
        c = canvas.Canvas(temp_pdf.name, pagesize=letter)
        c.drawString(100, 750, "Teste de OCR - Axion")
        c.drawString(100, 730, "Este é um documento de teste para verificar se o OCR está funcionando.")
        c.drawString(100, 710, "Data: 2025")
        c.save()
        
        logging.info(f"✅ PDF de teste criado: {temp_pdf.name}")
        return temp_pdf.name
    except Exception as e:
        logging.error(f"❌ Erro ao criar PDF de teste: {e}")
        return None

def test_ocr_processing():
    """Testa o processamento OCR"""
    try:
        from ai.ocr_service import process_pdf_with_ocr
        
        # Criar PDF de teste
        test_pdf = create_test_pdf()
        if not test_pdf:
            return False
        
        # Criar arquivo de saída
        output_pdf = test_pdf.replace('.pdf', '_ocr.pdf')
        
        # Processar com OCR
        result = process_pdf_with_ocr(test_pdf, output_pdf)
        
        # Limpar arquivos temporários
        try:
            os.unlink(test_pdf)
            if os.path.exists(output_pdf):
                os.unlink(output_pdf)
        except:
            pass
        
        if result['success']:
            logging.info(f"✅ OCR processado com sucesso: {result['message']}")
            return True
        else:
            logging.error(f"❌ Erro no OCR: {result['error']}")
            return False
            
    except Exception as e:
        logging.error(f"❌ Erro ao testar processamento OCR: {e}")
        return False

def main():
    """Executa todos os testes"""
    logging.info("🔍 Iniciando testes de OCR local...")
    
    tests = [
        ("Importação do módulo OCR", test_ocr_import),
        ("Processamento OCR", test_ocr_processing)
    ]
    
    results = {}
    for test_name, test_func in tests:
        logging.info(f"\n--- Testando {test_name} ---")
        results[test_name] = test_func()
    
    # Resumo
    logging.info("\n" + "="*50)
    logging.info("📊 RESUMO DOS TESTES LOCAIS:")
    logging.info("="*50)
    
    all_passed = True
    for test_name, passed in results.items():
        status = "✅ PASSOU" if passed else "❌ FALHOU"
        logging.info(f"{test_name}: {status}")
        if not passed:
            all_passed = False
    
    if all_passed:
        logging.info("\n🎉 TODOS OS TESTES PASSARAM! OCR está funcionando localmente.")
        logging.info("💡 Você pode fazer o deploy com confiança.")
        sys.exit(0)
    else:
        logging.error("\n💥 ALGUNS TESTES FALHARAM! Corrija os problemas antes do deploy.")
        sys.exit(1)

if __name__ == "__main__":
    main() 