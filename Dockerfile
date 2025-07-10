# Dockerfile para Axion ChatGPT Flask
FROM python:3.11-slim

# Diretório de trabalho
WORKDIR /app

# Copia os arquivos do projeto
COPY . /app

# Instala dependências essenciais do sistema
RUN apt-get update && \
    apt-get install -y \
        poppler-utils \
        tesseract-ocr \
        tesseract-ocr-por \
        ghostscript \
        libmagic1 \
        libffi-dev \
        libssl-dev \
        libjpeg-dev \
        zlib1g-dev \
        libpng-dev \
        libtiff-dev \
        libwebp-dev \
        libopenjp2-7-dev \
        libcairo2-dev \
        libpango1.0-dev \
        libgdk-pixbuf2.0-dev \
        libgtk-3-dev \
        python3-dev \
        && \
    pip install --upgrade pip && \
    pip install -r requirements.txt && \
    apt-get clean && rm -rf /var/lib/apt/lists/* && \
    # Verifica se o tesseract está funcionando
    tesseract --version && \
    tesseract --list-langs

# Expõe a porta padrão do Flask
EXPOSE 5000

# Comando para rodar o app em modo debug para facilitar logs
CMD ["python", "app.py"] 