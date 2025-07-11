// qualificacao.js - Qualificação com Validação Jurídica (Checklist Completo)

// Configuração da UI para qualificação
const qualificacaoUI = {
    showAlert: function(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        const statusElement = document.getElementById('qualificacaoStatus');
        if (statusElement) {
            statusElement.innerHTML = `<div class="alert alert-${type}"><i class="fas fa-spinner fa-spin me-2"></i>${message}</div>`;
        }
    },
    
    updateStatus: function(message, type = 'info') {
        const statusElement = document.getElementById('qualificacaoStatus');
        if (statusElement) {
            statusElement.innerHTML = `<div class="alert alert-${type}"><i class="fas fa-info-circle me-2"></i>${message}</div>`;
        }
    },
    
    showProgress: function(show) {
        const progressElement = document.getElementById('qualificacaoProgress');
        if (progressElement) {
            progressElement.style.display = show ? 'block' : 'none';
        }
    },
    
    updateProgress: function(percent) {
        const progressBar = document.querySelector('#qualificacaoProgress .progress-bar');
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
            progressBar.setAttribute('aria-valuenow', percent);
        }
    }
};

// Função para processar arquivos para qualificação com validação jurídica
async function processQualificacao(files) {
    try {
        qualificacaoUI.showProgress(true);
        qualificacaoUI.updateProgress(10);
        qualificacaoUI.showAlert('Iniciando análise de qualificação com validação jurídica...', 'info');
        
        const formData = new FormData();
        for (let file of files) {
            formData.append('files[]', file);
        }
        
        // Obter modelo selecionado
        const model = document.querySelector('input[name="chatgptModel"]:checked')?.value || 'gpt-3.5-turbo';
        formData.append('model', model);
        
        qualificacaoUI.updateProgress(30);
        qualificacaoUI.showAlert('Enviando documentos para análise individual...', 'info');
        
        const response = await fetch('/api/qualificacao', {
            method: 'POST',
            body: formData
        });
        
        qualificacaoUI.updateProgress(60);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro na comunicação com o servidor');
        }
        
        const data = await response.json();
        qualificacaoUI.updateProgress(90);
        
        if (data.success) {
            qualificacaoUI.showAlert('Análise de qualificação concluída com sucesso!', 'success');
            // Aguardar um pouco para garantir que o DOM está pronto
            setTimeout(() => {
                displayQualificacaoResults(data);
                window.currentQualificacaoData = data;
            }, 100);
        } else {
            throw new Error(data.error || 'Erro desconhecido');
        }
        
        qualificacaoUI.updateProgress(100);
        setTimeout(() => qualificacaoUI.showProgress(false), 1000);
        
    } catch (error) {
        console.error('Erro na qualificação:', error);
        qualificacaoUI.showAlert(`Erro: ${error.message}`, 'danger');
        qualificacaoUI.showProgress(false);
    }
}

// Função para exibir resultados da qualificação
function displayQualificacaoResults(data) {
    console.log('📊 Dados recebidos:', data);
    
    if (!data.campos) {
        qualificacaoUI.showAlert('Nenhum dado de qualificação encontrado', 'warning');
        return;
    }
    
    const campos = data.campos;
    console.log('📋 Campos extraídos:', Object.keys(campos));
    
    // Atualizar checklist de validação
    updateChecklistValidacao(campos);
    
    // Exibir documentos analisados
    displayDocumentosAnalisados(data.documentos_analisados);
    
    // Mostrar análise completa se disponível
    if (campos.analise_completa) {
        qualificacaoUI.updateStatus('Análise concluída. Verifique os resultados no checklist.', 'success');
    }
}

// Função para atualizar checklist de validação
function updateChecklistValidacao(campos) {
    console.log('🔄 Atualizando checklist com campos:', Object.keys(campos));
    
    // Verificar se o DOM está pronto
    if (document.readyState !== 'complete') {
        console.log('⏳ DOM não está pronto, aguardando...');
        setTimeout(() => updateChecklistValidacao(campos), 100);
        return;
    }
    
    // Verificar se estamos na aba de qualificação
    const qualificacaoTab = document.getElementById('qualificacao');
    console.log('🔍 Status da aba qualificação:', {
        existe: !!qualificacaoTab,
        classes: qualificacaoTab ? qualificacaoTab.className : 'não existe',
        visivel: qualificacaoTab ? qualificacaoTab.style.display : 'não existe'
    });
    
    if (!qualificacaoTab) {
        console.log('❌ Aba de qualificação não encontrada');
        return;
    }
    
    // Garantir que a aba de qualificação esteja ativa
    const qualificacaoTabButton = document.getElementById('qualificacao-tab');
    if (qualificacaoTabButton) {
        // Simular clique na aba se não estiver ativa
        if (!qualificacaoTab.classList.contains('active') && !qualificacaoTab.classList.contains('show')) {
            console.log('🔄 Ativando aba de qualificação...');
            qualificacaoTabButton.click();
            // Aguardar um pouco para o DOM atualizar
            setTimeout(() => {
                updateChecklistValidacaoInternal(campos);
            }, 500);
            return;
        }
    }
    
    // Aguardar um pouco para garantir que tudo esteja carregado
    setTimeout(() => {
        updateChecklistValidacaoInternal(campos);
    }, 200);
}

function updateChecklistValidacaoInternal(campos) {
    
    // Verificar se estamos na aba correta
    const qualificacaoTab = document.getElementById('qualificacao');
    if (!qualificacaoTab) {
        console.log('❌ Aba de qualificação não encontrada no DOM');
        return;
    }
    
    // Verificar se a aba está visível
    const isVisible = qualificacaoTab.classList.contains('active') || qualificacaoTab.classList.contains('show');
    console.log('🔍 Status da aba qualificação:', {
        existe: !!qualificacaoTab,
        classes: qualificacaoTab.className,
        visivel: isVisible,
        display: qualificacaoTab.style.display
    });
    
    if (!isVisible) {
        console.log('⚠️ Aba de qualificação não está visível, tentando ativar...');
        // Tentar ativar a aba
        const tabButton = document.getElementById('qualificacao-tab');
        if (tabButton) {
            tabButton.click();
            setTimeout(() => updateChecklistValidacaoInternal(campos), 500);
            return;
        }
    }
    
    // Aguardar um pouco para garantir que o DOM esteja pronto
    setTimeout(() => {
        updateChecklistValidacaoInternalDelayed(campos);
    }, 300);
}

function updateChecklistValidacaoInternalDelayed(campos) {
    
    // Lista completa de todos os itens do checklist
    const checklistItems = [
        // PRENOTAÇÃO (MATRÍCULA) - 13 itens
        'item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7', 'item8', 'item9', 'item10', 'item11', 'item12', 'item13',
        
        // TÍTULO - 27 itens
        'itemT1', 'itemT2', 'itemT3', 'itemT4', 'itemT5', 'itemT6', 'itemT7', 'itemT8', 'itemT9', 'itemT10', 'itemT11', 'itemT12', 'itemT13',
        'itemT14', 'itemT15', 'itemT16', 'itemT17', 'itemT18', 'itemT19', 'itemT20', 'itemT21', 'itemT22', 'itemT23', 'itemT24', 'itemT25', 'itemT26', 'itemT27',
        
        // CONFERÊNCIA - 22 itens
        'itemC1', 'itemC2', 'itemC3', 'itemC4', 'itemC5', 'itemC6', 'itemC7', 'itemC8', 'itemC9', 'itemC10', 'itemC11', 'itemC12', 'itemC13',
        'itemC14', 'itemC15', 'itemC16', 'itemC17', 'itemC18', 'itemC19', 'itemC20', 'itemC21', 'itemC22',
        
        // REGISTRO - 12 itens
        'itemR1', 'itemR2', 'itemR3', 'itemR4', 'itemR5', 'itemR6', 'itemR7', 'itemR8', 'itemR9', 'itemR10', 'itemR11', 'itemR12'
    ];
    
    let itemsProcessados = 0;
    let itemsNaoEncontrados = 0;
    
    checklistItems.forEach((item) => {
        const value = campos[item] || 'N/A';
        
        // Determinar o tipo de item baseado no prefixo
        let itemId, itemNumber;
        if (item.startsWith('itemT')) {
            // Item TÍTULO
            itemNumber = item.replace('itemT', '');
            itemId = `itemT${itemNumber}`;
        } else if (item.startsWith('itemC')) {
            // Item CONFERÊNCIA
            itemNumber = item.replace('itemC', '');
            itemId = `itemC${itemNumber}`;
        } else if (item.startsWith('itemR')) {
            // Item REGISTRO
            itemNumber = item.replace('itemR', '');
            itemId = `itemR${itemNumber}`;
        } else {
            // Item MATRÍCULA (padrão)
            itemNumber = item.replace('item', '');
            itemId = `item${itemNumber}`;
        }
        
        // Atualizar radio buttons - tentar múltiplas abordagens
        let radioSim = document.getElementById(`${itemId}_sim`);
        let radioNao = document.getElementById(`${itemId}_nao`);
        let radioNa = document.getElementById(`${itemId}_na`);
        
        // Se não encontrou, tentar buscar dentro da aba de qualificação
        if (!radioSim || !radioNao || !radioNa) {
            const qualificacaoTab = document.getElementById('qualificacao');
            if (qualificacaoTab) {
                radioSim = qualificacaoTab.querySelector(`#${itemId}_sim`);
                radioNao = qualificacaoTab.querySelector(`#${itemId}_nao`);
                radioNa = qualificacaoTab.querySelector(`#${itemId}_na`);
            }
        }
        
        // Se ainda não encontrou, tentar buscar por name
        if (!radioSim || !radioNao || !radioNa) {
            const qualificacaoTab = document.getElementById('qualificacao');
            if (qualificacaoTab) {
                const radios = qualificacaoTab.querySelectorAll(`input[name="${itemId}"]`);
                radioSim = Array.from(radios).find(r => r.value === 'sim');
                radioNao = Array.from(radios).find(r => r.value === 'nao');
                radioNa = Array.from(radios).find(r => r.value === 'na');
            }
        }
        
        // Se ainda não encontrou, tentar buscar por name sem o prefixo
        if (!radioSim || !radioNao || !radioNa) {
            const qualificacaoTab = document.getElementById('qualificacao');
            if (qualificacaoTab) {
                // Tentar com diferentes variações do name
                const nameVariations = [
                    itemId,
                    itemId.replace('item', ''),
                    itemId.replace('itemT', 'itemT'),
                    itemId.replace('itemC', 'itemC'),
                    itemId.replace('itemR', 'itemR')
                ];
                
                for (const nameVar of nameVariations) {
                    const radios = qualificacaoTab.querySelectorAll(`input[name="${nameVar}"]`);
                    if (radios.length > 0) {
                        radioSim = Array.from(radios).find(r => r.value === 'sim');
                        radioNao = Array.from(radios).find(r => r.value === 'nao');
                        radioNa = Array.from(radios).find(r => r.value === 'na');
                        if (radioSim && radioNao && radioNa) break;
                    }
                }
            }
        }
        
        // Última tentativa: buscar em todo o documento
        if (!radioSim || !radioNao || !radioNa) {
            const allRadios = document.querySelectorAll('input[type="radio"]');
            const matchingRadios = Array.from(allRadios).filter(radio => 
                radio.id && radio.id.startsWith(itemId)
            );
            
            if (matchingRadios.length >= 3) {
                radioSim = matchingRadios.find(r => r.id.endsWith('_sim'));
                radioNao = matchingRadios.find(r => r.id.endsWith('_nao'));
                radioNa = matchingRadios.find(r => r.id.endsWith('_na'));
            }
        }
        
        console.log(`🔍 Procurando elementos para ${itemId}:`, {
            sim: radioSim ? 'encontrado' : 'não encontrado',
            nao: radioNao ? 'encontrado' : 'não encontrado',
            na: radioNa ? 'encontrado' : 'não encontrado'
        });
        
        if (radioSim && radioNao && radioNa) {
            radioSim.checked = value === 'Sim';
            radioNao.checked = value === 'Não';
            radioNa.checked = value === 'N/A';
            
            // Habilitar os radio buttons
            radioSim.disabled = false;
            radioNao.disabled = false;
            radioNa.disabled = false;
            
            itemsProcessados++;
            console.log(`✅ Item ${itemId} atualizado: ${value}`);
        } else {
            itemsNaoEncontrados++;
            console.log(`❌ Elementos não encontrados para item ${itemId}`);
            
            // Debug adicional - verificar se o elemento existe no DOM
            const allRadios = document.querySelectorAll('input[type="radio"]');
            const matchingRadios = Array.from(allRadios).filter(radio => 
                radio.id && radio.id.startsWith(itemId)
            );
            console.log(`🔍 Debug: ${matchingRadios.length} elementos encontrados com prefixo ${itemId}:`, 
                matchingRadios.map(r => r.id));
        }
        
        // Atualizar justificativa
        const justificativaField = `justificativa_${item}`;
        const justificativa = campos[justificativaField] || 'Justificativa não disponível';
        const justificativaElement = document.getElementById(`justificativa_${itemId}`);
        if (justificativaElement) {
            justificativaElement.textContent = justificativa;
            console.log(`📝 Justificativa ${itemId}: ${justificativa.substring(0, 50)}...`);
        }
    });
    
    console.log(`📊 Resumo: ${itemsProcessados} itens processados, ${itemsNaoEncontrados} não encontrados`);
    
    // Mostrar análise final se disponível
    if (campos.analise_completa) {
        qualificacaoUI.updateStatus('Análise completa concluída. Verifique os resultados no checklist.', 'success');
    }
    
    // Mostrar status da validação
    if (campos.status_validacao) {
        const status = campos.status_validacao.toLowerCase();
        const statusClass = status === 'aprovado' ? 'success' : status === 'pendente' ? 'warning' : 'danger';
        qualificacaoUI.updateStatus(`Status da validação: ${campos.status_validacao}`, statusClass);
    }
    
    // Mostrar pontuação se disponível
    if (campos.pontuacao_validacao) {
        console.log(`📊 Pontuação da validação: ${campos.pontuacao_validacao}/100`);
    }
}

// Função para exibir documentos analisados
function displayDocumentosAnalisados(documentos) {
    const container = document.getElementById('documentosEnviados');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!documentos || documentos.length === 0) {
        container.innerHTML = '<p class="text-muted">Nenhum documento analisado</p>';
        return;
    }
    
    documentos.forEach((doc, index) => {
        const docCard = document.createElement('div');
        docCard.className = 'col-md-6 mb-2';
        
        const status = doc.error ? 'danger' : 'success';
        const icon = doc.error ? 'fa-exclamation-triangle' : 'fa-check-circle';
        
        docCard.innerHTML = `
            <div class="card border-${status}">
                <div class="card-body p-2">
                    <div class="d-flex align-items-center">
                        <i class="fas ${icon} text-${status} me-2"></i>
                        <div class="flex-grow-1">
                            <small class="fw-bold">${doc.filename}</small>
                            <br>
                            <small class="text-muted">
                                ${doc.error ? doc.error : `${doc.text_length} caracteres extraídos`}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(docCard);
    });
}

// Função para gerar nota devolutiva
function generateNotaDevolutiva() {
    if (!window.currentQualificacaoData || !window.currentQualificacaoData.campos) {
        qualificacaoUI.showAlert('Nenhum dado de qualificação disponível para gerar nota devolutiva', 'warning');
        return;
    }
    
    const campos = window.currentQualificacaoData.campos;
    const status = campos.status_validacao || 'pendente';
    
    if (status === 'aprovado') {
        qualificacaoUI.showAlert('Documentação aprovada! Não é necessária nota devolutiva.', 'success');
        return;
    }
    
    // Gerar conteúdo da nota devolutiva
    let notaContent = `NOTA DEVOLUTIVA - VALIDAÇÃO JURÍDICA\n`;
    notaContent += `Data: ${new Date().toLocaleDateString('pt-BR')}\n`;
    notaContent += `Status: ${status.toUpperCase()}\n\n`;
    
    notaContent += `FUNDAMENTAÇÃO LEGAL:\n`;
    notaContent += `${campos.fundamento_legal || 'Fundamento legal não especificado'}\n\n`;
    
    notaContent += `PROBLEMAS IDENTIFICADOS:\n`;
    notaContent += `${campos.problemas_identificados || 'Nenhum problema específico identificado'}\n\n`;
    
    notaContent += `RECOMENDAÇÕES:\n`;
    notaContent += `${campos.recomendacoes_especificas || 'Nenhuma recomendação específica'}\n\n`;
    
    notaContent += `OBSERVAÇÕES:\n`;
    notaContent += `${campos.observacoes_recomendacoes || 'Nenhuma observação adicional'}\n\n`;
    
    // Criar e baixar arquivo
    const blob = new Blob([notaContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nota_devolutiva_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    qualificacaoUI.showAlert('Nota devolutiva gerada e baixada com sucesso!', 'success');
}

// Função para configurar event listeners da qualificação
function setupQualificacaoEventListeners() {
    console.log('🚀 Configurando event listeners da qualificação...');
    
    // File input para qualificação
    const fileInputQualificacao = document.getElementById('fileInputQualificacao');
    if (fileInputQualificacao) {
        const newFileInput = fileInputQualificacao.cloneNode(true);
        fileInputQualificacao.parentNode.replaceChild(newFileInput, fileInputQualificacao);
        
        newFileInput.addEventListener('change', (event) => {
            const files = event.target.files;
            const processButton = document.getElementById('processFileQualificacao');
            
            if (files && files.length > 0) {
                processButton.disabled = false;
                console.log(`${files.length} arquivo(s) selecionado(s) para qualificação`);
            } else {
                processButton.disabled = true;
            }
        });
        console.log('✅ File input qualificação configurado');
    }
    
    // Process button para qualificação
    const processButtonQualificacao = document.getElementById('processFileQualificacao');
    if (processButtonQualificacao) {
        const newProcessButton = processButtonQualificacao.cloneNode(true);
        processButtonQualificacao.parentNode.replaceChild(newProcessButton, processButtonQualificacao);
        
        newProcessButton.addEventListener('click', async () => {
            const fileInput = document.getElementById('fileInputQualificacao');
            const files = fileInput.files;
            
            if (!files || files.length === 0) {
                qualificacaoUI.showAlert('Nenhum arquivo selecionado!', 'warning');
                return;
            }
            
            const filesArray = Array.from(files);
            await processQualificacao(filesArray);
        });
        console.log('✅ Process button qualificação configurado');
    }
    
    // Download buttons para qualificação
    const downloadButtons = [
        { id: 'downloadWordQualificacao', func: downloadWordQualificacao },
        { id: 'downloadPDFQualificacao', func: downloadPDFQualificacao },
        { id: 'downloadJSONQualificacao', func: downloadJSONQualificacao },
        { id: 'generateNotaDevolutiva', func: generateNotaDevolutiva }
    ];
    
    downloadButtons.forEach(button => {
        const element = document.getElementById(button.id);
        if (element) {
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
            
            newElement.addEventListener('click', () => button.func());
            console.log(`✅ Download button ${button.id} configurado para qualificação`);
        }
    });
}

// Funções de download específicas para qualificação
function downloadWordQualificacao() {
    if (!window.currentQualificacaoData) {
        qualificacaoUI.showAlert('Nenhum dado disponível para download', 'warning');
        return;
    }
    
    const content = formatQualificacaoDataForDownload(window.currentQualificacaoData);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qualificacao_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    qualificacaoUI.showAlert('Relatório de qualificação baixado com sucesso!', 'success');
}

function downloadPDFQualificacao() {
    if (!window.currentQualificacaoData) {
        qualificacaoUI.showAlert('Nenhum dado disponível para download', 'warning');
        return;
    }

    try {
        const doc = new window.jspdf.jsPDF();
        const content = formatQualificacaoDataForDownload(window.currentQualificacaoData);
        const lines = doc.splitTextToSize(content, 180);
        doc.text(lines, 10, 10);
        doc.save(`qualificacao_${new Date().toISOString().slice(0, 10)}.pdf`);
        qualificacaoUI.showAlert('PDF de qualificação baixado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        qualificacaoUI.showAlert('Erro ao gerar PDF. Verifique se a biblioteca jsPDF está carregada.', 'error');
    }
}

function downloadJSONQualificacao() {
    if (!window.currentQualificacaoData) {
        qualificacaoUI.showAlert('Nenhum dado disponível para download', 'warning');
        return;
    }
    
    const jsonData = {
        metadata: {
            extractedAt: new Date().toISOString(),
            service: 'qualificacao_validacao_juridica'
        },
        data: window.currentQualificacaoData
    };
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qualificacao_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    qualificacaoUI.showAlert('JSON de qualificação baixado com sucesso!', 'success');
}

// Função para formatar dados de qualificação para download
function formatQualificacaoDataForDownload(data) {
    let content = 'RELATÓRIO DE QUALIFICAÇÃO - VALIDAÇÃO JURÍDICA (CHECKLIST COMPLETO)\n';
    content += '='.repeat(70) + '\n\n';
    
    if (data.campos) {
        const campos = data.campos;
        
        content += 'STATUS DA VALIDAÇÃO:\n';
        content += `Status: ${campos.status_validacao || 'Não informado'}\n`;
        content += `Pontuação: ${campos.pontuacao_validacao || '0'}/100\n\n`;
        
        content += 'CHECKLIST COMPLETO:\n';
        content += 'PRENOTAÇÃO:\n';
        content += '1. Protocolo antigo: ' + (campos.item1_protocolo_antigo || 'N/A') + '\n';
        content += '2. Reingresso com pendências: ' + (campos.item2_reingresso_pendencias || 'N/A') + '\n';
        content += '3. Nome do apresentante: ' + (campos.item3_nome_apresentante || 'N/A') + '\n\n';
        
        content += 'MATRÍCULA:\n';
        content += '4. Certidões com validade: ' + (campos.item4_certidoes_validade || 'N/A') + '\n';
        content += '5. Requisitos Art. 176: ' + (campos.item5_requisitos_art176 || 'N/A') + '\n';
        content += '6. Dominialidade: ' + (campos.item6_dominialidade || 'N/A') + '\n';
        content += '7. Foreiro/RIP: ' + (campos.item7_foreiro_rip || 'N/A') + '\n';
        content += '8. Ônus sobre imóvel: ' + (campos.item8_onus_imovel || 'N/A') + '\n';
        content += '9. Autorização cancelamento: ' + (campos.item9_autorizacao_cancelamento || 'N/A') + '\n';
        content += '10. Qualificação proprietários: ' + (campos.item10_qualificacao_proprietarios || 'N/A') + '\n\n';
        
        content += 'JUSTIFICATIVAS:\n';
        for (let i = 1; i <= 10; i++) {
            const justificativa = campos[`justificativa_item${i}`] || 'Justificativa não disponível';
            content += `Item ${i}: ${justificativa}\n`;
        }
        content += '\n';
        
        content += 'ANÁLISE COMPLETA:\n';
        content += (campos.analise_completa || 'Análise não disponível') + '\n\n';
        
        content += 'OBSERVAÇÕES E RECOMENDAÇÕES:\n';
        content += (campos.observacoes_recomendacoes || 'Nenhuma observação') + '\n\n';
        
        content += 'PROBLEMAS IDENTIFICADOS:\n';
        content += (campos.problemas_identificados || 'Nenhum problema identificado') + '\n\n';
        
        content += 'RECOMENDAÇÕES ESPECÍFICAS:\n';
        content += (campos.recomendacoes_especificas || 'Nenhuma recomendação específica') + '\n\n';
        
        content += 'FUNDAMENTO LEGAL:\n';
        content += (campos.fundamento_legal || 'Fundamento legal não especificado') + '\n\n';
    }
    
    return content;
}

// Exportar funções para uso global
if (typeof window !== 'undefined') {
    window.processQualificacao = processQualificacao;
    window.displayQualificacaoResults = displayQualificacaoResults;
    window.setupQualificacaoEventListeners = setupQualificacaoEventListeners;
    window.generateNotaDevolutiva = generateNotaDevolutiva;
    window.updateChecklistValidacao = updateChecklistValidacao;
    window.updateChecklistValidacaoInternal = updateChecklistValidacaoInternal;
    window.updateChecklistValidacaoInternalDelayed = updateChecklistValidacaoInternalDelayed;
    console.log('🔧 Funções de qualificação disponíveis globalmente');
}

export { 
    processQualificacao, 
    displayQualificacaoResults, 
    setupQualificacaoEventListeners,
    generateNotaDevolutiva,
    updateChecklistValidacao,
    updateChecklistValidacaoInternal,
    updateChecklistValidacaoInternalDelayed,
    qualificacaoUI 
}; 