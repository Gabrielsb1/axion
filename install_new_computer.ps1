# Script de Instalação Automática - Axion Modular
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    INSTALACAO AUTOMATICA - AXION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Python
Write-Host "[1/8] Verificando Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python encontrado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO: Python não encontrado!" -ForegroundColor Red
    Write-Host "Instale Python 3.12 de: https://www.python.org/downloads/" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
} 

# Verificar Tesseract OCR
Write-Host ""
Write-Host "[2/8] Verificando Tesseract OCR..." -ForegroundColor Yellow
try {
    $tesseractVersion = tesseract --version 2>&1 | Select-Object -First 1
    Write-Host "✅ Tesseract encontrado: $tesseractVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Tesseract não encontrado!" -ForegroundColor Yellow
    Write-Host "Por favor, instale o Tesseract OCR:" -ForegroundColor Yellow
    Write-Host "1. Baixe de: https://github.com/UB-Mannheim/tesseract/wiki" -ForegroundColor Yellow
    Write-Host "2. Instale e adicione ao PATH do sistema" -ForegroundColor Yellow
    Write-Host "3. Reinicie este script" -ForegroundColor Yellow
    $continue = Read-Host "Deseja continuar mesmo assim? (s/n)"
    if ($continue -notmatch "^[Ss]$") {
        exit 1
    }
}

# Verificar qpdf
Write-Host ""
Write-Host "[3/8] Verificando qpdf..." -ForegroundColor Yellow
try {
    $qpdfVersion = qpdf --version 2>&1 | Select-Object -First 1
    Write-Host "✅ qpdf encontrado: $qpdfVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️ qpdf não encontrado!" -ForegroundColor Yellow
    Write-Host "Por favor, instale o qpdf:" -ForegroundColor Yellow
    Write-Host "1. Baixe de: https://github.com/qpdf/qpdf/releases" -ForegroundColor Yellow
    Write-Host "2. Extraia para C:\qpdf\" -ForegroundColor Yellow
    Write-Host "3. Adicione C:\qpdf\bin ao PATH do sistema" -ForegroundColor Yellow
    Write-Host "4. Reinicie este script" -ForegroundColor Yellow
    $continue = Read-Host "Deseja continuar mesmo assim? (s/n)"
    if ($continue -notmatch "^[Ss]$") {
        exit 1
    }
}

# Verificar Ghostscript (opcional)
Write-Host ""
Write-Host "[4/8] Verificando Ghostscript (opcional)..." -ForegroundColor Yellow
try {
    $gsVersion = gs --version 2>&1 | Select-Object -First 1
    Write-Host "✅ Ghostscript encontrado: $gsVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Ghostscript não encontrado (opcional para otimização)" -ForegroundColor Yellow
    Write-Host "Para instalar:" -ForegroundColor Yellow
    Write-Host "1. Baixe de: https://ghostscript.com/releases/gsdnld.html" -ForegroundColor Yellow
    Write-Host "2. Instale e adicione ao PATH do sistema" -ForegroundColor Yellow
}

# Criar ambiente virtual
Write-Host ""
Write-Host "[5/8] Criando ambiente virtual..." -ForegroundColor Yellow
try {
    python -m venv venv
    Write-Host "✅ Ambiente virtual criado com sucesso" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO: Falha ao criar ambiente virtual!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Ativar ambiente virtual
Write-Host ""
Write-Host "[6/8] Ativando ambiente virtual..." -ForegroundColor Yellow
try {
    & ".\venv\Scripts\Activate.ps1"
    Write-Host "✅ Ambiente virtual ativado" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO: Falha ao ativar ambiente virtual!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Instalar dependências
Write-Host ""
Write-Host "[7/8] Instalando dependências..." -ForegroundColor Yellow
try {
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    Write-Host "✅ Dependências instaladas com sucesso" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO: Falha ao instalar dependências!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Criar diretórios necessários
Write-Host ""
Write-Host "[8/8] Criando diretórios necessários..." -ForegroundColor Yellow
if (!(Test-Path "uploads")) {
    New-Item -ItemType Directory -Name "uploads"
    Write-Host "✅ Diretório uploads criado" -ForegroundColor Green
}
if (!(Test-Path "processed")) {
    New-Item -ItemType Directory -Name "processed"
    Write-Host "✅ Diretório processed criado" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    INSTALACAO CONCLUIDA COM SUCESSO!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 Testando instalação..." -ForegroundColor White
try {
    python test_nova_ocr.py
    Write-Host "✅ Teste de OCR passou!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Teste de OCR falhou. Verifique as dependências." -ForegroundColor Yellow
}
Write-Host ""
Write-Host "🚀 Para executar o sistema:" -ForegroundColor White
Write-Host "1. Ative o ambiente virtual: .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "2. Execute: python app.py" -ForegroundColor White
Write-Host "3. Acesse: http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "📝 IMPORTANTE: Configure sua chave da OpenAI no config.py" -ForegroundColor Yellow
Write-Host ""
Read-Host "Pressione Enter para sair" 