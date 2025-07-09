# Documentação Técnica - AxionDocs

## 1. Identificação do Software

- **Nome do Software:** AxionDocs
- **Versão:** 1.0
- **Data de Criação:** 2025
- **Autor:** João Gabriel Santos Barros
- **Titular:** João Gabriel Santos Barros

## 2. Descrição do Software

O AxionDocs é um sistema de processamento de documentos PDF com reconhecimento óptico de caracteres (OCR) integrado à API OpenAI. Permite transformar PDFs escaneados em documentos pesquisáveis e realizar extração inteligente de informações, com foco em uso em cartórios e ambientes jurídicos.

## 3. Objetivo

Automatizar a digitalização, extração e análise de dados de documentos oficiais, facilitando buscas, organização e integração com sistemas de inteligência artificial.

## 4. Principais Funcionalidades

- Upload e processamento de arquivos PDF
- Reconhecimento de texto em imagens (OCR)
- Geração de PDFs pesquisáveis
- Integração com a API OpenAI para análise de conteúdo
- Interface web para uso interno
- Segurança e limpeza automática de arquivos sensíveis

## 5. Tecnologias Utilizadas

- Python 3.8+
- Flask
- Tesseract OCR
- OpenAI API
- HTML, CSS, JavaScript (frontend)

## 6. Estrutura de Diretórios

```
axion/
├── app.py
├── config.py
├── security.py
├── ai/
│   ├── ocr_service.py
│   └── openai_service.py
├── api/
│   ├── routes_ai.py
│   └── routes_utils.py
├── static/
│   ├── index.html
│   ├── styles.css
│   └── js/
├── uploads/
├── processed/
├── requirements.txt
├── README.md
├── LICENSE.txt
└── LICENÇA.txt
```

## 7. Instruções de Instalação e Uso

1. Instale as dependências com `pip install -r requirements.txt`.
2. Configure a variável de ambiente `OPENAI_API_KEY`.
3. Execute `python app.py` para iniciar o sistema.
4. Acesse via navegador em `http://localhost:5000`.

## 8. Screenshots (Opcional)

*Adicione aqui imagens da interface, se desejar.*

## 9. Histórico de Versões

- 1.0 - Primeira versão registrada

## 10. Observações

- O código-fonte está licenciado sob a Licença MIT.
- O sistema foi desenvolvido como parte do TCC do autor, durante estágio no Cartório de Registro de Imóveis de São Luís. 