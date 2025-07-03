# 🚀 Guia de Instalação - Axion Modular

## 📋 Pré-requisitos

### Sistema Operacional
- **Windows 10/11** (testado)
- **Python 3.12** (versão específica recomendada)

### Software Necessário
1. **Python 3.12** - [Download oficial](https://www.python.org/downloads/)
2. **Git** - [Download oficial](https://git-scm.com/downloads)
3. **PowerShell** (já vem com Windows)

## 🔧 Passos de Instalação

### 1. Clonar o Repositório
```powershell
git clone <URL_DO_SEU_REPOSITORIO>
cd axion
```

### 2. Criar Ambiente Virtual
```powershell
python -m venv venv
```

### 3. Ativar Ambiente Virtual
```powershell
.\venv\Scripts\Activate.ps1
```
**IMPORTANTE:** Sempre ative o ambiente virtual antes de trabalhar no projeto!

### 4. Instalar Dependências
```powershell
pip install -r requirements.txt
```

### 5. Instalar Dependências Adicionais (se necessário)
```powershell
pip install pypdf==5.7.0
```

## 📦 Versões das Dependências

### requirements.txt (versões exatas)
```
Flask==2.3.3
Werkzeug==2.3.7
PyPDF2==3.0.1
python-dotenv==1.0.0
Flask-Cors==4.0.0
openai==1.93.0
```

### Dependências Adicionais
- **pypdf==5.7.0** (substitui PyPDF2 para compatibilidade com Python 3.12)

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
```powershell
.\venv\Scripts\Activate.ps1
```

### 2. Executar o Servidor
```powershell
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
├── ai/                      # Serviços de IA
├── app.py                   # Aplicação principal
├── config.py                # Configurações
├── requirements.txt         # Dependências Python
└── INSTALACAO.md           # Este arquivo
```

## 🔧 Comandos Úteis

### Verificar versão do Python
```powershell
python --version
```

### Verificar se o ambiente virtual está ativo
```powershell
# Deve mostrar (venv) no início do prompt
```

### Listar dependências instaladas
```powershell
pip list
```

### Atualizar dependências
```powershell
pip install --upgrade -r requirements.txt
```

### Desativar ambiente virtual
```powershell
deactivate
```

## 🐛 Solução de Problemas

### Erro: "No module named 'openai'"
```powershell
# Ative o ambiente virtual primeiro
.\venv\Scripts\Activate.ps1
pip install openai==1.93.0
```

### Erro: "No module named 'pypdf'"
```powershell
pip install pypdf==5.7.0
```

### Erro: "Client.__init__() got an unexpected keyword argument 'proxies'"
```powershell
# Reinstale o openai
pip uninstall openai -y
pip install openai==1.93.0
```

### Erro de permissão no PowerShell
```powershell
# Execute como administrador ou use:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📝 Notas Importantes

1. **SEMPRE ative o ambiente virtual** antes de trabalhar no projeto
2. **Use as versões exatas** das dependências listadas
3. **Mantenha a chave da OpenAI segura** (não commite no Git)
4. **O sistema funciona apenas com PDFs que contêm texto** (não escaneados)

## 🔄 Atualizações

Para atualizar o projeto:
```powershell
git pull
.\venv\Scripts\Activate.ps1
pip install --upgrade -r requirements.txt
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique se o ambiente virtual está ativo
2. Confirme as versões das dependências
3. Verifique os logs do servidor
4. Consulte este guia de instalação

---

**✅ Sistema testado e funcionando com:**
- Windows 10/11
- Python 3.12
- OpenAI API v1.93.0
- Flask 2.3.3
- pypdf 5.7.0 