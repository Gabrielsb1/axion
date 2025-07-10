#!/usr/bin/env python3
"""
Script para testar OCR após o deploy
Execute este script após o deploy para verificar se o OCR está funcionando
"""

import sys
import subprocess
import logging
import tempfile
import os

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def test_ocrmypdf():
    """Testa se o ocrmypdf está disponível"""
    try:
        import ocrmypdf
        version = getattr(ocrmypdf, '__version__', 'versão desconhecida')
        logging.info(f"✅ ocrmypdf disponível - versão: {version}")
        return True
    except ImportError as e:
        logging.error(f"❌ ocrmypdf não disponível: {e}")
        return False
    except Exception as e:
        logging.error(f"❌ Erro ao importar ocrmypdf: {e}")
        return False

def test_tesseract():
    """Testa se o tesseract está disponível"""
    try:
        result = subprocess.run(['tesseract', '--version'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            version = result.stdout.split()[1] if result.stdout else 'versão desconhecida'
            logging.info(f"✅ Tesseract disponível - versão: {version}")
            return True
        else:
            logging.error(f"❌ Tesseract não funcionando: {result.stderr}")
            return False
    except FileNotFoundError:
        logging.error("❌ Tesseract não encontrado no PATH")
        return False
    except Exception as e:
        logging.error(f"❌ Erro ao testar Tesseract: {e}")
        return False

def test_ocr_processing():
    """Testa o processamento OCR com um PDF simples"""
    try:
        from ai.ocr_service import process_pdf_with_ocr
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        
        # Criar PDF de teste
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_pdf:
            temp_pdf_path = temp_pdf.name
        
        # Criar PDF com texto
        c = canvas.Canvas(temp_pdf_path, pagesize=letter)
        c.drawString(100, 750, "Teste de OCR - Axion")
        c.drawString(100, 730, "Este é um documento de teste para verificar se o OCR está funcionando.")
        c.drawString(100, 710, "Data: 2025")
        c.save()
        
        # Criar arquivo de saída
        output_pdf = temp_pdf_path.replace('.pdf', '_ocr.pdf')
        
        # Processar com OCR
        result = process_pdf_with_ocr(temp_pdf_path, output_pdf)
        
        # Limpar arquivos temporários
        try:
            os.unlink(temp_pdf_path)
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
    logging.info("🔍 Iniciando testes de OCR após deploy...")
    
    tests = [
        ("ocrmypdf", test_ocrmypdf),
        ("tesseract", test_tesseract),
        ("ocr_processing", test_ocr_processing)
    ]
    
    results = {}
    for test_name, test_func in tests:
        logging.info(f"\n--- Testando {test_name} ---")
        results[test_name] = test_func()
    
    # Resumo
    logging.info("\n" + "="*50)
    logging.info("📊 RESUMO DOS TESTES:")
    logging.info("="*50)
    
    all_passed = True
    for test_name, passed in results.items():
        status = "✅ PASSOU" if passed else "❌ FALHOU"
        logging.info(f"{test_name}: {status}")
        if not passed:
            all_passed = False
    
    if all_passed:
        logging.info("\n🎉 TODOS OS TESTES PASSARAM! OCR está funcionando corretamente.")
        sys.exit(0)
    else:
        logging.error("\n💥 ALGUNS TESTES FALHARAM! OCR pode não funcionar.")
        logging.error("💡 Verifique os logs da aplicação para mais detalhes.")
        sys.exit(1)

if __name__ == "__main__":
    main() 