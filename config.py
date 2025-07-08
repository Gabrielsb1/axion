# config.py - Configurações do sistema Axion OCR

import os

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
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY') or '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'  # Temporário para teste local
    
    @staticmethod
    def init_app(app):
        """Inicializar configurações no app Flask"""
        # Criar diretórios se não existirem
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        os.makedirs(Config.PROCESSED_FOLDER, exist_ok=True)
        
        # Configurar logging
        import logging
        logging.basicConfig(
            level=getattr(logging, Config.LOG_LEVEL),
            format=Config.LOG_FORMAT
        )

class DevelopmentConfig(Config):
    """Configurações para desenvolvimento"""
    DEBUG = True
    PORT = 5000

class ProductionConfig(Config):
    """Configurações para produção"""
    DEBUG = False
    PORT = int(os.environ.get('PORT', 5000))
    SECRET_KEY = os.environ.get('SECRET_KEY')
    
    # Configurações de segurança para produção
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB
    CLEANUP_TEMP_FILES = True

class TestingConfig(Config):
    """Configurações para testes"""
    TESTING = True
    DEBUG = True
    UPLOAD_FOLDER = 'test_uploads'
    PROCESSED_FOLDER = 'test_processed'

# Dicionário de configurações
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
} 