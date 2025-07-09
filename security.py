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
import shutil
import tempfile
import uuid
import logging
from datetime import datetime, timedelta
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import threading
import time
from config import Config

class SecureFileManager:
    """Gerencia processamento seguro de arquivos sensíveis"""
    
    def __init__(self):
        self.encryption_key = self._generate_encryption_key()
        self.fernet = Fernet(self.encryption_key)
        self.cleanup_thread = None
        self.running = False
        
        # Iniciar thread de limpeza automática
        if Config.AUTO_CLEANUP:
            self._start_cleanup_thread()
    
    def _generate_encryption_key(self):
        """Gera chave de criptografia baseada em salt"""
        salt = b'axion_secure_salt_2024'
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(b"axion_secret_key"))
        return key
    
    def _log_audit(self, operation, filename, user_ip=None, details=None):
        """Registra operações sensíveis para auditoria"""
        if not Config.AUDIT_LOGGING:
            return
            
        audit_logger = logging.getLogger('audit')
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'operation': operation,
            'filename': filename,
            'user_ip': user_ip,
            'details': details
        }
        audit_logger.info(f"AUDIT: {log_entry}")
    
    def create_secure_temp_file(self, original_filename, user_ip=None):
        """Cria arquivo temporário seguro com criptografia"""
        file_id = str(uuid.uuid4())
        secure_filename = f"secure_{file_id}_{os.path.basename(original_filename)}"
        temp_path = os.path.join(Config.TEMP_DIRECTORY, secure_filename)
        
        # Registrar criação do arquivo
        self._log_audit('CREATE_TEMP_FILE', original_filename, user_ip, {
            'secure_filename': secure_filename,
            'temp_path': temp_path
        })
        
        return temp_path, file_id
    
    def encrypt_file(self, file_path):
        """Criptografa arquivo em disco"""
        if not Config.ENCRYPT_TEMP_FILES:
            return file_path
            
        try:
            with open(file_path, 'rb') as f:
                data = f.read()
            
            encrypted_data = self.fernet.encrypt(data)
            
            encrypted_path = file_path + '.encrypted'
            with open(encrypted_path, 'wb') as f:
                f.write(encrypted_data)
            
            # Remover arquivo original
            os.remove(file_path)
            
            return encrypted_path
        except Exception as e:
            logging.error(f"Erro ao criptografar arquivo {file_path}: {e}")
            return file_path
    
    def decrypt_file(self, encrypted_path):
        """Descriptografa arquivo para processamento"""
        if not encrypted_path.endswith('.encrypted'):
            return encrypted_path
            
        try:
            with open(encrypted_path, 'rb') as f:
                encrypted_data = f.read()
            
            decrypted_data = self.fernet.decrypt(encrypted_data)
            
            decrypted_path = encrypted_path.replace('.encrypted', '')
            with open(decrypted_path, 'wb') as f:
                f.write(decrypted_data)
            
            return decrypted_path
        except Exception as e:
            logging.error(f"Erro ao descriptografar arquivo {encrypted_path}: {e}")
            return encrypted_path
    
    def secure_delete(self, file_path):
        """Remove arquivo de forma segura (sobrescreve antes de deletar)"""
        try:
            if os.path.exists(file_path):
                # Sobrescrever com dados aleatórios
                file_size = os.path.getsize(file_path)
                with open(file_path, 'wb') as f:
                    f.write(os.urandom(file_size))
                
                # Deletar arquivo
                os.remove(file_path)
                
                self._log_audit('SECURE_DELETE', os.path.basename(file_path))
                return True
        except Exception as e:
            logging.error(f"Erro ao deletar arquivo {file_path}: {e}")
            return False
    
    def cleanup_old_files(self):
        """Remove arquivos antigos do diretório temporário"""
        try:
            current_time = datetime.now()
            files_removed = 0
            
            for filename in os.listdir(Config.TEMP_DIRECTORY):
                file_path = os.path.join(Config.TEMP_DIRECTORY, filename)
                
                if os.path.isfile(file_path):
                    file_age = current_time - datetime.fromtimestamp(os.path.getctime(file_path))
                    
                    if file_age > Config.MAX_FILE_AGE:
                        if self.secure_delete(file_path):
                            files_removed += 1
                            self._log_audit('AUTO_CLEANUP', filename, details={
                                'file_age_hours': file_age.total_seconds() / 3600
                            })
            
            if files_removed > 0:
                logging.info(f"Limpeza automática: {files_removed} arquivos removidos")
                
        except Exception as e:
            logging.error(f"Erro na limpeza automática: {e}")
    
    def _start_cleanup_thread(self):
        """Inicia thread de limpeza automática"""
        self.running = True
        self.cleanup_thread = threading.Thread(target=self._cleanup_worker, daemon=True)
        self.cleanup_thread.start()
    
    def _cleanup_worker(self):
        """Worker thread para limpeza automática"""
        while self.running:
            try:
                self.cleanup_old_files()
                time.sleep(Config.CLEANUP_INTERVAL.total_seconds())
            except Exception as e:
                logging.error(f"Erro no worker de limpeza: {e}")
                time.sleep(60)  # Esperar 1 minuto em caso de erro
    
    def stop_cleanup_thread(self):
        """Para thread de limpeza automática"""
        self.running = False
        if self.cleanup_thread:
            self.cleanup_thread.join(timeout=5)
    
    def process_file_securely(self, uploaded_file, original_filename, user_ip=None):
        """Processa arquivo de forma segura"""
        try:
            # Criar arquivo temporário seguro
            temp_path, file_id = self.create_secure_temp_file(original_filename, user_ip)
            
            # Salvar arquivo
            uploaded_file.save(temp_path)
            
            # Criptografar se habilitado
            if Config.ENCRYPT_TEMP_FILES:
                temp_path = self.encrypt_file(temp_path)
            
            self._log_audit('FILE_PROCESSED', original_filename, user_ip, {
                'file_id': file_id,
                'file_size': os.path.getsize(temp_path) if os.path.exists(temp_path) else 0
            })
            
            return temp_path, file_id
            
        except Exception as e:
            logging.error(f"Erro no processamento seguro: {e}")
            raise
    
    def cleanup_file(self, file_path, user_ip=None):
        """Remove arquivo de forma segura após processamento"""
        try:
            if file_path and os.path.exists(file_path):
                filename = os.path.basename(file_path)
                self.secure_delete(file_path)
                self._log_audit('FILE_CLEANUP', filename, user_ip)
                return True
        except Exception as e:
            logging.error(f"Erro ao limpar arquivo {file_path}: {e}")
            return False

# Instância global do gerenciador de segurança
secure_manager = SecureFileManager() 