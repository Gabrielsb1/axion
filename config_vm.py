# config_vm.py - Configurações otimizadas para Máquina Virtual

import os
import tempfile
from datetime import timedelta

class VMConfig:
    """Configurações otimizadas para VM"""
    
    # Configurações do Flask
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'axion-vm-secret-key-2024'
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB para VM
    
    # Diretórios
    UPLOAD_FOLDER = 'uploads'
    PROCESSED_FOLDER = 'processed'
    STATIC_FOLDER = 'static'
    
    # Configurações de arquivo
    ALLOWED_EXTENSIONS = {'pdf'}
    MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
    
    # Configurações de segurança para VM
    SECURE_PROCESSING = True
    AUTO_CLEANUP = True
    CLEANUP_INTERVAL = timedelta(minutes=30)  # Limpar a cada 30 minutos
    MAX_FILE_AGE = timedelta(hours=2)         # Manter arquivos por no máximo 2h
    ENCRYPT_TEMP_FILES = True
    USE_TEMP_DIRECTORY = True
    TEMP_DIRECTORY = tempfile.gettempdir() + '/axion_vm_secure'
    
    # Configurações de auditoria
    AUDIT_LOGGING = True
    AUDIT_LOG_FILE = 'audit_vm.log'
    LOG_SENSITIVE_OPERATIONS = True
    
    # Configurações do OCR otimizadas para VM
    OCR_LANGUAGES = 'por'  # Apenas português para economizar memória
    OCR_DESKEW = False     # Desabilitado para economizar CPU
    OCR_CLEAN = False      # Desabilitado para economizar CPU
    OCR_FORCE_OCR = True   # Forçar OCR em todas as páginas
    OCR_OPTIMIZE = 0       # Sem otimização para economizar memória
    OCR_TIMEOUT = 120      # 2 minutos de timeout para VM
    
    # Configurações de logging
    LOG_LEVEL = 'INFO'
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    # Configurações de segurança
    SECURE_FILENAMES = True
    CLEANUP_TEMP_FILES = True
    
    # Configurações de desenvolvimento
    DEBUG = False  # Desabilitado em VM
    HOST = '0.0.0.0'  # Permitir acesso externo
    PORT = 5000
    
    # Chave da OpenAI API
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY') or 'sua-chave-openai-aqui'
    
    # Configurações específicas para VM
    VM_MODE = True
    MAX_CONCURRENT_PROCESSES = 2  # Limitar processos concorrentes
    MEMORY_LIMIT = '2G'  # Limitar uso de memória
    CPU_LIMIT = 4  # Limitar uso de CPU
    
    @staticmethod
    def init_app(app):
        """Inicializar configurações no app Flask"""
        # Criar diretórios se não existirem
        os.makedirs(VMConfig.UPLOAD_FOLDER, exist_ok=True)
        os.makedirs(VMConfig.PROCESSED_FOLDER, exist_ok=True)
        os.makedirs(VMConfig.TEMP_DIRECTORY, exist_ok=True)
        
        # Configurar logging
        import logging
        logging.basicConfig(
            level=getattr(logging, VMConfig.LOG_LEVEL),
            format=VMConfig.LOG_FORMAT
        )
        
        # Configurar logging de auditoria se habilitado
        if VMConfig.AUDIT_LOGGING:
            audit_logger = logging.getLogger('audit')
            audit_logger.setLevel(logging.INFO)
            audit_handler = logging.FileHandler(VMConfig.AUDIT_LOG_FILE)
            audit_handler.setFormatter(logging.Formatter(VMConfig.LOG_FORMAT))
            audit_logger.addHandler(audit_handler)

class VMDevelopmentConfig(VMConfig):
    """Configurações para desenvolvimento em VM"""
    DEBUG = True
    PORT = 5000
    SECURE_PROCESSING = True

class VMProductionConfig(VMConfig):
    """Configurações para produção em VM"""
    DEBUG = False
    PORT = int(os.environ.get('PORT', 5000))
    SECRET_KEY = os.environ.get('SECRET_KEY')
    
    # Configurações de segurança para produção em VM
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB
    CLEANUP_TEMP_FILES = True
    SECURE_PROCESSING = True
    AUTO_CLEANUP = True
    CLEANUP_INTERVAL = timedelta(minutes=15)  # Limpar a cada 15 minutos
    MAX_FILE_AGE = timedelta(hours=1)         # Manter arquivos por no máximo 1h

class VMTestingConfig(VMConfig):
    """Configurações para testes em VM"""
    TESTING = True
    DEBUG = True
    UPLOAD_FOLDER = 'test_uploads'
    PROCESSED_FOLDER = 'test_processed'
    SECURE_PROCESSING = False  # Desabilitar para testes

# Dicionário de configurações para VM
vm_config = {
    'development': VMDevelopmentConfig,
    'production': VMProductionConfig,
    'testing': VMTestingConfig,
    'default': VMDevelopmentConfig
} 