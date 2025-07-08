@echo off
echo ========================================
echo    INSTALACAO AUTOMATICA - AXION
echo ========================================
echo.

echo [1/6] Verificando Python...
python --version
if %errorlevel% neq 0 (
    echo ERRO: Python nao encontrado!
    echo Instale Python 3.12 de: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo.
echo [2/6] Criando ambiente virtual...
python -m venv venv
if %errorlevel% neq 0 (
    echo ERRO: Falha ao criar ambiente virtual!
    pause
    exit /b 1
)

echo.
echo [3/6] Ativando ambiente virtual...
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo ERRO: Falha ao ativar ambiente virtual!
    pause
    exit /b 1
)

echo.
echo [4/6] Instalando dependencias...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias!
    pause
    exit /b 1
)

echo.
echo [5/6] Instalando dependencias adicionais...
pip install pypdf==5.7.0
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar pypdf!
    pause
    exit /b 1
)

echo.
echo [6/6] Criando diretorios necessarios...
if not exist "uploads" mkdir uploads
if not exist "processed" mkdir processed

echo.
echo ========================================
echo    INSTALACAO CONCLUIDA COM SUCESSO!
echo ========================================
echo.
echo Para executar o sistema:
echo 1. Ative o ambiente virtual: venv\Scripts\activate.bat
echo 2. Execute: python app.py
echo 3. Acesse: http://localhost:5000
echo.
echo IMPORTANTE: Configure sua chave da OpenAI no config.py
echo.
pause 