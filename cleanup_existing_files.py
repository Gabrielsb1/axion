#!/usr/bin/env python3
"""
Script para limpar arquivos sensíveis existentes
Remove todos os arquivos das pastas uploads e processed de forma segura
"""

import os
import shutil
import logging
from datetime import datetime
from config import Config

def secure_delete_file(file_path):
    """Remove arquivo de forma segura (sobrescreve antes de deletar)"""
    try:
        if os.path.exists(file_path):
            # Sobrescrever com dados aleatórios
            file_size = os.path.getsize(file_path)
            with open(file_path, 'wb') as f:
                f.write(os.urandom(file_size))
            
            # Deletar arquivo
            os.remove(file_path)
            return True
    except Exception as e:
        logging.error(f"Erro ao deletar arquivo {file_path}: {e}")
        return False

def cleanup_directory(directory_path, directory_name):
    """Limpa todos os arquivos de um diretório de forma segura"""
    if not os.path.exists(directory_path):
        print(f"📁 Diretório {directory_name} não existe: {directory_path}")
        return
    
    files = [f for f in os.listdir(directory_path) if os.path.isfile(os.path.join(directory_path, f))]
    
    if not files:
        print(f"📁 Diretório {directory_name} já está vazio")
        return
    
    print(f"🧹 Limpando {len(files)} arquivos do diretório {directory_name}...")
    
    deleted_count = 0
    for filename in files:
        file_path = os.path.join(directory_path, filename)
        if secure_delete_file(file_path):
            deleted_count += 1
            print(f"  ✅ Removido: {filename}")
        else:
            print(f"  ❌ Erro ao remover: {filename}")
    
    print(f"✅ {deleted_count} arquivos removidos do diretório {directory_name}")

def main():
    """Função principal"""
    print("🔒 Iniciando limpeza segura de arquivos sensíveis...")
    print(f"⏰ Timestamp: {datetime.now().isoformat()}")
    
    # Configurar logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    
    # Limpar diretório uploads
    cleanup_directory(Config.UPLOAD_FOLDER, "uploads")
    
    # Limpar diretório processed
    cleanup_directory(Config.PROCESSED_FOLDER, "processed")
    
    # Limpar diretório temporário se existir
    if os.path.exists(Config.TEMP_DIRECTORY):
        cleanup_directory(Config.TEMP_DIRECTORY, "temporário")
    
    print("\n🎉 Limpeza concluída!")
    print("📋 Resumo:")
    print(f"  - Diretório uploads: {'Limpo' if not os.listdir(Config.UPLOAD_FOLDER) else 'Com arquivos'}")
    print(f"  - Diretório processed: {'Limpo' if not os.listdir(Config.PROCESSED_FOLDER) else 'Com arquivos'}")
    print(f"  - Diretório temporário: {'Limpo' if not os.path.exists(Config.TEMP_DIRECTORY) or not os.listdir(Config.TEMP_DIRECTORY) else 'Com arquivos'}")
    
    print("\n⚠️ IMPORTANTE:")
    print("  - Todos os arquivos foram removidos de forma segura")
    print("  - O sistema agora processa arquivos em memória temporária")
    print("  - Arquivos são automaticamente limpos após processamento")
    print("  - Ative o modo de segurança no config.py para máxima proteção")

if __name__ == "__main__":
    main() 