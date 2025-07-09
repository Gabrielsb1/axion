"""
AxionDocs - Sistema OCR integrado com API OpenAI
Desenvolvido por João Gabriel Santos Barros (2025)

Licenciado sob MIT License - consulte LICENSE.txt

Este software é fornecido "no estado em que se encontra", sem garantias.

O uso da API OpenAI requer chave configurada via variável de ambiente: OPENAI_API_KEY.
Os custos gerados são responsabilidade do usuário da chave.

Projeto iniciado como parte do TCC no Cartório de Registro de Imóveis de São Luís.
"""

import os
import tempfile
from datetime import timedelta

class Config:
    """Configurações principais do sistema"""
    
    # Configurações do Flask
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'axion-ocr-secret-key-2024'
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB
    
    # Diretórios
    UPLOAD_FOLDER = 'uploads'
    PROCESSED_FOLDER = 'processed'
    STATIC_FOLDER = 'static'
    
    # Configurações de arquivo
    ALLOWED_EXTENSIONS = {'pdf'}
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    
    # Configurações de segurança para dados sensíveis
    SECURE_PROCESSING = True
    AUTO_CLEANUP = True
    CLEANUP_INTERVAL = timedelta(hours=1)  # Limpar arquivos a cada 1 hora
    MAX_FILE_AGE = timedelta(hours=24)     # Manter arquivos por no máximo 24h
    ENCRYPT_TEMP_FILES = True
    USE_TEMP_DIRECTORY = True
    TEMP_DIRECTORY = tempfile.gettempdir() + '/axion_secure'
    os.makedirs(TEMP_DIRECTORY, exist_ok=True)
    
    # Configurações de auditoria
    AUDIT_LOGGING = True
    AUDIT_LOG_FILE = 'audit.log'
    LOG_SENSITIVE_OPERATIONS = True
    
    # Configurações do OCR
    OCR_LANGUAGES = 'por+eng'  # Português + Inglês
    OCR_DESKEW = False         # Corrigir rotação (desabilitado - requer Ghostscript)
    OCR_CLEAN = False          # Limpar imagem (desabilitado - requer unpaper)
    OCR_FORCE_OCR = True       # Forçar OCR em todas as páginas
    OCR_OPTIMIZE = 0           # Sem otimização (desabilitado - requer Ghostscript)
    
    # Configurações de logging
    LOG_LEVEL = 'INFO'
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    # Configurações de segurança
    SECURE_FILENAMES = True
    CLEANUP_TEMP_FILES = True
    
    # Configurações de desenvolvimento
    DEBUG = True
    HOST = '0.0.0.0'
    PORT = 5000
    
    # Chave da OpenAI API
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY') or ''  # Temporário para teste local
    
    @staticmethod
    def init_app(app):
        """Inicializar configurações no app Flask"""
        # Criar diretórios se não existirem
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        os.makedirs(Config.PROCESSED_FOLDER, exist_ok=True)
        os.makedirs(Config.TEMP_DIRECTORY, exist_ok=True)
        
        # Configurar logging
        import logging
        logging.basicConfig(
            level=getattr(logging, Config.LOG_LEVEL),
            format=Config.LOG_FORMAT
        )
        
        # Configurar logging de auditoria se habilitado
        if Config.AUDIT_LOGGING:
            audit_logger = logging.getLogger('audit')
            audit_logger.setLevel(logging.INFO)
            audit_handler = logging.FileHandler(Config.AUDIT_LOG_FILE)
            audit_handler.setFormatter(logging.Formatter(Config.LOG_FORMAT))
            audit_logger.addHandler(audit_handler)

class DevelopmentConfig(Config):
    """Configurações para desenvolvimento"""
    DEBUG = True
    PORT = 5000
    SECURE_PROCESSING = True  # Manter segurança mesmo em desenvolvimento

class ProductionConfig(Config):
    """Configurações para produção"""
    DEBUG = False
    PORT = int(os.environ.get('PORT', 5000))
    SECRET_KEY = os.environ.get('SECRET_KEY')
    
    # Configurações de segurança para produção
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB
    CLEANUP_TEMP_FILES = True
    SECURE_PROCESSING = True
    AUTO_CLEANUP = True
    CLEANUP_INTERVAL = timedelta(minutes=30)  # Limpar a cada 30 minutos em produção
    MAX_FILE_AGE = timedelta(hours=2)         # Manter arquivos por no máximo 2h em produção

class TestingConfig(Config):
    """Configurações para testes"""
    TESTING = True
    DEBUG = True
    UPLOAD_FOLDER = 'test_uploads'
    PROCESSED_FOLDER = 'test_processed'
    SECURE_PROCESSING = False  # Desabilitar para testes

# Dicionário de configurações
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
} 