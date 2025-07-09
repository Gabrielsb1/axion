#!/usr/bin/env python3
"""
Script para verificar status das configurações de segurança
"""

from config import Config
import os

def check_security_status():
    """Verifica status das configurações de segurança"""
    print("🔒 Verificando configurações de segurança...")
    print()
    
    # Configurações principais
    print("📋 Configurações de Segurança:")
    print(f"  ✅ Processamento seguro: {Config.SECURE_PROCESSING}")
    print(f"  🔐 Criptografia de arquivos: {Config.ENCRYPT_TEMP_FILES}")
    print(f"  🧹 Limpeza automática: {Config.AUTO_CLEANUP}")
    print(f"  📝 Logs de auditoria: {Config.AUDIT_LOGGING}")
    print()
    
    # Diretórios
    print("📁 Status dos Diretórios:")
    print(f"  📂 Diretório temporário: {Config.TEMP_DIRECTORY}")
    print(f"    - Existe: {os.path.exists(Config.TEMP_DIRECTORY)}")
    if os.path.exists(Config.TEMP_DIRECTORY):
        files = len([f for f in os.listdir(Config.TEMP_DIRECTORY) if os.path.isfile(os.path.join(Config.TEMP_DIRECTORY, f))])
        print(f"    - Arquivos: {files}")
    
    print(f"  📂 Diretório uploads: {Config.UPLOAD_FOLDER}")
    print(f"    - Existe: {os.path.exists(Config.UPLOAD_FOLDER)}")
    if os.path.exists(Config.UPLOAD_FOLDER):
        files = len([f for f in os.listdir(Config.UPLOAD_FOLDER) if os.path.isfile(os.path.join(Config.UPLOAD_FOLDER, f))])
        print(f"    - Arquivos: {files}")
    
    print(f"  📂 Diretório processed: {Config.PROCESSED_FOLDER}")
    print(f"    - Existe: {os.path.exists(Config.PROCESSED_FOLDER)}")
    if os.path.exists(Config.PROCESSED_FOLDER):
        files = len([f for f in os.listdir(Config.PROCESSED_FOLDER) if os.path.isfile(os.path.join(Config.PROCESSED_FOLDER, f))])
        print(f"    - Arquivos: {files}")
    print()
    
    # Logs
    print("📝 Status dos Logs:")
    print(f"  📄 Arquivo de auditoria: {Config.AUDIT_LOG_FILE}")
    print(f"    - Existe: {os.path.exists(Config.AUDIT_LOG_FILE)}")
    if os.path.exists(Config.AUDIT_LOG_FILE):
        size = os.path.getsize(Config.AUDIT_LOG_FILE)
        print(f"    - Tamanho: {size} bytes")
    print()
    
    # Recomendações
    print("💡 Recomendações:")
    if Config.SECURE_PROCESSING:
        print("  ✅ Processamento seguro está ativado")
    else:
        print("  ⚠️ ATENÇÃO: Processamento seguro está desativado!")
    
    if Config.ENCRYPT_TEMP_FILES:
        print("  ✅ Criptografia de arquivos está ativada")
    else:
        print("  ⚠️ ATENÇÃO: Criptografia de arquivos está desativada!")
    
    if Config.AUTO_CLEANUP:
        print("  ✅ Limpeza automática está ativada")
    else:
        print("  ⚠️ ATENÇÃO: Limpeza automática está desativada!")
    
    # Verificar se há arquivos nas pastas antigas
    upload_files = 0
    processed_files = 0
    
    if os.path.exists(Config.UPLOAD_FOLDER):
        upload_files = len([f for f in os.listdir(Config.UPLOAD_FOLDER) if os.path.isfile(os.path.join(Config.UPLOAD_FOLDER, f))])
    
    if os.path.exists(Config.PROCESSED_FOLDER):
        processed_files = len([f for f in os.listdir(Config.PROCESSED_FOLDER) if os.path.isfile(os.path.join(Config.PROCESSED_FOLDER, f))])
    
    if upload_files > 0 or processed_files > 0:
        print(f"  ⚠️ ATENÇÃO: Encontrados {upload_files} arquivos em uploads e {processed_files} em processed")
        print("     Execute: python cleanup_existing_files.py")
    
    print()
    print("🎉 Verificação concluída!")

if __name__ == "__main__":
    check_security_status() 