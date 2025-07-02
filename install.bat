@echo off
echo ========================================
echo    Axion - Sistema de OCR Tesseract
echo ========================================
echo.

echo [1/5] Verificando Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Python nao encontrado!
    echo Por favor, instale o Python 3.8+ primeiro.
    echo Download: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo Python encontrado!

echo.
echo [2/5] Verificando Tesseract...
tesseract --version >nul 2>&1
if errorlevel 1 (
    echo AVISO: Tesseract nao encontrado!
    echo Por favor, instale o Tesseract OCR:
    echo 1. Baixe de: https://github.com/UB-Mannheim/tesseract/wiki
    echo 2. Instale e adicione ao PATH do sistema
    echo 3. Reinicie este script
    echo.
    set /p continue="Deseja continuar mesmo assim? (s/n): "
    if /i not "%continue%"=="s" (
        pause
        exit /b 1
    )
) else (
    echo Tesseract encontrado!
)

echo.
echo [3/5] Criando ambiente virtual...
if exist venv (
    echo Ambiente virtual ja existe.
) else (
    python -m venv venv
    if errorlevel 1 (
        echo ERRO: Falha ao criar ambiente virtual!
        pause
        exit /b 1
    )
    echo Ambiente virtual criado!
)

echo.
echo [4/5] Ativando ambiente virtual...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERRO: Falha ao ativar ambiente virtual!
    pause
    exit /b 1
)
echo Ambiente virtual ativado!

echo.
echo [5/5] Instalando dependencias...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias!
    pause
    exit /b 1
)
echo Dependencias instaladas!

echo.
echo ========================================
echo    Instalacao concluida com sucesso!
echo ========================================
echo.
echo Para executar o sistema:
echo 1. Ative o ambiente virtual: venv\Scripts\activate
echo 2. Execute: python app.py
echo 3. Acesse: http://localhost:5000
echo.
pause 