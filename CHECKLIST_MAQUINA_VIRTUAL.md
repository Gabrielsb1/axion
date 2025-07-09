# 📋 Checklist para Máquina Virtual - Axion OCR

## 🎯 Configuração da VM

### Requisitos Mínimos
- **RAM**: 4GB mínimo, 8GB recomendado
- **CPU**: 2 cores mínimo, 4 cores recomendado
- **Disco**: 20GB espaço livre
- **Sistema**: Windows 10/11, Ubuntu 20.04+, ou macOS

### Configurações Recomendadas
- **RAM**: 8GB para processamento OCR
- **CPU**: 4 cores para melhor performance
- **Disco**: 50GB para arquivos temporários
- **Rede**: Conexão estável para downloads

## 🔧 Instalação por Sistema Operacional

### 🪟 Windows VM

#### 1. Preparação
```powershell
# Verificar se é Windows 10/11
systeminfo | findstr "OS Name"

# Verificar RAM disponível
wmic computersystem get TotalPhysicalMemory

# Verificar espaço em disco
wmic logicaldisk get size,freespace,caption
```

#### 2. Instalar Dependências Externas
```powershell
# 1. Tesseract OCR
# - Baixar: https://github.com/UB-Mannheim/tesseract/wiki
# - Instalar e adicionar ao PATH

# 2. qpdf
# - Baixar: https://github.com/qpdf/qpdf/releases
# - Extrair para C:\qpdf\
# - Adicionar C:\qpdf\bin ao PATH

# 3. Ghostscript (opcional)
# - Baixar: https://ghostscript.com/releases/gsdnld.html
# - Instalar e adicionar ao PATH
```

#### 3. Executar Instalação
```powershell
# Usar script automático
.\install_new_computer.ps1

# Ou manualmente
.\install_new_computer.bat
```

### 🐧 Linux VM (Ubuntu/Debian)

#### 1. Preparação
```bash
# Atualizar sistema
sudo apt-get update && sudo apt-get upgrade -y

# Verificar recursos
free -h
df -h
nproc
```

#### 2. Instalar Dependências do Sistema
```bash
# Python e ferramentas básicas
sudo apt-get install -y python3 python3-pip python3-venv git

# Tesseract OCR
sudo apt-get install -y tesseract-ocr tesseract-ocr-por

# qpdf
sudo apt-get install -y qpdf

# Ghostscript (opcional)
sudo apt-get install -y ghostscript
```

#### 3. Executar Instalação
```bash
# Dar permissão de execução
chmod +x install.sh

# Executar instalação
./install.sh
```

### 🍎 macOS VM

#### 1. Preparação
```bash
# Instalar Homebrew (se não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Verificar recursos
system_profiler SPHardwareDataType
```

#### 2. Instalar Dependências do Sistema
```bash
# Python
brew install python@3.12

# Tesseract OCR
brew install tesseract tesseract-lang

# qpdf
brew install qpdf

# Ghostscript
brew install ghostscript
```

#### 3. Executar Instalação
```bash
# Dar permissão de execução
chmod +x install.sh

# Executar instalação
./install.sh
```

## 🧪 Testes de Verificação

### 1. Teste de Dependências
```bash
# Verificar Python
python --version

# Verificar Tesseract
tesseract --version

# Verificar qpdf
qpdf --version

# Verificar Ghostscript (opcional)
gs --version
```

### 2. Teste do Sistema
```bash
# Executar teste de OCR
python test_nova_ocr.py
```

### 3. Teste do Servidor
```bash
# Ativar ambiente virtual
# Windows: .\venv\Scripts\Activate.ps1
# Linux/macOS: source venv/bin/activate

# Executar servidor
python app.py

# Testar acesso
curl http://localhost:5000/api/health
```

## ⚙️ Configurações Específicas para VM

### Otimizações de Performance
```python
# Editar config.py - Aumentar timeouts para VM
OCR_TIMEOUT = 120  # 2 minutos para OCR
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
```

### Configurações de Memória
```python
# Editar ai/ocr_service.py
# Aumentar timeout do Tesseract
tesseract_timeout=60  # 1 minuto
```

### Configurações de Rede
```python
# Editar app.py - Permitir acesso externo
app.run(debug=False, host='0.0.0.0', port=5000)
```

## 🔍 Checklist de Verificação

### ✅ Pré-Instalação
- [ ] VM com recursos adequados (8GB RAM, 4 cores)
- [ ] Sistema operacional compatível
- [ ] Conexão com internet estável
- [ ] Espaço em disco suficiente (50GB)

### ✅ Dependências Externas
- [ ] Python 3.12+ instalado
- [ ] Tesseract OCR instalado e no PATH
- [ ] qpdf instalado e no PATH
- [ ] Ghostscript instalado (opcional)

### ✅ Dependências Python
- [ ] Ambiente virtual criado
- [ ] requirements.txt instalado
- [ ] Todas as dependências funcionando

### ✅ Testes
- [ ] Teste de OCR passou
- [ ] Servidor inicia sem erros
- [ ] API responde corretamente
- [ ] Upload de arquivos funciona

### ✅ Configurações
- [ ] Chave da OpenAI configurada
- [ ] Diretórios criados (uploads, processed)
- [ ] Permissões corretas
- [ ] Firewall configurado (se necessário)

## 🐛 Solução de Problemas Comuns

### Problema: "Out of memory" no OCR
```bash
# Solução: Aumentar RAM da VM para 8GB+
# Ou reduzir tamanho dos arquivos processados
```

### Problema: "Timeout" no processamento
```python
# Editar ai/ocr_service.py
tesseract_timeout=120  # Aumentar timeout
```

### Problema: "qpdf não encontrado"
```bash
# Windows: Verificar PATH
echo $env:PATH

# Linux: Reinstalar
sudo apt-get install --reinstall qpdf
```

### Problema: "Tesseract não encontrado"
```bash
# Windows: Verificar instalação
tesseract --version

# Linux: Reinstalar
sudo apt-get install --reinstall tesseract-ocr
```

## 📊 Monitoramento

### Verificar Uso de Recursos
```bash
# CPU e RAM
top
htop

# Disco
df -h
du -sh uploads/ processed/

# Processos Python
ps aux | grep python
```

### Logs do Sistema
```bash
# Ver logs do Flask
tail -f audit.log

# Ver logs de erro
python app.py 2>&1 | tee app.log
```

## 🚀 Deploy em Produção

### Configurações de Produção
```python
# Editar config.py
DEBUG = False
SECURE_PROCESSING = True
AUTO_CLEANUP = True
CLEANUP_INTERVAL = timedelta(minutes=30)
```

### Serviço Systemd (Linux)
```bash
# Criar arquivo de serviço
sudo nano /etc/systemd/system/axion.service

# Conteúdo:
[Unit]
Description=Axion OCR System
After=network.target

[Service]
Type=simple
User=axion
WorkingDirectory=/path/to/axion
Environment=PATH=/path/to/axion/venv/bin
ExecStart=/path/to/axion/venv/bin/python app.py
Restart=always

[Install]
WantedBy=multi-user.target

# Ativar serviço
sudo systemctl enable axion
sudo systemctl start axion
```

## 📝 Notas Importantes

1. **Sempre teste em ambiente de desenvolvimento primeiro**
2. **Configure backup dos arquivos importantes**
3. **Monitore o uso de recursos da VM**
4. **Mantenha as dependências atualizadas**
5. **Configure logs para debugging**

---

**✅ Checklist completo garante instalação bem-sucedida em VM!** 