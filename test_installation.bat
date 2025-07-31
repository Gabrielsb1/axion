@echo off
echo ========================================
echo    Teste de Instalacao NicSan
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
echo [2/3] Executando teste de instalacao...
python test_installation.py
if errorlevel 1 (
    echo ❌ Erro ao executar teste!
    pause
    exit /b 1
)

echo.
echo [3/3] Teste concluido!
echo.
echo Verifique os resultados acima.
echo Se houver problemas, consulte o GUIA_INSTALACAO_WINDOWS.md
echo.
pause 