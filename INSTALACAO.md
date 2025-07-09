# �� Guia de Instalação Completo - Axion Modular

## 📋 Pré-requisitos

### Sistema Operacional
- **Windows 10/11** (testado)
- **Linux Ubuntu/Debian** (compatível)
- **macOS** (compatível)
- **Python 3.12** (versão específica recomendada)

### Software Necessário
1. **Python 3.12** - [Download oficial](https://www.python.org/downloads/)
2. **Git** - [Download oficial](https://git-scm.com/downloads)
3. **PowerShell** (Windows) ou **Bash** (Linux/macOS)

### Dependências Externas (OCR)
1. **Tesseract OCR** - Para processamento de imagens
2. **qpdf** - Para remoção de assinaturas digitais
3. **Ghostscript** - Para otimização de PDFs (opcional)

## 🔧 Instalação por Sistema Operacional

### 🪟 Windows

#### 1. Instalar Tesseract OCR
```powershell
# Baixar e instalar Tesseract
# 1. Acesse: https://github.com/UB-Mannheim/tesseract/wiki
# 2. Baixe a versão mais recente para Windows
# 3. Instale e adicione ao PATH do sistema
# 4. Reinicie o PowerShell após a instalação
```

#### 2. Instalar qpdf
```powershell
# Baixar qpdf
# 1. Acesse: https://github.com/qpdf/qpdf/releases
# 2. Baixe qpdf-12.2.0-mingw64.zip
# 3. Extraia para C:\qpdf\
# 4. Adicione C:\qpdf\bin ao PATH do sistema
```

#### 3. Instalar Ghostscript (Opcional)
```powershell
# Baixar Ghostscript
# 1. Acesse: https://ghostscript.com/releases/gsdnld.html
# 2. Baixe a versão para Windows
# 3. Instale e adicione ao PATH
```

### 🐧 Linux (Ubuntu/Debian)

#### 1. Instalar dependências do sistema
```bash
sudo apt-get update
sudo apt-get install -y python3 python3-pip python3-venv
sudo apt-get install -y tesseract-ocr tesseract-ocr-por
sudo apt-get install -y qpdf
sudo apt-get install -y ghostscript
```

#### 2. Verificar instalação
```bash
tesseract --version
qpdf --version
gs --version
```

### 🍎 macOS

#### 1. Instalar dependências do sistema
```bash
# Instalar Homebrew (se não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar dependências
brew install python@3.12
brew install tesseract tesseract-lang
brew install qpdf
brew install ghostscript
```

## 🚀 Instalação do Projeto

### 1. Clonar o Repositório
```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd axion
```

### 2. Criar Ambiente Virtual
```bash
python -m venv venv
```

### 3. Ativar Ambiente Virtual

**Windows:**
```powershell
.\venv\Scripts\Activate.ps1
```

**Linux/macOS:**
```bash
source venv/bin/activate
```

### 4. Instalar Dependências Python
```bash
pip install -r requirements.txt
```

### 5. Verificar Instalação
```bash
python test_nova_ocr.py
```

## 📦 Dependências Python (requirements.txt)

```
Flask==2.3.3              # Framework web
Werkzeug==2.3.7           # Utilitários WSGI
pypdf==5.7.0              # Manipulação de PDFs
PyPDF2==3.0.1             # Compatibilidade com assinaturas
python-dotenv==1.0.0      # Variáveis de ambiente
Flask-Cors==4.0.0         # CORS para frontend
openai==1.93.0            # API OpenAI
cryptography==41.0.7      # Criptografia
ocrmypdf==15.4.2          # OCR para PDFs
Pillow==10.0.1            # Processamento de imagens
reportlab==4.0.4          # Geração de PDFs (testes)
pikepdf==8.6.2            # Manipulação avançada de PDFs
```

## 🔑 Configuração da API OpenAI

### Opção 1: Variável de Ambiente (Recomendado)
1. Crie um arquivo `.env` na raiz do projeto:
```
OPENAI_API_KEY=sua-chave-openai-aqui
```

### Opção 2: Editar config.py
Edite o arquivo `config.py` e substitua a linha:
```python
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY') or 'sua-chave-openai-aqui'
```

## 🚀 Executar o Projeto

### 1. Ativar Ambiente Virtual
```bash
# Windows
.\venv\Scripts\Activate.ps1

# Linux/macOS
source venv/bin/activate
```

### 2. Executar o Servidor
```bash
python app.py
```

### 3. Acessar o Sistema
- Abra o navegador
- Acesse: `http://localhost:5000`

## 📁 Estrutura de Diretórios

```
axion/
├── venv/                    # Ambiente virtual
├── uploads/                 # Arquivos enviados
├── processed/               # Arquivos processados
├── static/                  # Frontend (HTML, CSS, JS)
├── api/                     # Rotas da API
├── ai/                      # Serviços de IA e OCR
├── app.py                   # Aplicação principal
├── config.py                # Configurações
├── security.py              # Sistema de segurança
├── requirements.txt         # Dependências Python
├── test_nova_ocr.py        # Teste da implementação OCR
└── INSTALACAO.md           # Este arquivo
```

## 🔧 Scripts de Instalação Automática

### Windows
```powershell
# PowerShell
.\install_new_computer.ps1

# CMD
install_new_computer.bat
```

### Linux/macOS
```bash
chmod +x install.sh
./install.sh
```

## 🧪 Testes e Verificação

### 1. Teste de Dependências
```bash
python test_nova_ocr.py
```

### 2. Verificar Tesseract
```bash
tesseract --version
```

### 3. Verificar qpdf
```bash
qpdf --version
```

### 4. Teste de OCR
```bash
# O sistema deve processar PDFs escaneados automaticamente
```

## 🐛 Solução de Problemas

### Erro: "Tesseract não encontrado"
```bash
# Windows: Verifique se Tesseract está no PATH
# Linux: sudo apt-get install tesseract-ocr tesseract-ocr-por
# macOS: brew install tesseract tesseract-lang
```

### Erro: "qpdf não encontrado"
```bash
# Windows: Baixe e instale qpdf manualmente
# Linux: sudo apt-get install qpdf
# macOS: brew install qpdf
```

### Erro: "No module named 'ocrmypdf'"
```bash
pip install ocrmypdf==15.4.2
```

### Erro: "No module named 'pikepdf'"
```bash
pip install pikepdf==8.6.2
```

### Erro de permissão no PowerShell
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Erro de memória no OCR
```bash
# Reduza o tamanho do arquivo ou aumente a RAM da VM
# Configure timeout no ocrmypdf
```

## 📝 Configurações para Máquina Virtual

### Requisitos Mínimos da VM
- **RAM**: 4GB mínimo, 8GB recomendado
- **CPU**: 2 cores mínimo, 4 cores recomendado
- **Disco**: 20GB espaço livre
- **Sistema**: Windows 10/11, Ubuntu 20.04+, ou macOS

### Configurações Recomendadas
```bash
# Aumentar timeout para OCR
# Editar ai/ocr_service.py linha ~80
tesseract_timeout=60  # Aumentar de 30 para 60 segundos

# Configurar memória para OCR
# Adicionar no config.py
OCR_MEMORY_LIMIT = '2G'  # Limitar uso de memória
```

## 🔄 Atualizações

Para atualizar o projeto:
```bash
git pull
# Ativar ambiente virtual
pip install --upgrade -r requirements.txt
python test_nova_ocr.py  # Testar após atualização
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique se o ambiente virtual está ativo
2. Confirme as versões das dependências
3. Execute `python test_nova_ocr.py`
4. Verifique os logs do servidor
5. Consulte este guia de instalação

## 🎯 Funcionalidades Implementadas

### ✅ OCR Completo
- Detecção automática de PDFs escaneados
- OCR em português brasileiro
- Processamento de PDFs com assinatura digital
- Remoção inteligente de assinaturas

### ✅ Segurança
- Processamento seguro de arquivos
- Criptografia de arquivos temporários
- Limpeza automática
- Auditoria de operações

### ✅ Compatibilidade
- PDFs pesquisáveis (texto digital)
- PDFs escaneados (imagem)
- PDFs com assinatura digital
- PDFs mistos (parte texto, parte imagem)

---

**✅ Sistema testado e funcionando com:**
- Windows 10/11
- Linux Ubuntu 20.04+
- Python 3.12
- OpenAI API v1.93.0
- Tesseract OCR
- qpdf para assinaturas digitais 