# Dockerfile para Axion ChatGPT Flask
FROM python:3.11-slim

# Diretório de trabalho
WORKDIR /app

# Copia os arquivos do projeto
COPY . /app

# Instala dependências essenciais do sistema
RUN apt-get update && \
    apt-get install -y \
        build-essential \
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
        wget \
        && \
    pip install --upgrade pip && \
    pip install -r requirements.txt && \
    apt-get clean && rm -rf /var/lib/apt/lists/* && \
    # Verifica se o tesseract está funcionando
    tesseract --version && \
    tesseract --list-langs

# Baixar e instalar Ghostscript 10.05.1 manualmente (compilando a partir do código-fonte)
RUN wget https://github.com/ArtifexSoftware/ghostpdl-downloads/releases/download/gs10051/ghostscript-10.05.1.tar.gz && \
    tar -xzf ghostscript-10.05.1.tar.gz && \
    cd ghostscript-10.05.1 && \
    ./configure && \
    make && \
    make install && \
    cd .. && \
    rm -rf ghostscript-10.05.1* 

# Expõe a porta padrão do Flask
EXPOSE 5000

# Comando para rodar o app em modo debug para facilitar logs
CMD ["python", "app.py"]
