#!/usr/bin/env python3
"""
Script de teste para debugar o processamento de memorial
"""

import sys
import os
import pandas as pd
from extrator_memorial import processar_arquivo

def test_memorial_processing():
    """Testa o processamento de memorial diretamente"""
    
    # Verificar se há arquivos DOCX na pasta uploads
    upload_folder = "uploads"
    if not os.path.exists(upload_folder):
        print("❌ Pasta uploads não encontrada")
        return
    
    docx_files = [f for f in os.listdir(upload_folder) if f.lower().endswith('.docx')]
    
    if not docx_files:
        print("❌ Nenhum arquivo DOCX encontrado na pasta uploads")
        return
    
    print(f"📁 Encontrados {len(docx_files)} arquivo(s) DOCX:")
    for file in docx_files:
        print(f"  - {file}")
    
    # Processar o primeiro arquivo
    test_file = os.path.join(upload_folder, docx_files[0])
    print(f"\n🔍 Processando arquivo: {test_file}")
    
    try:
        # Processar arquivo
        df = processar_arquivo(test_file)
        
        if df is not None and not df.empty:
            print(f"✅ Processamento bem-sucedido!")
            print(f"📊 Registros extraídos: {len(df)}")
            print(f"📊 Colunas: {list(df.columns)}")
            print(f"📊 Primeiras 3 linhas:")
            print(df.head(3).to_string())
            
            # Testar conversão para JSON
            dados_json = df.to_dict('records')
            print(f"\n📊 Conversão para JSON: {len(dados_json)} registros")
            print(f"📊 Primeiro registro JSON: {dados_json[0] if dados_json else 'N/A'}")
            
        else:
            print("❌ Nenhum dado extraído do arquivo")
            
    except Exception as e:
        print(f"❌ Erro ao processar arquivo: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_memorial_processing() 