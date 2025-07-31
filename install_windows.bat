@echo off
echo ========================================
echo    NicSan - Instalador Windows
echo ========================================
echo.

echo [1/6] Verificando Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python nao encontrado!
    echo Por favor, instale o Python 3.8+ de: https://python.org
    echo Certifique-se de marcar "Add Python to PATH" durante a instalacao
    pause
    exit /b 1
) else (
    echo ✅ Python encontrado
    python --version
)

echo.
echo [2/6] Verificando pip...
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip nao encontrado!
    pause
    exit /b 1
) else (
    echo ✅ pip encontrado
)

echo.
echo [3/6] Criando ambiente virtual...
if exist venv (
    echo ⚠️ Ambiente virtual ja existe, removendo...
    rmdir /s /q venv
)
python -m venv venv
if errorlevel 1 (
    echo ❌ Erro ao criar ambiente virtual!
    pause
    exit /b 1
) else (
    echo ✅ Ambiente virtual criado
)

echo.
echo [4/6] Ativando ambiente virtual...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ❌ Erro ao ativar ambiente virtual!
    pause
    exit /b 1
) else (
    echo ✅ Ambiente virtual ativado
)

echo.
echo [5/6] Instalando dependencias...
pip install --upgrade pip
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Erro ao instalar dependencias!
    echo Verifique se voce tem conexao com a internet
    pause
    exit /b 1
) else (
    echo ✅ Dependencias instaladas com sucesso
)

echo.
echo [6/6] Verificando Tesseract OCR...
tesseract --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Tesseract OCR nao encontrado!
    echo Para funcionalidade completa, instale o Tesseract:
    echo 1. Baixe de: https://github.com/UB-Mannheim/tesseract/wiki
    echo 2. Instale com idiomas portugues e ingles
    echo 3. Adicione ao PATH do sistema
    echo.
    echo O sistema funcionara sem OCR, mas com funcionalidades limitadas
) else (
    echo ✅ Tesseract OCR encontrado
    tesseract --version
)

echo.
echo ========================================
echo    Instalacao Concluida!
echo ========================================
echo.
echo Para executar o sistema:
echo 1. Ative o ambiente virtual: venv\Scripts\activate.bat
echo 2. Configure a chave OpenAI: set OPENAI_API_KEY=sua_chave_aqui
echo 3. Execute: python app.py
echo 4. Acesse: http://localhost:5000
echo.
echo Para facilitar, use o script: run_nicsan.bat
echo.
pause 