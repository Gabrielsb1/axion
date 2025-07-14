#!/usr/bin/env python3
"""
Teste da análise do checklist
Verifica se o sistema está analisando corretamente as perguntas específicas
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ai.openai_service import analyze_checklist_with_document_data

def test_analise_checklist():
    """Testa a análise do checklist com dados simulados"""
    
    # Dados simulados de documentos
    all_results = [
        {
            'filename': 'matricula_3ri.pdf',
            'document_type': 'MATRÍCULA',
            'document_data': {
                'numero_matricula': '123456',
                'inscricao_imobiliaria': 'II-123456',
                'proprietarios_atuais': 'João da Silva, Maria da Silva',
                'descricao_imovel': 'Casa residencial localizada na Rua A, 123',
                'tipo_dominialidade': 'Propriedade plena',
                'onus_ativos': [],
                'rip': 'RIP-123456',
                'data_ultima_transmissao': '15/12/2020',
                'valor_ultima_transmissao': 'R$ 150.000,00'
            }
        },
        {
            'filename': 'certidao_situacao.pdf',
            'document_type': 'CERTIDÃO',
            'document_data': {
                'tipo_certidao': 'Situação jurídica',
                'certidoes_presentes': ['Certidão de situação jurídica'],
                'prazos_certidoes': ['30 dias'],
                'data_documento': '01/01/2024',
                'onus_certidao_negativa': 'Não há ônus real',
                'descricao_imovel': 'Casa residencial localizada na Rua A, 123'
            }
        },
        {
            'filename': 'contrato_compra.pdf',
            'document_type': 'CONTRATO',
            'document_data': {
                'tipo_contrato': 'Compra e venda',
                'data_contrato': '15/12/2020',
                'valor_contrato': 'R$ 150.000,00',
                'compradores': 'João da Silva',
                'vendedores': 'Maria da Silva',
                'cpfs_cnpjs': '123.456.789-00, 987.654.321-00',
                'rgs': '1234567 SSP/MA, 7654321 SSP/MA',
                'enderecos_partes': 'Rua A, 123, Centro, São Luís/MA',
                'estados_civis': 'Casado, Casada',
                'profissoes': 'Advogado, Médica',
                'descricao_imovel_contrato': 'Casa residencial localizada na Rua A, 123',
                'matricula_imovel': '123456',
                'inscricao_imobiliaria': 'II-123456',
                'clausulas_especiais': ['Cláusula de arras'],
                'documentos_anexos': ['Certidão de casamento']
            }
        }
    ]
    
    print("🧪 Testando análise do checklist...")
    print(f"📄 Documentos simulados: {len(all_results)}")
    
    for i, result in enumerate(all_results):
        print(f"  {i+1}. {result['filename']} ({result['document_type']})")
    
    try:
        # Testar a análise do checklist
        result = analyze_checklist_with_document_data(all_results, model="gpt-4o")
        
        if 'error' in result:
            print(f"❌ Erro na análise: {result['error']}")
            return False
        
        print("✅ Análise do checklist concluída!")
        print(f"📊 Itens analisados: {len(result)}")
        
        # Mostrar alguns resultados
        for i in range(1, min(6, len(result) + 1)):
            item_key = f"item{i}"
            if item_key in result:
                item = result[item_key]
                print(f"  {i}. {item['resposta']} - {item['justificativa'][:100]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro no teste: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_analise_checklist()
    if success:
        print("✅ Teste concluído com sucesso!")
    else:
        print("❌ Teste falhou!") 