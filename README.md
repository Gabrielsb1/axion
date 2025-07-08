# Axion - Sistema de OCR Tesseract

Sistema web para transformar arquivos PDF não pesquisáveis em PDFs pesquisáveis usando OCR (Tesseract) com backend Python Flask e frontend HTML+JS.

## 🚀 Funcionalidades

- **Upload de PDFs**: Interface web para envio de arquivos PDF
- **OCR Tesseract**: Processamento automático com Tesseract OCR
- **PDFs Pesquisáveis**: Geração de PDFs com texto pesquisável
- **Download Automático**: Download dos arquivos processados
- **Interface Moderna**: Interface web responsiva e intuitiva

## 📋 Pré-requisitos

### 1. Python 3.8+
```bash
# Verificar versão do Python
python --version
```

### 2. Tesseract OCR
O Tesseract deve estar instalado no sistema:

#### Windows:
1. Baixe o instalador: https://github.com/UB-Mannheim/tesseract/wiki
2. Instale e adicione ao PATH do sistema
3. Verifique a instalação:
```bash
tesseract --version
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr tesseract-ocr-por
```

#### macOS:
```bash
brew install tesseract
brew install tesseract-lang  # Para idiomas adicionais
```

### 3. Verificar instalação do Tesseract:
```bash
tesseract --version
tesseract --list-langs
```

## 🛠️ Instalação

### 1. Clone ou baixe o projeto
```bash
git clone <url-do-repositorio>
cd axion
```

### 2. Criar ambiente virtual (recomendado)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/macOS
python3 -m venv venv
source venv/bin/activate
```

### 3. Instalar dependências
```bash
pip install -r requirements.txt
```

## 🚀 Como Executar

### 1. Iniciar o servidor
```bash
python app.py
```

### 2. Acessar a aplicação
Abra o navegador e acesse: http://localhost:5000

### 3. Usar a funcionalidade OCR
1. Clique na aba "OCR Tesseract"
2. Selecione um arquivo PDF
3. Clique em "Processar com Python OCR"
4. Aguarde o processamento
5. Baixe o PDF pesquisável

## 📁 Estrutura do Projeto

```
axion/
├── static/              # Frontend (HTML, CSS, JS)
│   ├── index.html       # Interface principal
│   ├── styles.css       # Estilos
│   ├── app-simple.js    # JavaScript principal
│   └── js/              # Módulos JavaScript
├── uploads/             # PDFs enviados (criado automaticamente)
├── processed/           # PDFs processados (criado automaticamente)
├── app.py              # Backend Flask
├── requirements.txt    # Dependências Python
└── README.md          # Este arquivo
```

## 🔧 Configurações

### Endpoints da API

- `GET /` - Interface web
- `POST /api/ocr-tesseract` - Processar PDF com OCR
- `GET /api/download/<filename>` - Download do PDF processado
- `GET /api/health` - Status da API

### Configurações do OCR

O sistema usa as seguintes configurações do Tesseract:
- **Idiomas**: Português + Inglês (`por+eng`)
- **Deskew**: Correção automática de rotação
- **Clean**: Limpeza da imagem
- **Force OCR**: Forçar OCR mesmo em PDFs com texto
- **Otimização**: Nível 1 para melhor qualidade

## 🐛 Solução de Problemas

### Erro: "Tesseract não encontrado"
```bash
# Verificar se o Tesseract está instalado
tesseract --version

# Se não estiver no PATH, adicione manualmente
# Windows: Adicione o caminho do Tesseract às variáveis de ambiente
# Linux/macOS: Verifique se está em /usr/bin/tesseract
```

### Erro: "Módulo ocrmypdf não encontrado"
```bash
# Reinstalar dependências
pip install -r requirements.txt

# Ou instalar manualmente
pip install ocrmypdf
```

### Erro: "Arquivo muito grande"
- O limite padrão é 50MB
- Para aumentar, modifique `MAX_CONTENT_LENGTH` em `app.py`

### Erro: "PDF já possui OCR"
- O sistema detecta automaticamente PDFs que já têm OCR
- Neste caso, o arquivo é copiado sem reprocessamento

## 🔒 Segurança

- Validação de tipos de arquivo (apenas PDF)
- Limite de tamanho de arquivo (50MB)
- Nomes de arquivo seguros
- Limpeza automática de arquivos temporários

## 📊 Logs

O sistema gera logs detalhados incluindo:
- Upload de arquivos
- Processamento OCR
- Erros e exceções
- Downloads

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 🆘 Suporte

Para suporte ou dúvidas:
1. Verifique a seção de solução de problemas
2. Consulte os logs do servidor
3. Abra uma issue no repositório

---

**Desenvolvido com ❤️ usando Flask + Tesseract OCR**

# Como rodar o Axion localmente (sem OCR, apenas ChatGPT)

1. **Pré-requisitos:**
   - Python 3.8 ou superior
   - Pip
   - (Opcional) Ambiente virtual

2. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure a chave da OpenAI:**
   - Crie um arquivo `.env` na raiz do projeto com:
     ```
     OPENAI_API_KEY=sua-chave-aqui
     ```
   - Ou edite diretamente o `config.py` para definir sua chave.

4. **Execute o backend Flask:**
   ```bash
   python app.py
   ```

5. **Acesse o sistema:**
   - Abra o navegador em: http://localhost:5000/static/index.html

---

## Observações
- O sistema NÃO possui mais OCR. Apenas PDFs pesquisáveis (com texto) são processados.
- O botão "Processar" só habilita ao selecionar um arquivo válido.
- Se tiver problemas com o botão, verifique o console do navegador para erros de JS.
- Para deploy, utilize apenas as dependências listadas em `requirements.txt`. 