// test_debug_qualificacao.js - Debug da qualificação

// Simular dados que vêm do backend
const dadosTeste = {
    campos: {
        'item1_protocolo_antigo': 'N/A',
        'item2_reingresso_pendencias': 'N/A',
        'item3_nome_apresentante': 'N/A',
        'item4_certidoes_validade': 'N/A',
        'item5_requisitos_art176': 'N/A',
        'item6_dominialidade': 'N/A',
        'item7_foreiro_rip': 'N/A',
        'item8_onus_imovel': 'N/A',
        'item9_autorizacao_cancelamento': 'N/A',
        'item10_qualificacao_proprietarios': 'N/A',
        'justificativa_item1': 'Não há menção a protocolo antigo nas matrículas analisadas.',
        'justificativa_item2': 'Não há referência a reingresso ou pendências.',
        'justificativa_item3': 'Não consta nome de apresentante no protocolo.',
        'justificativa_item4': 'Não há certidões de inteiro teor ou situação jurídica identificadas.',
        'justificativa_item5': 'Não há informações suficientes para avaliar os requisitos do Art. 176.',
        'justificativa_item6': 'Não há informações sobre dominialidade do imóvel.',
        'justificativa_item7': 'Não há menção a foreiro ou RIP.',
        'justificativa_item8': 'Não há menção a ônus sobre o imóvel.',
        'justificativa_item9': 'Não há termo de autorização para cancelamento de ônus.',
        'justificativa_item10': 'Não há qualificação completa dos proprietários.',
        'contrato_presente': 'N/A',
        'matricula_presente': 'Sim',
        'certidao_itbi_presente': 'N/A',
        'procuracao_presente': 'N/A',
        'cnd_presente': 'N/A',
        'justificativa_contrato': 'Não há contrato identificado nos documentos.',
        'justificativa_matricula': 'As matrículas estão claramente identificadas nos documentos analisados.',
        'justificativa_itbi': 'Não há certidão de ITBI identificada.',
        'justificativa_procuracao': 'Não há procuração identificada.',
        'justificativa_cnd': 'Não há CND identificada.',
        'analise_completa': 'Análise dos documentos enviados',
        'observacoes_recomendacoes': 'Observações sobre documentos',
        'status_qualificacao': 'pendente',
        'pontuacao_qualificacao': '0',
        'documentos_faltantes': 'Lista de documentos faltantes',
        'problemas_identificados': 'Problemas encontrados',
        'recomendacoes_especificas': 'Recomendações específicas'
    }
};

// Função de debug para testar o preenchimento
function debugFillChecklist() {
    console.log('🧪 DEBUG: Testando preenchimento do checklist');
    console.log('📊 Dados de teste:', dadosTeste);
    
    // Mapeamento dos campos do backend para os IDs dos radio buttons
    const checklistMapping = {
        'item1_protocolo_antigo': 'item1',
        'item2_reingresso_pendencias': 'item2',
        'item3_nome_apresentante': 'item3',
        'item4_certidoes_validade': 'item4',
        'item5_requisitos_art176': 'item5',
        'item6_dominialidade': 'item6',
        'item7_foreiro_rip': 'item7',
        'item8_onus_imovel': 'item8',
        'item9_autorizacao_cancelamento': 'item9',
        'item10_qualificacao_proprietarios': 'item10'
    };
    
    // Testar cada item
    Object.entries(checklistMapping).forEach(([backendField, itemName]) => {
        const value = dadosTeste.campos[backendField] || 'N/A';
        console.log(`🔍 Processando ${backendField}: ${value}`);
        
        // Verificar se os radio buttons existem
        const radioSim = document.getElementById(`${itemName}_sim`);
        const radioNao = document.getElementById(`${itemName}_nao`);
        const radioNa = document.getElementById(`${itemName}_na`);
        
        console.log(`📻 Radio buttons para ${itemName}:`, {
            sim: radioSim ? 'encontrado' : 'não encontrado',
            nao: radioNao ? 'encontrado' : 'não encontrado',
            na: radioNa ? 'encontrado' : 'não encontrado'
        });
        
        // Encontrar o radio button correto
        let radioButton = null;
        if (value === 'Sim') {
            radioButton = radioSim;
        } else if (value === 'Não') {
            radioButton = radioNao;
        } else if (value === 'N/A') {
            radioButton = radioNa;
        }
        
        if (radioButton) {
            radioButton.checked = true;
            console.log(`✅ ${backendField}: ${value} - Radio button marcado`);
        } else {
            console.log(`❌ Radio button não encontrado para ${itemName} com valor ${value}`);
        }
        
        // Testar justificativa
        const justificativaField = `justificativa_${backendField}`;
        const justificativa = dadosTeste.campos[justificativaField] || 'Justificativa não disponível';
        console.log(`📝 Justificativa para ${backendField}: ${justificativa}`);
    });
}

// Executar debug quando a página carregar
if (typeof window !== 'undefined') {
    window.debugFillChecklist = debugFillChecklist;
    console.log('🔧 Debug function disponível: window.debugFillChecklist()');
}

module.exports = { dadosTeste, debugFillChecklist }; 