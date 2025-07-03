# Script de Instalação Automática - Axion Modular
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    INSTALACAO AUTOMATICA - AXION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Python
Write-Host "[1/6] Verificando Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python encontrado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO: Python não encontrado!" -ForegroundColor Red
    Write-Host "Instale Python 3.12 de: https://www.python.org/downloads/" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Criar ambiente virtual
Write-Host ""
Write-Host "[2/6] Criando ambiente virtual..." -ForegroundColor Yellow
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
Write-Host "[3/6] Ativando ambiente virtual..." -ForegroundColor Yellow
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
Write-Host "[4/6] Instalando dependências..." -ForegroundColor Yellow
try {
    pip install -r requirements.txt
    Write-Host "✅ Dependências instaladas com sucesso" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO: Falha ao instalar dependências!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Instalar dependências adicionais
Write-Host ""
Write-Host "[5/6] Instalando dependências adicionais..." -ForegroundColor Yellow
try {
    pip install pypdf==5.7.0
    Write-Host "✅ pypdf instalado com sucesso" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO: Falha ao instalar pypdf!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Criar diretórios necessários
Write-Host ""
Write-Host "[6/6] Criando diretórios necessários..." -ForegroundColor Yellow
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
Write-Host "Para executar o sistema:" -ForegroundColor White
Write-Host "1. Ative o ambiente virtual: .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "2. Execute: python app.py" -ForegroundColor White
Write-Host "3. Acesse: http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANTE: Configure sua chave da OpenAI no config.py" -ForegroundColor Yellow
Write-Host ""
Read-Host "Pressione Enter para sair" 