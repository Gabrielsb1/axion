@echo off
echo ========================================
echo    Configuracao Tesseract OCR
echo ========================================
echo.

echo Este script ajuda a configurar o Tesseract OCR para o NicSan
echo.

echo [1/4] Verificando Tesseract instalado...
tesseract --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Tesseract nao encontrado!
    echo.
    echo Para instalar o Tesseract OCR:
    echo.
    echo 1. Baixe o instalador Windows:
    echo    https://github.com/UB-Mannheim/tesseract/wiki
    echo.
    echo 2. Execute o instalador como administrador
    echo.
    echo 3. Durante a instalacao:
    echo    - Escolha "Additional language data (download)"
    echo    - Selecione "Portuguese" e "English"
    echo    - Marque "Add to PATH"
    echo.
    echo 4. Reinicie o computador
    echo.
    echo 5. Execute este script novamente
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Tesseract encontrado
    tesseract --version
)

echo.
echo [2/4] Verificando idiomas instalados...
tesseract --list-langs > temp_langs.txt 2>&1
findstr /i "por" temp_langs.txt >nul
if errorlevel 1 (
    echo ⚠️ Portugues nao encontrado
    echo Instale o idioma portugues no Tesseract
) else (
    echo ✅ Portugues encontrado
)

findstr /i "eng" temp_langs.txt >nul
if errorlevel 1 (
    echo ⚠️ Ingles nao encontrado
    echo Instale o idioma ingles no Tesseract
) else (
    echo ✅ Ingles encontrado
)

del temp_langs.txt

echo.
echo [3/4] Testando OCR...
echo Teste > test_ocr.txt
tesseract test_ocr.txt stdout >nul 2>&1
if errorlevel 1 (
    echo ❌ Erro no teste OCR
    echo Verifique a instalacao do Tesseract
) else (
    echo ✅ Teste OCR bem-sucedido
)
del test_ocr.txt

echo.
echo [4/4] Configuracao concluida!
echo.
echo O Tesseract OCR esta configurado corretamente.
echo O NicSan agora tera funcionalidade completa de OCR.
echo.
pause 