#!/usr/bin/env python3
"""
test_ocr.py - Script de teste para o sistema Axion OCR
"""

import os
import sys
import subprocess
import requests
import time

def check_python():
    """Verificar se o Python está instalado"""
    print("🐍 Verificando Python...")
    try:
        version = sys.version_info
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} encontrado")
        return True
    except Exception as e:
        print(f"❌ Erro ao verificar Python: {e}")
        return False

def check_tesseract():
    """Verificar se o Tesseract está instalado"""
    print("\n🔍 Verificando Tesseract...")
    try:
        result = subprocess.run(['tesseract', '--version'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            version_line = result.stdout.split('\n')[0]
            print(f"✅ {version_line}")
            
            # Verificar idiomas disponíveis
            lang_result = subprocess.run(['tesseract', '--list-langs'], 
                                       capture_output=True, text=True, timeout=10)
            if 'por' in lang_result.stdout:
                print("✅ Idioma português disponível")
            else:
                print("⚠️  Idioma português não encontrado")
                
            return True
        else:
            print("❌ Tesseract não encontrado ou com erro")
            return False
    except FileNotFoundError:
        print("❌ Tesseract não encontrado no PATH")
        print("   Instale em: https://github.com/UB-Mannheim/tesseract/wiki")
        return False
    except Exception as e:
        print(f"❌ Erro ao verificar Tesseract: {e}")
        return False

def check_dependencies():
    """Verificar dependências Python"""
    print("\n📦 Verificando dependências Python...")
    required_packages = [
        'flask',
        'ocrmypdf',
        'pillow',
        'werkzeug'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} - não instalado")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n⚠️  Pacotes faltando: {', '.join(missing_packages)}")
        print("   Execute: pip install -r requirements.txt")
        return False
    
    return True

def check_directories():
    """Verificar diretórios do projeto"""
    print("\n📁 Verificando diretórios...")
    required_dirs = ['static', 'uploads', 'processed']
    
    for dir_name in required_dirs:
        if os.path.exists(dir_name):
            print(f"✅ {dir_name}/")
        else:
            print(f"❌ {dir_name}/ - não encontrado")
            return False
    
    return True

def test_server():
    """Testar se o servidor Flask está funcionando"""
    print("\n🌐 Testando servidor Flask...")
    
    try:
        # Importar e criar app
        from app import app
        
        # Testar configuração
        print(f"✅ Servidor configurado para porta {app.config['PORT']}")
        print(f"✅ Modo debug: {app.config['DEBUG']}")
        print(f"✅ Upload folder: {app.config['UPLOAD_FOLDER']}")
        print(f"✅ Processed folder: {app.config['PROCESSED_FOLDER']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao testar servidor: {e}")
        return False

def main():
    """Função principal de teste"""
    print("=" * 50)
    print("    Axion OCR - Teste de Sistema")
    print("=" * 50)
    
    tests = [
        ("Python", check_python),
        ("Tesseract", check_tesseract),
        ("Dependências", check_dependencies),
        ("Diretórios", check_directories),
        ("Servidor", test_server)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Erro no teste {test_name}: {e}")
            results.append((test_name, False))
    
    # Resumo
    print("\n" + "=" * 50)
    print("    RESUMO DOS TESTES")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSOU" if result else "❌ FALHOU"
        print(f"{test_name:15} {status}")
        if result:
            passed += 1
    
    print(f"\nResultado: {passed}/{total} testes passaram")
    
    if passed == total:
        print("\n🎉 Sistema pronto para uso!")
        print("   Execute: python app.py")
        print("   Acesse: http://localhost:5000")
    else:
        print("\n⚠️  Alguns testes falharam. Verifique os erros acima.")
        print("   Consulte o README.md para instruções de instalação.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 