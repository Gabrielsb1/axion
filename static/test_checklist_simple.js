// Função simples para testar marcação do checklist
function testUpdateChecklist(campos) {
    console.log('🧪 Testando marcação do checklist com:', Object.keys(campos));
    
    let itemsProcessados = 0;
    
    // Lista completa de todos os itens do checklist
    const checklistItems = [
        'item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7', 'item8', 'item9', 'item10', 'item11', 'item12', 'item13',
        'itemT1', 'itemT2', 'itemT3', 'itemT4', 'itemT5', 'itemT6', 'itemT7', 'itemT8', 'itemT9', 'itemT10', 'itemT11', 'itemT12', 'itemT13', 'itemT14', 'itemT15', 'itemT16', 'itemT17', 'itemT18', 'itemT19', 'itemT20', 'itemT21', 'itemT22', 'itemT23', 'itemT24', 'itemT25', 'itemT26', 'itemT27',
        'itemC1', 'itemC2', 'itemC3', 'itemC4', 'itemC5', 'itemC6', 'itemC7', 'itemC8', 'itemC9', 'itemC10', 'itemC11', 'itemC12', 'itemC13', 'itemC14', 'itemC15', 'itemC16', 'itemC17', 'itemC18', 'itemC19', 'itemC20', 'itemC21', 'itemC22',
        'itemR1', 'itemR2', 'itemR3', 'itemR4', 'itemR5', 'itemR6', 'itemR7', 'itemR8', 'itemR9', 'itemR10', 'itemR11', 'itemR12'
    ];
    
    checklistItems.forEach(itemId => {
        const value = campos[itemId];
        const justificativa = campos[`justificativa_${itemId}`];
        
        if (value) {
            console.log(`✅ Processando ${itemId}: ${value}`);
            
            // Atualizar radio buttons
            const radioSim = document.getElementById(`${itemId}_sim`);
            const radioNao = document.getElementById(`${itemId}_nao`);
            const radioNa = document.getElementById(`${itemId}_na`);
            
            if (radioSim && radioNao && radioNa) {
                radioSim.checked = value === 'Sim';
                radioNao.checked = value === 'Não';
                radioNa.checked = value === 'N/A';
                
                itemsProcessados++;
                console.log(`✅ ${itemId} marcado como: ${value}`);
            } else {
                console.log(`❌ Elementos não encontrados para ${itemId}`);
            }
            
            // Atualizar justificativa
            const justificativaElement = document.getElementById(`justificativa_${itemId}`);
            if (justificativaElement && justificativa) {
                justificativaElement.textContent = justificativa;
                console.log(`✅ Justificativa atualizada para ${itemId}`);
            }
        } else {
            console.log(`⚠️ Valor não encontrado para ${itemId}`);
        }
    });
    
    console.log(`🎯 Total de itens processados: ${itemsProcessados}`);
    return itemsProcessados;
}

// Função para testar com dados de exemplo
function testChecklistCompleto() {
    const testData = {
        "item1": "Sim",
        "justificativa_item1": "Protocolo antigo verificado e não há vínculos pendentes.",
        "item2": "Não",
        "justificativa_item2": "Reingresso detectado mas pendências não foram sanadas.",
        "item3": "Sim",
        "justificativa_item3": "Nome do apresentante está correto no protocolo.",
        "item4": "Sim",
        "justificativa_item4": "Título apresentado com certidões de inteiro teor e situação jurídica dentro do prazo de validade.",
        "item5": "Sim",
        "justificativa_item5": "Nova matrícula preenche requisitos do Art. 176, § 1º, inciso II da Lei 6.015/1973.",
        "item6": "N/A",
        "justificativa_item6": "Não se aplica - imóvel não é foreiro.",
        "item7": "N/A",
        "justificativa_item7": "Não se aplica - imóvel não é foreiro à União.",
        "item8": "Não",
        "justificativa_item8": "Incide ônus sobre o imóvel mas não foi apresentado termo de autorização.",
        "item9": "N/A",
        "justificativa_item9": "Não se aplica - não há ônus sobre o imóvel.",
        "item10": "Sim",
        "justificativa_item10": "Qualificação completa dos proprietários consta e já possuem cadastro nesta Serventia.",
        "item11": "Sim",
        "justificativa_item11": "Inscrição imobiliária consta na matrícula pertencente a esta Serventia.",
        "item12": "Sim",
        "justificativa_item12": "Inscrição imobiliária da matrícula é a mesma da certidão de ITBI apresentada.",
        "item13": "N/A",
        "justificativa_item13": "Não se aplica - não envolve matrícula-mãe e matrícula-filha.",
        "itemT1": "Sim",
        "justificativa_itemT1": "Todas as vias estão iguais e corretas.",
        "itemT2": "Sim",
        "justificativa_itemT2": "Todas as vias estão assinadas com data e local de emissão do contrato.",
        "itemT3": "Sim",
        "justificativa_itemT3": "Contrato contém descrição completa do imóvel e número da matrícula.",
        "itemT4": "Sim",
        "justificativa_itemT4": "Certidão de ITBI contém a mesma descrição do imóvel conforme contrato e matrícula.",
        "itemT5": "Sim",
        "justificativa_itemT5": "Valor base para ITBI é igual ao valor da transação do imóvel.",
        "itemT6": "Sim",
        "justificativa_itemT6": "Partes indicadas no ITBI são as mesmas do contrato.",
        "itemT7": "N/A",
        "justificativa_itemT7": "Não se aplica - não há termo de quitação.",
        "itemT8": "Sim",
        "justificativa_itemT8": "Transmitentes estão qualificados conforme art. 648, V do CNCGJ/MA.",
        "itemT9": "N/A",
        "justificativa_itemT9": "Não se aplica - não há declaração de 1ª aquisição.",
        "itemT10": "Não",
        "justificativa_itemT10": "Transmitentes são casados sob regime diverso do legal, necessita averbação.",
        "itemT11": "N/A",
        "justificativa_itemT11": "Não se aplica - não há representação por procurador.",
        "itemT12": "N/A",
        "justificativa_itemT12": "Não se aplica - não há pessoa jurídica.",
        "itemT13": "N/A",
        "justificativa_itemT13": "Não se aplica - transmitente não é pessoa jurídica.",
        "itemT14": "N/A",
        "justificativa_itemT14": "Não se aplica - não há contrato de mútuo ou CCB.",
        "itemT15": "N/A",
        "justificativa_itemT15": "Não se aplica - não há pessoa jurídica.",
        "itemT16": "N/A",
        "justificativa_itemT16": "Não se aplica - não há firma individual.",
        "itemT17": "N/A",
        "justificativa_itemT17": "Não se aplica - terreno não é foreiro à União.",
        "itemT18": "N/A",
        "justificativa_itemT18": "Não se aplica - terreno não é foreiro ao município.",
        "itemT19": "Sim",
        "justificativa_itemT19": "Contrato indica matrícula, descrição e inscrição imobiliária do imóvel.",
        "itemT20": "N/A",
        "justificativa_itemT20": "Não se aplica - não há credor fiduciário.",
        "itemT21": "Sim",
        "justificativa_itemT21": "Título contém requerimento genérico autorizando todos os atos necessários.",
        "itemT22": "N/A",
        "justificativa_itemT22": "Não se aplica - não há averbações necessárias.",
        "itemT23": "N/A",
        "justificativa_itemT23": "Não se aplica - não há consolidação de propriedade.",
        "itemT24": "Sim",
        "justificativa_itemT24": "Todos os documentos públicos foram conferidos e selos validados.",
        "itemT25": "Sim",
        "justificativa_itemT25": "Área foi transmitida no IMOB com proprietários corretos.",
        "itemT26": "Sim",
        "justificativa_itemT26": "Checklist do COAF foi preenchido.",
        "itemT27": "N/A",
        "justificativa_itemT27": "Não se aplica - orçamento não é necessário.",
        "itemC1": "Sim",
        "justificativa_itemC1": "Dominialidade, circunscrição e certidões foram verificadas.",
        "itemC2": "N/A",
        "justificativa_itemC2": "Não se aplica - não é reingresso.",
        "itemC3": "Sim",
        "justificativa_itemC3": "Descrição do imóvel está de acordo com as certidões apresentadas.",
        "itemC4": "Sim",
        "justificativa_itemC4": "Nome e qualificação dos proprietários estão em conformidade com as certidões.",
        "itemC5": "Sim",
        "justificativa_itemC5": "Todos os atos anteriores estão assinados.",
        "itemC6": "N/A",
        "justificativa_itemC6": "Não se aplica - não é abertura de matrícula.",
        "itemC7": "Sim",
        "justificativa_itemC7": "Ordem dos atos está correta e imóvel confere com a matrícula.",
        "itemC8": "Sim",
        "justificativa_itemC8": "Título traz informações completas sobre qualificação da pessoa física.",
        "itemC9": "N/A",
        "justificativa_itemC9": "Não se aplica - não há pessoa jurídica.",
        "itemC10": "N/A",
        "justificativa_itemC10": "Não se aplica - não há representação por procurador.",
        "itemC11": "N/A",
        "justificativa_itemC11": "Não se aplica - não há representação por sócio/gerente.",
        "itemC12": "Sim",
        "justificativa_itemC12": "Valores referentes à compra e venda estão corretos e bem formatados.",
        "itemC13": "Sim",
        "justificativa_itemC13": "Dados da inscrição imobiliária estão na matrícula e são os mesmos da certidão de ITBI.",
        "itemC14": "Sim",
        "justificativa_itemC14": "Todos os dados referentes ao ITBI foram conferidos.",
        "itemC15": "Sim",
        "justificativa_itemC15": "Título contém requerimento para proceder com averbações necessárias.",
        "itemC16": "Sim",
        "justificativa_itemC16": "Atos foram preenchidos corretamente no sistema.",
        "itemC17": "Sim",
        "justificativa_itemC17": "Partes foram cadastradas e atualizadas corretamente.",
        "itemC18": "Sim",
        "justificativa_itemC18": "Valores lançados para os atos estão corretos.",
        "itemC19": "Sim",
        "justificativa_itemC19": "COAF foi preenchido e assinado.",
        "itemC20": "Sim",
        "justificativa_itemC20": "Minutas lançadas condizem com os atos a serem praticados.",
        "itemC21": "Sim",
        "justificativa_itemC21": "Todas as partes assinaram o título.",
        "itemC22": "Sim",
        "justificativa_itemC22": "Kit está em conformidade com a ordem indicada.",
        "itemR1": "Sim",
        "justificativa_itemR1": "Toda documentação pertinente está anexada ao kit do protocolo.",
        "itemR2": "Sim",
        "justificativa_itemR2": "Nome do apresentante foi conferido em todos os protocolos.",
        "itemR3": "Sim",
        "justificativa_itemR3": "Valor total do protocolo está pago e será suficiente para o registro.",
        "itemR4": "Sim",
        "justificativa_itemR4": "Data de todos os atos foi atualizada e matrícula está definitiva.",
        "itemR5": "Sim",
        "justificativa_itemR5": "Serviços extras foram inseridos conforme necessário.",
        "itemR6": "Sim",
        "justificativa_itemR6": "Valores atribuídos aos atos e natureza jurídica estão corretos.",
        "itemR7": "Sim",
        "justificativa_itemR7": "Todos os selos foram requisitados e consultados no site do TJ.",
        "itemR8": "Sim",
        "justificativa_itemR8": "Numeração da matrícula e data foram alteradas no texto e selos inseridos.",
        "itemR9": "Sim",
        "justificativa_itemR9": "Conferência final da formatação foi realizada e correções aplicadas.",
        "itemR10": "Sim",
        "justificativa_itemR10": "Conferência final dos cadastros e distribuição da área foi realizada.",
        "itemR11": "Sim",
        "justificativa_itemR11": "Protocolo liberado para registro e cada ato foi registrado.",
        "itemR12": "Sim",
        "justificativa_itemR12": "Selos foram colados no título objeto do registro e kit carimbado."
    };
    
    return testUpdateChecklist(testData);
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.testUpdateChecklist = testUpdateChecklist;
    window.testChecklistCompleto = testChecklistCompleto;
    console.log('🧪 Funções de teste do checklist disponíveis globalmente');
} 