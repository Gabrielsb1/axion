#!/usr/bin/env python3
"""
Teste simples da API da OpenAI
"""

import os
import openai
from config import Config

def test_openai_connection():
    """Testa a conexão com a API da OpenAI"""
    try:
        print("🔑 Testando conexão com OpenAI...")
        
        if not Config.OPENAI_API_KEY:
            print("❌ OPENAI_API_KEY não está definida!")
            return False
        
        api_key_preview = Config.OPENAI_API_KEY[:20]
        print(f"✅ Chave API encontrada: {api_key_preview}...")
        
        client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)
        
        # Teste simples
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Diga apenas 'OK' se você está funcionando."}],
            temperature=0.0,
            max_tokens=10
        )
        
        content = response.choices[0].message.content
        print(f"✅ Resposta da API: {content}")
        return True
        
    except Exception as e:
        print(f"❌ Erro na conexão: {str(e)}")
        return False

if __name__ == "__main__":
    test_openai_connection() 