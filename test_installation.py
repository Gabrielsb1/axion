#!/usr/bin/env python3
"""
Script de teste para verificar a instalação do NicSan
Execute este script após a instalação para verificar se tudo está funcionando
"""

import sys
import os
import importlib
import subprocess
from pathlib import Path

def print_header(title):
    print(f"\n{'='*50}")
    print(f"  {title}")
    print(f"{'='*50}")

def print_success(message):
    print(f"✅ {message}")

def print_error(message):
    print(f"❌ {message}")

def print_warning(message):
    print(f"⚠️ {message}")

def check_python_version():
    """Verificar versão do Python"""
    print_header("VERIFICANDO PYTHON")
    
    version = sys.version_info
    print(f"Versão Python: {version.major}.{version.minor}.{version.micro}")
    
    if version.major >= 3 and version.minor >= 8:
        print_success("Python 3.8+ detectado")
        return True
    else:
        print_error("Python 3.8+ é necessário")
        return False

def check_dependencies():
    """Verificar dependências Python"""
    print_header("VERIFICANDO DEPENDÊNCIAS")
    
    dependencies = [
        'flask',
        'werkzeug', 
        'flask_cors',
        'pypdf',
        'PyPDF2',
        'pikepdf',
        'ocrmypdf',
        'PIL',  # Pillow
        'openai',
        'reportlab',
        'docx',
        'pandas',
        'openpyxl',
        'cryptography',
        'dotenv'
    ]
    
    missing = []
    for dep in dependencies:
        try:
            importlib.import_module(dep)
            print_success(f"{dep}")
        except ImportError:
            print_error(f"{dep} - NÃO ENCONTRADO")
            missing.append(dep)
    
    if missing:
        print_warning(f"Dependências faltando: {', '.join(missing)}")
        return False
    else:
        print_success("Todas as dependências estão instaladas")
        return True

def check_tesseract():
    """Verificar Tesseract OCR"""
    print_header("VERIFICANDO TESSERACT OCR")
    
    try:
        result = subprocess.run(['tesseract', '--version'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            version_line = result.stdout.split('\n')[0]
            print_success(f"Tesseract encontrado: {version_line}")
            
            # Verificar idiomas
            lang_result = subprocess.run(['tesseract', '--list-langs'], 
                                       capture_output=True, text=True, timeout=10)
            if 'por' in lang_result.stdout and 'eng' in lang_result.stdout:
                print_success("Idiomas português e inglês disponíveis")
                return True
            else:
                print_warning("Idiomas português e inglês não encontrados")
                return False
        else:
            print_error("Tesseract não encontrado")
            return False
    except (subprocess.TimeoutExpired, FileNotFoundError):
        print_error("Tesseract não encontrado no PATH")
        print_warning("Instale o Tesseract para funcionalidade completa de OCR")
        return False

def check_project_structure():
    """Verificar estrutura do projeto"""
    print_header("VERIFICANDO ESTRUTURA DO PROJETO")
    
    required_files = [
        'app.py',
        'config.py',
        'security.py',
        'requirements.txt',
        'README.md',
        'static/index.html',
        'static/styles.css',
        'ai/__init__.py',
        'ai/openai_service.py',
        'ai/ocr_service.py',
        'api/__init__.py',
        'api/routes_ai.py',
        'api/routes_utils.py'
    ]
    
    missing_files = []
    for file_path in required_files:
        if os.path.exists(file_path):
            print_success(f"{file_path}")
        else:
            print_error(f"{file_path} - NÃO ENCONTRADO")
            missing_files.append(file_path)
    
    if missing_files:
        print_warning(f"Arquivos faltando: {len(missing_files)}")
        return False
    else:
        print_success("Estrutura do projeto está completa")
        return True

def check_environment():
    """Verificar variáveis de ambiente"""
    print_header("VERIFICANDO VARIÁVEIS DE AMBIENTE")
    
    openai_key = os.getenv('OPENAI_API_KEY')
    if openai_key:
        print_success("OPENAI_API_KEY configurada")
        print(f"   Chave: {openai_key[:10]}...{openai_key[-4:]}")
    else:
        print_warning("OPENAI_API_KEY não configurada")
        print("   Configure com: set OPENAI_API_KEY=sua_chave_aqui")
    
    return True

def test_flask_app():
    """Testar aplicação Flask"""
    print_header("TESTANDO APLICAÇÃO FLASK")
    
    try:
        # Importar módulos do projeto
        from config import Config
        print_success("Configurações carregadas")
        
        from security import secure_manager
        print_success("Sistema de segurança carregado")
        
        from ai.ocr_service import OCR_AVAILABLE, TESSERACT_AVAILABLE
        print_success("Serviços OCR carregados")
        
        from ai.openai_service import extract_fields_with_openai
        print_success("Serviços OpenAI carregados")
        
        return True
    except Exception as e:
        print_error(f"Erro ao carregar aplicação: {str(e)}")
        return False

def main():
    """Função principal"""
    print_header("TESTE DE INSTALAÇÃO NIC SAN")
    print("Este script verifica se a instalação está correta")
    
    results = []
    
    # Executar verificações
    results.append(("Python", check_python_version()))
    results.append(("Dependências", check_dependencies()))
    results.append(("Tesseract", check_tesseract()))
    results.append(("Estrutura", check_project_structure()))
    results.append(("Ambiente", check_environment()))
    results.append(("Flask App", test_flask_app()))
    
    # Resumo final
    print_header("RESUMO DA VERIFICAÇÃO")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASSOU" if result else "❌ FALHOU"
        print(f"{name:15} {status}")
    
    print(f"\nResultado: {passed}/{total} verificações passaram")
    
    if passed == total:
        print_success("🎉 Instalação completa e funcional!")
        print("\nPara iniciar o sistema:")
        print("1. Execute: run_nicsan.bat")
        print("2. Acesse: http://localhost:5000")
    else:
        print_warning("⚠️ Alguns problemas foram encontrados")
        print("\nSoluções:")
        print("1. Execute: install_windows.bat")
        print("2. Configure o Tesseract: setup_tesseract.bat")
        print("3. Configure a chave OpenAI")
        print("4. Execute este teste novamente")

if __name__ == "__main__":
    main() 