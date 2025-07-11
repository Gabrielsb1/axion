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
        qpdf \
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

# Remover Ghostscript antigo e instalar versão 10.03.0 (corrige bugs com PDFs assinados)
RUN apt-get update && \
    apt-get install -y wget && \
    apt-get remove --purge -y ghostscript && \
    wget https://github.com/ArtifexSoftware/ghostpdl-downloads/releases/download/gs1003/ghostscript-10.03.0-linux-x86_64.tgz && \
    tar -xzf ghostscript-10.03.0-linux-x86_64.tgz && \
    mv ghostscript-10.03.0-linux-x86_64/gs-1003-linux-x86_64 /usr/bin/gs && \
    chmod +x /usr/bin/gs && \
    rm -rf ghostscript-10.03.0-linux-x86_64*

# Expõe a porta padrão do Flask
EXPOSE 5000

# Comando para rodar o app em modo debug para facilitar logs
CMD ["python", "app.py"] 