# Script para adicionar Tesseract ao PATH do sistema
# Execute como Administrador

Write-Host "🔧 Configurando PATH do Tesseract..." -ForegroundColor Green

# Caminho do Tesseract
$tesseractPath = "C:\Program Files\Tesseract-OCR"

# Verificar se o Tesseract existe
if (Test-Path $tesseractPath) {
    Write-Host "✅ Tesseract encontrado em: $tesseractPath" -ForegroundColor Green
} else {
    Write-Host "❌ Tesseract não encontrado em: $tesseractPath" -ForegroundColor Red
    Write-Host "   Instale o Tesseract primeiro: https://github.com/UB-Mannheim/tesseract/wiki" -ForegroundColor Yellow
    exit 1
}

# Obter PATH atual do sistema
$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")

# Verificar se já está no PATH
if ($currentPath -like "*$tesseractPath*") {
    Write-Host "✅ Tesseract já está no PATH do sistema" -ForegroundColor Green
} else {
    # Adicionar ao PATH
    $newPath = $currentPath + ";" + $tesseractPath
    [Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
    Write-Host "✅ Tesseract adicionado ao PATH do sistema" -ForegroundColor Green
}

# Testar se funciona
Write-Host "🧪 Testando Tesseract..." -ForegroundColor Yellow
try {
    $result = & "$tesseractPath\tesseract.exe" --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Tesseract funcionando!" -ForegroundColor Green
        Write-Host $result[0] -ForegroundColor Cyan
    } else {
        Write-Host "❌ Erro ao testar Tesseract" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro ao testar Tesseract: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Configuração concluída!" -ForegroundColor Green
Write-Host "   Reinicie o computador para aplicar as mudanças" -ForegroundColor Yellow
Write-Host "   Depois execute: python app_free.py" -ForegroundColor Cyan 