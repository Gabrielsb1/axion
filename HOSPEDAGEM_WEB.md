# 🌐 Guia de Hospedagem Web - Sistema Axion

## 🎯 **Opções de Hospedagem Recomendadas**

### **🥇 RECOMENDADO: Google Cloud Platform (GCP)**

**Configuração Ideal:**
```bash
# VM no GCP
- Sistema: Ubuntu 20.04 LTS
- Configuração: e2-standard-2 (2 vCPU, 8GB RAM)
- Disco: 50GB SSD
- Custo: ~R$ 250/mês
- Domínio: axion.com.br (R$ 50/ano)
```

**Vantagens:**
- ✅ Instalação fácil das dependências OCR
- ✅ Performance consistente
- ✅ SSL gratuito
- ✅ Backup automático
- ✅ Escalabilidade

### **🥈 ALTERNATIVA: DigitalOcean**

**Configuração:**
```bash
# Droplet no DigitalOcean
- Sistema: Ubuntu 20.04 LTS
- Configuração: Basic (2 vCPU, 4GB RAM)
- Disco: 80GB SSD
- Custo: ~R$ 120/mês
- Domínio: axion.com.br (R$ 50/ano)
```

### **🥉 ECONÔMICO: Vultr**

**Configuração:**
```bash
# Cloud Compute no Vultr
- Sistema: Ubuntu 20.04 LTS
- Configuração: 2 vCPU, 4GB RAM
- Disco: 80GB SSD
- Custo: ~R$ 100/mês
- Domínio: axion.com.br (R$ 50/ano)
```

## 🔧 **Configuração Completa do Sistema**

### **1. Preparar o Sistema para Produção**

**Arquivo: `app_producao.py`**
```python
from flask import Flask, send_from_directory
from flask_cors import CORS
from api.routes_ai import ai_bp
from api.routes_utils import utils_bp
import os
import atexit
from config import Config
from security import secure_manager

app = Flask(__name__, static_folder='static')
CORS(app)

# Inicializar configurações
Config.init_app(app)

# Registrar blueprints
app.register_blueprint(ai_bp)
app.register_blueprint(utils_bp)

# Servir index.html
@app.route('/')
def index():
    static_folder = app.static_folder or 'static'
    return send_from_directory(static_folder, 'index.html')

# Servir arquivos estáticos
@app.route('/<path:filename>')
def static_files(filename):
    static_folder = app.static_folder or 'static'
    return send_from_directory(static_folder, filename)

def cleanup_on_exit():
    """Função de limpeza executada ao encerrar o aplicativo"""
    print("🧹 Executando limpeza de segurança...")
    if Config.SECURE_PROCESSING:
        secure_manager.stop_cleanup_thread()
        # Limpar todos os arquivos temporários
        if os.path.exists(Config.TEMP_DIRECTORY):
            for filename in os.listdir(Config.TEMP_DIRECTORY):
                file_path = os.path.join(Config.TEMP_DIRECTORY, filename)
                if os.path.isfile(file_path):
                    secure_manager.secure_delete(file_path)
    print("✅ Limpeza de segurança concluída")

# Registrar função de limpeza
atexit.register(cleanup_on_exit)

if __name__ == '__main__':
    print("🚀 Iniciando servidor Flask Axion em PRODUÇÃO...")
    print("🔒 Modo de segurança ativado" if Config.SECURE_PROCESSING else "⚠️ Modo de segurança desativado")
    print("🌐 Servidor rodando em: http://0.0.0.0:5000")
    
    # Configurações para produção
    app.run(
        debug=False,  # Desabilitar debug em produção
        host='0.0.0.0',  # Permitir acesso externo
        port=int(os.environ.get('PORT', 5000)),  # Usar variável de ambiente
        threaded=True  # Habilitar threads para múltiplos usuários
    )
```

### **2. Script de Deploy Automático**

**Arquivo: `deploy_producao.sh`**
```bash
#!/bin/bash

echo "🚀 Deploy do Axion em Produção"
echo "========================================"

# Atualizar sistema
echo "📦 Atualizando sistema..."
sudo apt-get update && sudo apt-get upgrade -y

# Instalar dependências do sistema
echo "🔧 Instalando dependências do sistema..."
sudo apt-get install -y python3 python3-pip python3-venv nginx supervisor

# Instalar dependências OCR
echo "🔍 Instalando dependências OCR..."
sudo apt-get install -y tesseract-ocr tesseract-ocr-por qpdf ghostscript

# Criar usuário para o aplicativo
echo "👤 Criando usuário axion..."
sudo useradd -m -s /bin/bash axion
sudo usermod -aG sudo axion

# Criar diretório do aplicativo
echo "📁 Criando diretório do aplicativo..."
sudo mkdir -p /opt/axion
sudo chown axion:axion /opt/axion

# Copiar arquivos do aplicativo
echo "📋 Copiando arquivos..."
sudo cp -r . /opt/axion/
sudo chown -R axion:axion /opt/axion

# Criar ambiente virtual
echo "🐍 Criando ambiente virtual..."
cd /opt/axion
sudo -u axion python3 -m venv venv
sudo -u axion /opt/axion/venv/bin/pip install -r requirements.txt

# Configurar Nginx
echo "🌐 Configurando Nginx..."
sudo tee /etc/nginx/sites-available/axion << EOF
server {
    listen 80;
    server_name axion.com.br www.axion.com.br;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /static {
        alias /opt/axion/static;
        expires 30d;
    }
}
EOF

# Ativar site
sudo ln -sf /etc/nginx/sites-available/axion /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# Configurar Supervisor
echo "⚙️ Configurando Supervisor..."
sudo tee /etc/supervisor/conf.d/axion.conf << EOF
[program:axion]
command=/opt/axion/venv/bin/python app_producao.py
directory=/opt/axion
user=axion
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/axion/app.log
environment=PYTHONPATH="/opt/axion"
EOF

# Criar diretório de logs
sudo mkdir -p /var/log/axion
sudo chown axion:axion /var/log/axion

# Configurar SSL (opcional)
echo "🔒 Configurando SSL..."
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d axion.com.br -d www.axion.com.br --non-interactive --agree-tos --email seu-email@exemplo.com

# Iniciar serviços
echo "🚀 Iniciando serviços..."
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start axion

# Configurar firewall
echo "🛡️ Configurando firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo "✅ Deploy concluído com sucesso!"
echo "🌐 Acesse: https://axion.com.br"
echo "📊 Logs: sudo tail -f /var/log/axion/app.log"
echo "⚙️ Gerenciar: sudo supervisorctl status axion"
```

## 🚀 **Passos para Deploy**

### **1. Criar VM no GCP**
```bash
# Comando gcloud
gcloud compute instances create axion-vm \
  --zone=us-central1-a \
  --machine-type=e2-standard-2 \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=50GB \
  --boot-disk-type=pd-ssd
```

### **2. Conectar e Configurar**
```bash
# Conectar via SSH
ssh usuario@IP_DA_VM

# Executar deploy automático
chmod +x deploy_producao.sh
./deploy_producao.sh
```

### **3. Configurar Domínio**
```bash
# Comprar domínio (ex: axion.com.br)
# Configurar DNS para apontar para IP da VM
# SSL será configurado automaticamente
```

## 💰 **Custos Estimados**

### **Mensal:**
- **VM GCP**: R$ 250/mês
- **Domínio**: R$ 50/ano (R$ 4/mês)
- **Total**: ~R$ 254/mês

### **Anual:**
- **Hospedagem**: R$ 3.000/ano
- **Domínio**: R$ 50/ano
- **Total**: ~R$ 3.050/ano

## 🔒 **Segurança**

### **1. Firewall**
```bash
# Configurar firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable
```

### **2. SSL/HTTPS**
```bash
# SSL automático com Let's Encrypt
sudo certbot --nginx -d axion.com.br
```

### **3. Backup**
```bash
# Backup automático
sudo crontab -e
# Adicionar: 0 2 * * * tar -czf /backup/axion-$(date +%Y%m%d).tar.gz /opt/axion
```

## 📊 **Monitoramento**

### **1. Logs**
```bash
# Ver logs do aplicativo
sudo tail -f /var/log/axion/app.log

# Ver logs do Nginx
sudo tail -f /var/log/nginx/access.log
```

### **2. Status dos Serviços**
```bash
# Status do aplicativo
sudo supervisorctl status axion

# Status do Nginx
sudo systemctl status nginx
```

### **3. Recursos**
```bash
# Uso de CPU e RAM
htop

# Uso de disco
df -h
```

## 🎯 **Modelo de Negócio**

### **Acesso via Web:**
- **URL**: https://axion.com.br
- **Login**: Sistema de autenticação
- **Planos**: Básico, Profissional, Enterprise

### **Preços Sugeridos:**
- **Básico**: R$ 99/mês (até 5 usuários)
- **Profissional**: R$ 299/mês (até 20 usuários)
- **Enterprise**: R$ 599/mês (usuários ilimitados)

### **Para sua empresa (18 funcionários):**
- **Recomendação**: Plano Profissional (R$ 299/mês)
- **ROI**: Economia de tempo vs. processamento manual

## 🔧 **Manutenção**

### **1. Atualizações**
```bash
# Atualizar código
cd /opt/axion
git pull
sudo supervisorctl restart axion
```

### **2. Backup**
```bash
# Backup manual
sudo tar -czf /backup/axion-$(date +%Y%m%d).tar.gz /opt/axion
```

### **3. Monitoramento**
```bash
# Verificar status
sudo supervisorctl status axion
sudo systemctl status nginx
```

## 🎉 **Resultado Final**

**Sistema hospedado e acessível via web:**
- ✅ **URL**: https://axion.com.br
- ✅ **SSL**: Configurado automaticamente
- ✅ **Performance**: Otimizado para múltiplos usuários
- ✅ **Segurança**: Firewall e HTTPS
- ✅ **Backup**: Automático
- ✅ **Monitoramento**: Logs e status

**Pronto para venda como SaaS!** 🚀

---

**📋 Checklist para Deploy:**
1. ✅ Criar VM no GCP
2. ✅ Executar script de deploy
3. ✅ Configurar domínio
4. ✅ Testar sistema
5. ✅ Configurar monitoramento
6. ✅ Implementar sistema de pagamento

**O sistema Axion está pronto para ser comercializado como SaaS!** 🎯 