# NicSan - Sistema Inteligente de Documentos

**Sistema de processamento inteligente de documentos com OCR e IA avançada**

Desenvolvido por **João Gabriel Santos Barros** em 2025.

---

## 🚀 Sobre o Projeto

O **NicSan** é um sistema moderno e inteligente para processamento de documentos, desenvolvido com tecnologia de IA avançada. O sistema oferece três funcionalidades principais:

### 📋 Funcionalidades

1. **Memorial de Incorporação**
   - Processamento de documentos DOCX
   - Extração estruturada de dados de apartamentos, blocos e casas
   - Geração de tabelas organizadas com configuração de colunas
   - Interface drag-and-drop para personalização

2. **Certidão de Situação Jurídica**
   - Processamento de PDFs de certidões
   - OCR automático seguido de análise com IA
   - Extração inteligente de campos jurídicos
   - Preview formatado similar ao Word
   - Download em formato DOCX

3. **OCR - Reconhecimento de Texto**
   - Extração de texto de imagens e documentos digitalizados
   - Processamento via OCRMyPDF com Tesseract
   - Estatísticas detalhadas de processamento
   - Download do resultado em PDF pesquisável

### 🎨 Características

- **Interface moderna** com tema claro/escuro
- **Design responsivo** para diferentes dispositivos
- **Processamento seguro** com criptografia de arquivos
- **Tecnologia de IA** integrada com OpenAI GPT-4o
- **OCR de alta qualidade** com múltiplos idiomas
- **Sistema de auditoria** completo

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Flask** - Framework web Python
- **OpenAI API** - Processamento de linguagem natural
- **OCRMyPDF** - OCR avançado com Tesseract
- **ReportLab** - Geração de PDFs
- **python-docx** - Manipulação de documentos Word
- **Pandas** - Processamento de dados
- **Cryptography** - Segurança e criptografia

### Frontend
- **HTML5/CSS3** - Interface moderna com gradientes e animações
- **JavaScript ES6+** - Interatividade e processamento assíncrono
- **Bootstrap 5** - Componentes responsivos
- **Font Awesome** - Ícones modernos

---

## 📦 Instalação

### Pré-requisitos
- Python 3.8+
- Tesseract OCR
- Chave da API OpenAI

### Passos de Instalação

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd nicsan
   ```

2. **Crie um ambiente virtual**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # ou
   venv\Scripts\activate     # Windows
   ```

3. **Instale as dependências**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure as variáveis de ambiente**
   ```bash
   # Crie um arquivo .env
   OPENAI_API_KEY=sua_chave_openai_aqui
   SECURE_PROCESSING=True
   ENCRYPT_TEMP_FILES=True
   ```

5. **Execute o sistema**
   ```bash
   python app.py
   ```

6. **Acesse no navegador**
   ```
   http://localhost:5000
   ```

---

## 🔧 Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `OPENAI_API_KEY` | Chave da API OpenAI | Obrigatório |
| `SECURE_PROCESSING` | Ativar processamento seguro | `True` |
| `ENCRYPT_TEMP_FILES` | Criptografar arquivos temporários | `True` |
| `UPLOAD_FOLDER` | Pasta de uploads | `uploads/` |
| `TEMP_DIRECTORY` | Pasta temporária | `temp/` |

### Configuração do Tesseract

O sistema utiliza OCRMyPDF que requer o Tesseract OCR instalado:

- **Windows**: Baixe e instale do site oficial
- **Linux**: `sudo apt-get install tesseract-ocr`
- **Mac**: `brew install tesseract`

---

## 📖 Uso

### Memorial de Incorporação
1. Selecione a aba "Memorial de Incorporação"
2. Faça upload de arquivos DOCX
3. Clique em "Processar"
4. Configure as colunas conforme necessário
5. Visualize os dados extraídos

### Certidão de Situação Jurídica
1. Selecione a aba "Certidão"
2. Faça upload de um PDF de certidão
3. Clique em "Processar"
4. Visualize o preview formatado
5. Baixe em formato Word

### OCR - Reconhecimento de Texto
1. Selecione a aba "OCR"
2. Faça upload de um PDF ou imagem
3. Clique em "Processar"
4. Visualize as estatísticas e texto extraído
5. Baixe o resultado em PDF

---

## 🔒 Segurança

O sistema implementa múltiplas camadas de segurança:

- **Criptografia AES-256** para arquivos temporários
- **Processamento seguro** com limpeza automática
- **Validação de arquivos** e tipos MIME
- **Auditoria completa** de operações
- **Isolamento de processos** para uploads

---

## 📊 Estrutura do Projeto

```
nicsan/
├── ai/                    # Serviços de IA e OCR
│   ├── openai_service.py  # Integração OpenAI
│   └── ocr_service.py     # Serviços OCR
├── api/                   # Rotas da API
│   ├── routes_ai.py       # Rotas principais
│   └── routes_utils.py    # Utilitários
├── static/                # Frontend
│   ├── js/                # JavaScript modular
│   ├── index.html         # Interface principal
│   ├── styles.css         # Estilos modernos
│   └── logo-*.png         # Logos do sistema
├── uploads/               # Arquivos temporários
├── app.py                 # Aplicação Flask
├── config.py              # Configurações
├── security.py            # Segurança
└── requirements.txt       # Dependências
```

---

## 🤝 Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Implemente suas mudanças
4. Teste thoroughly
5. Envie um pull request

---

## 📄 Licença

Este projeto está licenciado sob a **Licença MIT**. Consulte o arquivo `LICENSE.txt` para mais detalhes.

---

## ⚠️ Sobre o uso da API OpenAI

O sistema requer uma chave válida da API OpenAI configurada via variável de ambiente `OPENAI_API_KEY`.

**Importante**: Os custos de uso da API são de responsabilidade do usuário da chave. Consulte a [documentação oficial da OpenAI](https://platform.openai.com/docs/pricing) para informações sobre preços.

---

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o projeto, entre em contato:

- **Desenvolvedor**: João Gabriel Santos Barros
- **Email**: [seu-email@exemplo.com]
- **GitHub**: [seu-usuario-github]

---

**NicSan** - Transformando documentos em dados inteligentes 🚀

