# 🚀 Guia de Instalação NicSan - Windows

Este guia completo irá ajudá-lo a instalar o NicSan em um computador Windows.

## 📋 Pré-requisitos

### 1. Python 3.8+
- **Download**: https://python.org/downloads/
- **Importante**: Marque "Add Python to PATH" durante a instalação
- **Verificação**: Abra o CMD e digite `python --version`

### 2. Tesseract OCR (Opcional, mas recomendado)
- **Download**: https://github.com/UB-Mannheim/tesseract/wiki
- **Instalação**: Execute como administrador
- **Idiomas**: Selecione Português e Inglês
- **PATH**: Marque "Add to PATH"

### 3. Chave da API OpenAI
- **Obtenção**: https://platform.openai.com/api-keys
- **Custo**: Consulte a documentação oficial para preços

## 🛠️ Instalação Automática (Recomendado)

### Passo 1: Preparar o projeto
```bash
# 1. Extraia o projeto para uma pasta
# 2. Abra o CMD na pasta do projeto
# 3. Execute o instalador automático
install_windows.bat
```

### Passo 2: Configurar Tesseract (Opcional)
```bash
# Execute o script de configuração do Tesseract
setup_tesseract.bat
```

### Passo 3: Executar o sistema
```bash
# Execute o script de inicialização
run_nicsan.bat
```

## 🔧 Instalação Manual

### Passo 1: Verificar Python
```bash
python --version
pip --version
```

### Passo 2: Criar ambiente virtual
```bash
python -m venv venv
venv\Scripts\activate.bat
```

### Passo 3: Instalar dependências
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Passo 4: Configurar variáveis de ambiente
```bash
# Temporariamente (CMD)
set OPENAI_API_KEY=sua_chave_aqui

# Ou permanentemente (.env)
echo OPENAI_API_KEY=sua_chave_aqui > .env
```

### Passo 5: Executar o sistema
```bash
python app.py
```

## 🌐 Acesso ao Sistema

Após a instalação, acesse:
- **URL**: http://localhost:5000
- **Porta padrão**: 5000
- **Host**: 0.0.0.0 (acessível de qualquer dispositivo na rede)

## 🔍 Verificação da Instalação

### 1. Status do Python
```bash
python --version
# Deve mostrar Python 3.8+
```

### 2. Status do Tesseract
```bash
tesseract --version
# Deve mostrar a versão do Tesseract
```

### 3. Status das Dependências
```bash
pip list
# Deve mostrar todas as dependências instaladas
```

### 4. Status do Sistema
Ao executar `python app.py`, você deve ver:
```
🚀 Iniciando servidor Flask NicSan...

🔍 Status do OCR:
========================================
✅ ocrmypdf: Disponível
✅ Tesseract: Disponível

🎉 OCR totalmente funcional!

🌐 Servidor rodando em: http://localhost:5000
```

## ⚠️ Solução de Problemas

### Erro: "Python não encontrado"
- **Solução**: Reinstale o Python marcando "Add to PATH"
- **Verificação**: Reinicie o CMD após a instalação

### Erro: "pip não encontrado"
- **Solução**: `python -m ensurepip --upgrade`
- **Verificação**: `pip --version`

### Erro: "Tesseract não encontrado"
- **Solução**: Instale o Tesseract e adicione ao PATH
- **Verificação**: Reinicie o computador após a instalação

### Erro: "Dependências não instaladas"
- **Solução**: `pip install -r requirements.txt --force-reinstall`
- **Verificação**: Verifique a conexão com a internet

### Erro: "Porta 5000 em uso"
- **Solução**: Altere a porta no `config.py`
- **Alternativa**: Encerre outros processos na porta 5000

### Erro: "Chave OpenAI inválida"
- **Solução**: Verifique se a chave está correta
- **Verificação**: Teste a chave na plataforma OpenAI

## 🔒 Configurações de Segurança

### Variáveis de Ambiente Recomendadas
```bash
# Arquivo .env
OPENAI_API_KEY=sua_chave_aqui
SECURE_PROCESSING=True
ENCRYPT_TEMP_FILES=True
SECRET_KEY=chave_secreta_aleatoria
```

### Firewall
- **Porta 5000**: Permitir entrada para o NicSan
- **Antivírus**: Adicionar exceção para a pasta do projeto

## 📁 Estrutura de Pastas Após Instalação

```
nicsan/
├── venv/                    # Ambiente virtual Python
├── uploads/                 # Arquivos temporários
├── static/                  # Frontend (HTML, CSS, JS)
├── ai/                      # Serviços de IA e OCR
├── api/                     # Rotas da API
├── install_windows.bat      # Instalador automático
├── run_nicsan.bat          # Executor do sistema
├── setup_tesseract.bat     # Configurador OCR
├── requirements.txt         # Dependências Python
├── config.py               # Configurações
├── app.py                  # Aplicação principal
└── .env                    # Variáveis de ambiente
```

## 🚀 Comandos Rápidos

### Iniciar o sistema
```bash
run_nicsan.bat
```

### Parar o sistema
```bash
# Pressione Ctrl+C no terminal
```

### Reinstalar dependências
```bash
pip install -r requirements.txt --force-reinstall
```

### Atualizar o sistema
```bash
git pull
pip install -r requirements.txt
```

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs** no terminal
2. **Consulte este guia** para soluções comuns
3. **Verifique a documentação** no README.md
4. **Entre em contato** com o desenvolvedor

---

**NicSan** - Sistema Inteligente de Documentos 🚀 