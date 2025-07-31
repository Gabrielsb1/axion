@echo off
echo ========================================
echo    NicSan - Sistema Inteligente
echo ========================================
echo.

echo [1/3] Ativando ambiente virtual...
if not exist venv (
    echo ❌ Ambiente virtual nao encontrado!
    echo Execute primeiro: install_windows.bat
    pause
    exit /b 1
)

call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ❌ Erro ao ativar ambiente virtual!
    pause
    exit /b 1
) else (
    echo ✅ Ambiente virtual ativado
)

echo.
echo [2/3] Verificando chave OpenAI...
if "%OPENAI_API_KEY%"=="" (
    echo ⚠️ Chave OpenAI nao configurada!
    echo Para configurar temporariamente:
    echo set OPENAI_API_KEY=sua_chave_aqui
    echo.
    echo Para configurar permanentemente:
    echo 1. Crie um arquivo .env na pasta do projeto
    echo 2. Adicione: OPENAI_API_KEY=sua_chave_aqui
    echo.
    echo O sistema funcionara, mas sem recursos de IA
) else (
    echo ✅ Chave OpenAI configurada
)

echo.
echo [3/3] Iniciando servidor...
echo.
echo 🌐 O sistema sera iniciado em: http://localhost:5000
echo 📁 Pasta do projeto: %CD%
echo 🔑 Chave OpenAI: %OPENAI_API_KEY%
echo.
echo Pressione Ctrl+C para parar o servidor
echo.
python app.py 