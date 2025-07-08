#!/bin/bash

echo "========================================"
echo "   Axion - Sistema de OCR Tesseract"
echo "========================================"
echo

echo "[1/5] Verificando Python..."
if command -v python3 &> /dev/null; then
    echo "Python encontrado!"
    python3 --version
else
    echo "ERRO: Python 3 não encontrado!"
    echo "Por favor, instale o Python 3.8+ primeiro."
    echo "Ubuntu/Debian: sudo apt-get install python3 python3-pip"
    echo "macOS: brew install python3"
    exit 1
fi

echo
echo "[2/5] Verificando Tesseract..."
if command -v tesseract &> /dev/null; then
    echo "Tesseract encontrado!"
    tesseract --version
else
    echo "AVISO: Tesseract não encontrado!"
    echo "Por favor, instale o Tesseract OCR:"
    echo "Ubuntu/Debian: sudo apt-get install tesseract-ocr tesseract-ocr-por"
    echo "macOS: brew install tesseract tesseract-lang"
    echo
    read -p "Deseja continuar mesmo assim? (s/n): " continue
    if [[ ! $continue =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

echo
echo "[3/5] Criando ambiente virtual..."
if [ -d "venv" ]; then
    echo "Ambiente virtual já existe."
else
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "ERRO: Falha ao criar ambiente virtual!"
        exit 1
    fi
    echo "Ambiente virtual criado!"
fi

echo
echo "[4/5] Ativando ambiente virtual..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao ativar ambiente virtual!"
    exit 1
fi
echo "Ambiente virtual ativado!"

echo
echo "[5/5] Instalando dependências..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao instalar dependências!"
    exit 1
fi
echo "Dependências instaladas!"

echo
echo "========================================"
echo "   Instalação concluída com sucesso!"
echo "========================================"
echo
echo "Para executar o sistema:"
echo "1. Ative o ambiente virtual: source venv/bin/activate"
echo "2. Execute: python app.py"
echo "3. Acesse: http://localhost:5000"
echo 