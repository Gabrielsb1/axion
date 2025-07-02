# Dockerfile para Axion OCR Flask
FROM python:3.11-slim

# Diretório de trabalho
WORKDIR /app

# Copia os arquivos do projeto
COPY . /app

# Instala dependências do sistema necessárias para o Tesseract e ocrmypdf
RUN apt-get update && \
    apt-get install -y tesseract-ocr tesseract-ocr-por tesseract-ocr-eng ghostscript unpaper poppler-utils && \
    pip install --upgrade pip && \
    pip install -r requirements.txt && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Expõe a porta padrão do Flask
EXPOSE 5000

# Comando para rodar o app com Gunicorn
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000"] 