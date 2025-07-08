# Dockerfile para Axion ChatGPT Flask
FROM python:3.11-slim

# Diretório de trabalho
WORKDIR /app

# Copia os arquivos do projeto
COPY . /app

# Instala dependências do sistema e Python
RUN apt-get update && \
    apt-get install -y poppler-utils && \
    pip install --upgrade pip && \
    pip install -r requirements.txt && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Expõe a porta padrão do Flask
EXPOSE 5000

# Comando para rodar o app em modo debug para facilitar logs
CMD ["python", "app.py"] 