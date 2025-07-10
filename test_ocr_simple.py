#!/usr/bin/env python3
"""
Script de teste simplificado para verificar se o OCR está funcionando
"""

import sys
import subprocess
import logging

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

def test_tesseract_languages():
    """Testa se o português está disponível no tesseract"""
    try:
        result = subprocess.run(['tesseract', '--list-langs'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            languages = result.stdout.strip().split('\n')[1:]  # Remove header
            if 'por' in languages:
                logging.info("✅ Idioma português disponível no Tesseract")
                return True
            else:
                logging.warning(f"⚠️ Idioma português não encontrado. Idiomas disponíveis: {languages}")
                return False
        else:
            logging.error(f"❌ Erro ao listar idiomas: {result.stderr}")
            return False
    except Exception as e:
        logging.error(f"❌ Erro ao testar idiomas do Tesseract: {e}")
        return False

def main():
    """Executa todos os testes"""
    logging.info("🔍 Iniciando testes de OCR simplificados...")
    
    tests = [
        ("ocrmypdf", test_ocrmypdf),
        ("tesseract", test_tesseract),
        ("tesseract_languages", test_tesseract_languages)
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
        logging.info("\n🎉 TODOS OS TESTES PASSARAM! OCR deve funcionar corretamente.")
        sys.exit(0)
    else:
        logging.error("\n💥 ALGUNS TESTES FALHARAM! OCR pode não funcionar.")
        sys.exit(1)

if __name__ == "__main__":
    main() 