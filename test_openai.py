#!/usr/bin/env python3
"""
Teste da API OpenAI para extração de campos de certidão
"""

import os
import sys
sys.path.append('.')

from config import Config
from ai.openai_service import extract_fields_with_openai

def test_openai_connection():
    """Testa a conexão com a OpenAI API"""
    print("🧪 Testando conexão com OpenAI API...")
    
    # Verificar se a chave está configurada
    if not Config.OPENAI_API_KEY or Config.OPENAI_API_KEY.strip() == '':
        print("❌ Chave da OpenAI não configurada!")
        print("💡 Configure a variável de ambiente OPENAI_API_KEY")
        return False
    
    print(f"✅ Chave da OpenAI configurada: {Config.OPENAI_API_KEY[:20]}...")
    
    # Texto de teste para certidão
    test_text = """
    MATRÍCULA Nº 123456
    CADASTRO NACIONAL DE MATRÍCULA - CNM: 123456
    DESCRIÇÃO DO IMÓVEL: Casa residencial localizada na Rua das Flores, nº 123, 
    Bairro Centro, São Luís/MA, com área de 150m², confrontando ao norte com Rua A, 
    ao sul com Rua B, ao leste com Rua C e ao oeste com Rua D.
    PROPRIETÁRIOS: João Silva Santos, brasileiro, casado, CPF: 123.456.789-00, 
    RG: 1234567 SSP/MA, residente na Rua das Flores, nº 123, São Luís/MA.
    INSCRIÇÃO IMOBILIÁRIA: 987654
    RIP: 12345
    ÔNUS E RESTRIÇÕES: Hipoteca em favor do Banco XYZ, averbada no Livro 1, Folha 10.
    SOLICITANTE: Maria Silva Santos
    """
    
    print("📄 Testando extração de campos da certidão...")
    print(f"📝 Texto de teste ({len(test_text)} caracteres):")
    print(test_text[:200] + "...")
    
    try:
        # Testar extração com GPT-3.5
        print("\n🤖 Testando com GPT-3.5-turbo...")
        result_35 = extract_fields_with_openai(test_text, model="gpt-3.5-turbo", service_type="certidao")
        
        if "error" in result_35:
            print(f"❌ Erro com GPT-3.5: {result_35['error']}")
        else:
            print("✅ GPT-3.5 funcionando!")
            for key, value in result_35.items():
                print(f"  📋 {key}: {value[:50]}...")
        
        # Testar extração com GPT-4o se disponível
        print("\n🤖 Testando com GPT-4o...")
        result_4o = extract_fields_with_openai(test_text, model="gpt-4o", service_type="certidao")
        
        if "error" in result_4o:
            print(f"❌ Erro com GPT-4o: {result_4o['error']}")
        else:
            print("✅ GPT-4o funcionando!")
            for key, value in result_4o.items():
                print(f"  📋 {key}: {value[:50]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro durante teste: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_openai_connection()
    if success:
        print("\n✅ Teste concluído com sucesso!")
    else:
        print("\n❌ Teste falhou!")
        sys.exit(1) 