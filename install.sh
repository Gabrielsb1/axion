#!/bin/bash

echo "========================================"
echo "   Axion - Sistema OCR Completo"
echo "========================================"
echo

echo "[1/7] Verificando Python..."
if command -v python3 &> /dev/null; then
    echo "✅ Python encontrado!"
    python3 --version
else
    echo "❌ ERRO: Python 3 não encontrado!"
    echo "Por favor, instale o Python 3.12+ primeiro."
    echo "Ubuntu/Debian: sudo apt-get install python3 python3-pip python3-venv"
    echo "macOS: brew install python@3.12"
    exit 1
fi

echo
echo "[2/7] Verificando Tesseract OCR..."
if command -v tesseract &> /dev/null; then
    echo "✅ Tesseract encontrado!"
    tesseract --version | head -1
else
    echo "⚠️ Tesseract não encontrado!"
    echo "Instalando Tesseract OCR..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y tesseract-ocr tesseract-ocr-por
    elif command -v brew &> /dev/null; then
        brew install tesseract tesseract-lang
    else
        echo "❌ Não foi possível instalar Tesseract automaticamente."
        echo "Por favor, instale manualmente:"
        echo "Ubuntu/Debian: sudo apt-get install tesseract-ocr tesseract-ocr-por"
        echo "macOS: brew install tesseract tesseract-lang"
        read -p "Deseja continuar mesmo assim? (s/n): " continue
        if [[ ! $continue =~ ^[Ss]$ ]]; then
            exit 1
        fi
    fi
fi

echo
echo "[3/7] Verificando qpdf..."
if command -v qpdf &> /dev/null; then
    echo "✅ qpdf encontrado!"
    qpdf --version | head -1
else
    echo "⚠️ qpdf não encontrado!"
    echo "Instalando qpdf..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get install -y qpdf
    elif command -v brew &> /dev/null; then
        brew install qpdf
    else
        echo "❌ Não foi possível instalar qpdf automaticamente."
        echo "Por favor, instale manualmente:"
        echo "Ubuntu/Debian: sudo apt-get install qpdf"
        echo "macOS: brew install qpdf"
        read -p "Deseja continuar mesmo assim? (s/n): " continue
        if [[ ! $continue =~ ^[Ss]$ ]]; then
            exit 1
        fi
    fi
fi

echo
echo "[4/7] Verificando Ghostscript (opcional)..."
if command -v gs &> /dev/null; then
    echo "✅ Ghostscript encontrado!"
    gs --version | head -1
else
    echo "⚠️ Ghostscript não encontrado (opcional para otimização)"
    echo "Para instalar:"
    echo "Ubuntu/Debian: sudo apt-get install ghostscript"
    echo "macOS: brew install ghostscript"
fi

echo
echo "[5/7] Criando ambiente virtual..."
if [ -d "venv" ]; then
    echo "✅ Ambiente virtual já existe."
else
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "❌ ERRO: Falha ao criar ambiente virtual!"
        exit 1
    fi
    echo "✅ Ambiente virtual criado!"
fi

echo
echo "[6/7] Ativando ambiente virtual..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "❌ ERRO: Falha ao ativar ambiente virtual!"
    exit 1
fi
echo "✅ Ambiente virtual ativado!"

echo
echo "[7/7] Instalando dependências Python..."
pip install --upgrade pip
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ ERRO: Falha ao instalar dependências!"
    exit 1
fi
echo "✅ Dependências instaladas!"

echo
echo "========================================"
echo "   Instalação concluída com sucesso!"
echo "========================================"
echo
echo "🔧 Testando instalação..."
python test_nova_ocr.py
if [ $? -eq 0 ]; then
    echo "✅ Teste de OCR passou!"
else
    echo "⚠️ Teste de OCR falhou. Verifique as dependências."
fi
echo
echo "🚀 Para executar o sistema:"
echo "1. Ative o ambiente virtual: source venv/bin/activate"
echo "2. Execute: python app.py"
echo "3. Acesse: http://localhost:5000"
echo
echo "📝 IMPORTANTE: Configure sua chave da OpenAI no config.py"
echo 