@echo off
echo ========================================
echo    INSTALACAO AUTOMATICA - AXION
echo ========================================
echo.

echo [1/8] Verificando Python...
python --version
if %errorlevel% neq 0 (
    echo ❌ ERRO: Python nao encontrado!
    echo Instale Python 3.12 de: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo.
echo [2/8] Verificando Tesseract OCR...
tesseract --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Tesseract nao encontrado!
    echo Por favor, instale o Tesseract OCR:
    echo 1. Baixe de: https://github.com/UB-Mannheim/tesseract/wiki
    echo 2. Instale e adicione ao PATH do sistema
    echo 3. Reinicie este script
    set /p continue="Deseja continuar mesmo assim? (s/n): "
    if /i not "%continue%"=="s" (
        pause
        exit /b 1
    )
) else (
    echo ✅ Tesseract encontrado!
)

echo.
echo [3/8] Verificando qpdf...
qpdf --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️ qpdf nao encontrado!
    echo Por favor, instale o qpdf:
    echo 1. Baixe de: https://github.com/qpdf/qpdf/releases
    echo 2. Extraia para C:\qpdf\
    echo 3. Adicione C:\qpdf\bin ao PATH do sistema
    echo 4. Reinicie este script
    set /p continue="Deseja continuar mesmo assim? (s/n): "
    if /i not "%continue%"=="s" (
        pause
        exit /b 1
    )
) else (
    echo ✅ qpdf encontrado!
)

echo.
echo [4/8] Verificando Ghostscript (opcional)...
gs --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Ghostscript nao encontrado (opcional para otimizacao)
    echo Para instalar:
    echo 1. Baixe de: https://ghostscript.com/releases/gsdnld.html
    echo 2. Instale e adicione ao PATH do sistema
) else (
    echo ✅ Ghostscript encontrado!
)

echo.
echo [5/8] Criando ambiente virtual...
python -m venv venv
if %errorlevel% neq 0 (
    echo ❌ ERRO: Falha ao criar ambiente virtual!
    pause
    exit /b 1
)

echo.
echo [6/8] Ativando ambiente virtual...
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo ❌ ERRO: Falha ao ativar ambiente virtual!
    pause
    exit /b 1
)

echo.
echo [7/8] Instalando dependencias Python...
python -m pip install --upgrade pip
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ ERRO: Falha ao instalar dependencias!
    pause
    exit /b 1
)

echo.
echo [8/8] Criando diretorios necessarios...
if not exist "uploads" mkdir uploads
if not exist "processed" mkdir processed

echo.
echo ========================================
echo    INSTALACAO CONCLUIDA COM SUCESSO!
echo ========================================
echo.
echo 🔧 Testando instalacao...
python test_nova_ocr.py
if %errorlevel% neq 0 (
    echo ⚠️ Teste de OCR falhou. Verifique as dependencias.
) else (
    echo ✅ Teste de OCR passou!
)
echo.
echo 🚀 Para executar o sistema:
echo 1. Ative o ambiente virtual: venv\Scripts\activate.bat
echo 2. Execute: python app.py
echo 3. Acesse: http://localhost:5000
echo.
echo 📝 IMPORTANTE: Configure sua chave da OpenAI no config.py
echo.
pause 