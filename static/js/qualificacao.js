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
        
        // Sempre usar gpt-4o como modelo
        formData.append('model', 'gpt-4o');
        
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
    
    // Verificar se é análise avançada (nova lógica)
    if (data.analise_avancada && campos.documents_analyzed) {
        console.log('🔍 Processando análise avançada...');
        processAdvancedAnalysisResults(campos);
    } else {
        // Processamento tradicional
    updateChecklistValidacao(campos);
    }
    
    // Exibir documentos analisados
    if (data.documentos_analisados) {
    displayDocumentosAnalisados(data.documentos_analisados);
    }
    
    // Mostrar análise completa se disponível
    if (campos.analise_completa) {
        qualificacaoUI.updateStatus('Análise concluída. Verifique os resultados no checklist.', 'success');
    }
}

// Função para processar resultados da análise avançada
function processAdvancedAnalysisResults(campos) {
    console.log('🔍 Processando análise avançada...');
    
    if (!campos.documents_analyzed || !Array.isArray(campos.documents_analyzed)) {
        console.log('❌ Dados de análise avançada inválidos');
        return;
    }
    
    // Exibir classificação dos documentos com opção de correção
    displayDocumentClassification(campos.documents_analyzed);
    
    // Verificar se há análise do checklist
    if (campos.checklist_analysis && typeof campos.checklist_analysis === 'object') {
        console.log('📋 Processando análise do checklist...');
        
        // Verificar se há erro na análise do checklist
        if (campos.checklist_analysis.error) {
            console.error('❌ Erro na análise do checklist:', campos.checklist_analysis.error);
            qualificacaoUI.showAlert(`Erro na análise do checklist: ${campos.checklist_analysis.error}`, 'danger');
            return;
        }
        
        // Processar resultados do checklist
        const checklistResults = {};
        
        Object.keys(campos.checklist_analysis).forEach(itemKey => {
            const itemData = campos.checklist_analysis[itemKey];
            if (itemData && typeof itemData === 'object') {
                const resposta = itemData.resposta || 'N/A';
                const justificativa = itemData.justificativa || 'Justificativa não disponível';
                
                // Mapear resposta para o formato esperado pelo frontend
                let respostaMapeada = 'N/A';
                if (resposta === 'SIM') respostaMapeada = 'Sim';
                else if (resposta === 'NÃO') respostaMapeada = 'Não';
                else if (resposta === 'N.A.') respostaMapeada = 'N/A';
                
                // Processar justificativa para destacar referências aos documentos
                const justificativaProcessada = processJustificativaWithDocumentReferences(justificativa, 'Todos os documentos');
                
                // Adicionar ao resultado
                checklistResults[itemKey] = respostaMapeada;
                checklistResults[`justificativa_${itemKey}`] = justificativaProcessada;
                
                console.log(`✅ ${itemKey}: ${resposta} → ${respostaMapeada} - ${justificativaProcessada.substring(0, 50)}...`);
            }
        });
        
        // Debug: mostrar resultados do checklist
        console.log('📊 Resultados do checklist:', checklistResults);
        console.log('📋 Chaves disponíveis:', Object.keys(checklistResults));
        
        // Atualizar checklist com resultados
        updateChecklistValidacao(checklistResults);
        
    } else {
        console.log('⚠️ Nenhuma análise do checklist encontrada, processando dados individuais...');
        
        // Fallback: processar dados individuais dos documentos
        const consolidatedResults = {};
        
        campos.documents_analyzed.forEach((doc, index) => {
            console.log(`📄 Processando documento ${index + 1}: ${doc.filename} (${doc.document_type})`);
            
            if (doc.document_data && typeof doc.document_data === 'object') {
                // Verificar se há erro nos dados do documento
                if (doc.document_data.error) {
                    console.error(`❌ Erro nos dados do documento ${doc.filename}:`, doc.document_data.error);
                } else {
                    console.log(`✅ Dados extraídos de ${doc.filename}:`, Object.keys(doc.document_data));
                    
                    // Aqui você pode processar dados específicos de cada documento
                    // Por exemplo, extrair informações relevantes para o checklist
                    processDocumentDataForChecklist(doc.document_data, doc.document_type, consolidatedResults);
                }
            } else {
                console.warn(`⚠️ Dados inválidos para documento ${doc.filename}:`, doc.document_data);
            }
        });
        
        // Se não há dados suficientes, mostrar mensagem
        if (Object.keys(consolidatedResults).length === 0) {
            qualificacaoUI.showAlert('Nenhum dado relevante encontrado para preencher o checklist automaticamente. Use o botão "Editar" para preenchimento manual.', 'warning');
        }
    }
    
    // Desabilitar radio buttons após análise (eles serão habilitados apenas no modo de edição)
    disableAllChecklistRadios();
    
    // Mostrar botão de edição após análise
    showEditButton();
    
    // Mostrar resumo da análise
    if (campos.summary) {
        const summary = campos.summary;
        const totalDocs = campos.total_documents || 0;
        qualificacaoUI.updateStatus(
            `Análise técnica concluída: ${totalDocs} documentos processados. ` +
            `Matrículas: ${summary.matriculas}, Contratos: ${summary.contratos}, ` +
            `ITBIs: ${summary.itbis}, Certidões: ${summary.certidoes}, ` +
            `Procurações: ${summary.procuracoes}`, 
            'success'
        );
    }
}

// Função para processar dados específicos de cada documento para o checklist
function processDocumentDataForChecklist(documentData, documentType, consolidatedResults) {
    console.log(`🔍 Processando dados de ${documentType} para checklist...`);
    
    // Mapeamento de dados específicos para itens do checklist
    const dataToChecklistMapping = {
        'MATRÍCULA': {
            'numero_matricula': ['item1', 'item2', 'item8'],
            'inscricao_imobiliaria': ['item8', 'item9'],
            'proprietarios_atuais': ['item7'],
            'onus_ativos': ['item5', 'item6'],
            'tipo_dominialidade': ['item3', 'item4'],
            'certidoes_presentes': ['item1']
        },
        'CONTRATO': {
            'valor_contrato': ['itemT5'],
            'comprador_nome': ['itemT6', 'itemT8'],
            'vendedor_nome': ['itemT6', 'itemT8'],
            'matricula_imovel': ['itemT3', 'itemT19'],
            'descricao_imovel_contrato': ['itemT3', 'itemT4'],
            'data_contrato': ['itemT2'],
            'local_contrato': ['itemT2']
        },
        'ITBI': {
            'valor_base': ['itemT5'],
            'adquirente_nome': ['itemT6'],
            'transmitente_nome': ['itemT6'],
            'descricao_imovel_itbi': ['itemT4'],
            'matricula_imovel': ['itemT4']
        }
    };
    
    const mapping = dataToChecklistMapping[documentType];
    if (!mapping) {
        console.log(`⚠️ Nenhum mapeamento encontrado para ${documentType}`);
        return;
    }
    
    // Processar cada campo de dados
    Object.keys(documentData).forEach(dataKey => {
        const value = documentData[dataKey];
        const checklistItems = mapping[dataKey];
        
        if (value && checklistItems) {
            console.log(`✅ ${dataKey}: "${value}" → ${checklistItems.join(', ')}`);
            
            // Adicionar dados relevantes aos resultados consolidados
            checklistItems.forEach(itemKey => {
                if (!consolidatedResults[itemKey]) {
                    consolidatedResults[itemKey] = 'N/A';
                    consolidatedResults[`justificativa_${itemKey}`] = `Dados extraídos de ${documentType}: ${dataKey} = ${value}`;
                }
            });
        }
    });
}

// Função para processar justificativa destacando referências aos documentos
function processJustificativaWithDocumentReferences(justificativa, currentDocument) {
    if (!justificativa) return justificativa;
    
    // Procurar por padrões de referência a documentos na justificativa
    const documentPatterns = [
        /\[Documentos utilizados: ([^\]]+)\]/gi,
        /\[Documento (\d+): ([^)]+)\]/gi,
        /Documento (\d+) \(([^)]+)\)/gi,
        /Documento (\d+): ([^\s,]+)/gi
    ];
    
    let processedJustificativa = justificativa;
    
    // Destacar referências aos documentos
    documentPatterns.forEach(pattern => {
        processedJustificativa = processedJustificativa.replace(pattern, (match, ...args) => {
            if (args.length >= 2) {
                const docNumber = args[0];
                const docName = args[1];
                return `<span class="badge bg-info me-1" title="Documento ${docNumber}: ${docName}">📄 Doc ${docNumber}</span>`;
            } else if (args.length === 1) {
                const docInfo = args[0];
                return `<span class="badge bg-info me-1" title="${docInfo}">📄 ${docInfo}</span>`;
            }
            return match;
        });
    });
    
    // Adicionar informação sobre o documento atual se não estiver presente
    if (!processedJustificativa.includes('📄')) {
        processedJustificativa += ` <span class="badge bg-primary me-1" title="Documento analisado">📋 ${currentDocument}</span>`;
    }
    
    return processedJustificativa;
}

// Função para exibir classificação dos documentos com opção de correção
function displayDocumentClassification(documents) {
    const container = document.getElementById('documentosEnviados');
    if (!container) {
        console.log('❌ Container de documentos não encontrado');
        return;
    }
    
    container.innerHTML = '';
    
    documents.forEach((doc, index) => {
        const docCard = document.createElement('div');
        docCard.className = 'col-md-6 col-lg-4 mb-3';
        
        const documentType = doc.document_type || 'DESCONHECIDO';
        const filename = doc.filename || `Documento ${index + 1}`;
        
        // Definir cor baseada no tipo de documento
        let badgeClass = 'bg-secondary';
        switch (documentType) {
            case 'MATRÍCULA':
                badgeClass = 'bg-primary';
                break;
            case 'CONTRATO':
                badgeClass = 'bg-success';
                break;
            case 'ITBI':
                badgeClass = 'bg-info';
                break;
            case 'CERTIDÃO':
                badgeClass = 'bg-warning';
                break;
            case 'PROCURAÇÃO':
                badgeClass = 'bg-danger';
                break;
        }
        
        docCard.innerHTML = `
            <div class="card h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">
                        <i class="fas fa-file-pdf me-2"></i>
                        ${filename}
                    </h6>
                    <span class="badge ${badgeClass}">${documentType}</span>
                </div>
                <div class="card-body">
                    <div class="mb-2">
                        <small class="text-muted">
                            <i class="fas fa-info-circle me-1"></i>
                            Documento ${index + 1} de ${documents.length}
                        </small>
                    </div>
                    <div class="mb-2">
                        <small class="text-muted">
                            <i class="fas fa-file-text me-1"></i>
                            ${doc.text_length || 0} caracteres extraídos
                        </small>
                    </div>
                    <div class="alert alert-info small">
                        <i class="fas fa-robot me-1"></i>
                        <strong>Classificação IA:</strong> ${documentType}
                    </div>
                    
                    <!-- Opção de correção manual -->
                    <div class="mt-3">
                        <label class="form-label small fw-bold">
                            <i class="fas fa-edit me-1"></i>Corrigir Classificação:
                        </label>
                        <select class="form-select form-select-sm document-type-selector" 
                                id="correction_${index}" 
                                data-document-index="${index}"
                                data-original-type="${documentType}">
                            <option value="MATRÍCULA" ${documentType === 'MATRÍCULA' ? 'selected' : ''}>Matrícula</option>
                            <option value="CONTRATO" ${documentType === 'CONTRATO' ? 'selected' : ''}>Contrato</option>
                            <option value="ITBI" ${documentType === 'ITBI' ? 'selected' : ''}>ITBI</option>
                            <option value="CERTIDÃO" ${documentType === 'CERTIDÃO' ? 'selected' : ''}>Certidão</option>
                            <option value="PROCURAÇÃO" ${documentType === 'PROCURAÇÃO' ? 'selected' : ''}>Procuração</option>
                            <option value="DESCONHECIDO" ${documentType === 'DESCONHECIDO' ? 'selected' : ''}>Desconhecido</option>
                        </select>
                    </div>
                    
                    <!-- Indicador de mudança -->
                    <div id="change_indicator_${index}" class="mt-2" style="display: none;">
                        <small class="text-warning">
                            <i class="fas fa-exclamation-triangle me-1"></i>
                            Classificação alterada
                        </small>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(docCard);
        
        // Adicionar listener para detectar mudanças
        const selectElement = docCard.querySelector(`#correction_${index}`);
        const changeIndicator = docCard.querySelector(`#change_indicator_${index}`);
        
        selectElement.addEventListener('change', function() {
            const originalType = this.getAttribute('data-original-type');
            const newType = this.value;
            
            if (newType !== originalType) {
                changeIndicator.style.display = 'block';
                console.log(`🔄 Documento ${index + 1}: ${originalType} → ${newType}`);
                
                // Atualizar dados globais
                if (window.currentQualificacaoData && window.currentQualificacaoData.campos) {
                    const documents = window.currentQualificacaoData.campos.documents_analyzed;
                    if (documents && documents[index]) {
                        documents[index].document_type = newType;
                        console.log(`✅ Tipo atualizado no documento ${index}: ${newType}`);
                    }
                }
            } else {
                changeIndicator.style.display = 'none';
            }
        });
    });
    
    // Adicionar botão para reprocessar com correções
    const reprocessButton = document.createElement('div');
    reprocessButton.className = 'col-12 mt-3';
    reprocessButton.innerHTML = `
        <div class="alert alert-warning">
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>Atenção:</strong> Se a classificação automática estiver incorreta, você pode corrigi-la acima e reprocessar a análise.
            <button class="btn btn-warning btn-sm ms-3" id="reprocessWithCorrections">
                <i class="fas fa-sync-alt me-1"></i>Reprocessar com Correções
            </button>
        </div>
    `;
    container.appendChild(reprocessButton);
    
    // Adicionar listener para o botão de reprocessamento
    document.getElementById('reprocessWithCorrections')?.addEventListener('click', function() {
        reprocessWithCorrectedTypes();
    });
    
    console.log(`✅ ${documents.length} documentos exibidos com opção de correção`);
}

// Função para reprocessar com tipos corrigidos
function reprocessWithCorrectedTypes() {
    if (!window.currentQualificacaoData || !window.currentQualificacaoData.campos) {
        qualificacaoUI.showAlert('Nenhum dado disponível para reprocessamento', 'warning');
        return;
    }
    
    const documents = window.currentQualificacaoData.campos.documents_analyzed;
    if (!documents) {
        qualificacaoUI.showAlert('Dados de documentos não encontrados', 'warning');
        return;
    }
    
    // Coletar tipos corrigidos
    const correctedTypes = {};
    document.querySelectorAll('.document-type-selector').forEach(select => {
        const documentIndex = parseInt(select.getAttribute('data-document-index'));
        const newType = select.value;
        correctedTypes[documentIndex] = newType;
    });
    
    console.log('🔄 Tipos corrigidos:', correctedTypes);
    
    // Verificar se houve mudanças
    let hasChanges = false;
    documents.forEach((doc, index) => {
        if (correctedTypes[index] && correctedTypes[index] !== doc.document_type) {
            hasChanges = true;
            doc.document_type = correctedTypes[index];
            console.log(`✅ Documento ${index} atualizado para: ${doc.document_type}`);
        }
    });
    
    if (!hasChanges) {
        qualificacaoUI.showAlert('Nenhuma correção foi feita. Não há necessidade de reprocessar.', 'info');
        return;
    }
    
    // Reprocessar análise com tipos corrigidos
    qualificacaoUI.showAlert('Reprocessando análise com tipos corrigidos...', 'info');
    qualificacaoUI.showProgress(true);
    qualificacaoUI.updateProgress(50);
    
    // Simular reprocessamento (na prática, seria enviado para o backend)
    setTimeout(() => {
        try {
            // Reprocessar análise com tipos corrigidos
            processAdvancedAnalysisResults(window.currentQualificacaoData.campos);
            
            // Atualizar exibição dos documentos
            displayDocumentClassification(documents);
            
            qualificacaoUI.updateProgress(100);
            qualificacaoUI.showAlert('Análise reprocessada com sucesso! Os checklists foram atualizados com base nas correções.', 'success');
            
            // Mostrar resumo das mudanças
            const changes = Object.entries(correctedTypes)
                .filter(([index, newType]) => documents[index] && documents[index].document_type === newType)
                .map(([index, newType]) => `Documento ${parseInt(index) + 1}: ${newType}`);
            
            if (changes.length > 0) {
                console.log('📊 Mudanças aplicadas:', changes);
            }
            
        } catch (error) {
            console.error('❌ Erro no reprocessamento:', error);
            qualificacaoUI.showAlert('Erro ao reprocessar análise. Tente novamente.', 'danger');
        } finally {
            setTimeout(() => qualificacaoUI.showProgress(false), 1000);
        }
    }, 1500);
}

// Função para desabilitar todos os radio buttons do checklist
function disableAllChecklistRadios() {
    const allRadios = document.querySelectorAll('.checklist-table input[type="radio"]');
    allRadios.forEach(radio => {
        radio.disabled = true;
    });
    console.log('🔒 Todos os radio buttons do checklist desabilitados');
}

// Função para habilitar todos os radio buttons do checklist
function enableAllChecklistRadios() {
    const allRadios = document.querySelectorAll('.checklist-table input[type="radio"]');
    allRadios.forEach(radio => {
        radio.disabled = false;
    });
    console.log('🔓 Todos os radio buttons do checklist habilitados');
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
    
    // Lista completa de todos os itens do checklist (apenas os que existem na tabela HTML)
    const checklistItems = [
        // MATRÍCULA - 9 itens
        'item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7', 'item8', 'item9',
        
        // TÍTULO - 23 itens
        'itemT1', 'itemT2', 'itemT3', 'itemT4', 'itemT5', 'itemT6', 'itemT7', 'itemT8', 'itemT9', 'itemT10', 'itemT11', 'itemT12', 'itemT13',
        'itemT14', 'itemT15', 'itemT16', 'itemT17', 'itemT18', 'itemT19', 'itemT20', 'itemT21', 'itemT22', 'itemT23'
    ];
    
    let itemsProcessados = 0;
    let itemsNaoEncontrados = 0;
    
    checklistItems.forEach((item) => {
        const value = campos[item] || 'N/A';
        
        // Buscar elementos diretamente pelo ID
        const radioSim = document.getElementById(`${item}_sim`);
        const radioNao = document.getElementById(`${item}_nao`);
        const radioNa = document.getElementById(`${item}_na`);
        
        console.log(`🔍 Procurando elementos para ${item}:`, {
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
            console.log(`✅ Item ${item} atualizado: ${value}`);
        } else {
            itemsNaoEncontrados++;
            console.log(`❌ Elementos não encontrados para item ${item}`);
            
            // Debug adicional - verificar se o elemento existe no DOM
            const allRadios = document.querySelectorAll('input[type="radio"]');
            const matchingRadios = Array.from(allRadios).filter(radio => 
                radio.id && radio.id.startsWith(item)
            );
            console.log(`🔍 Debug: ${matchingRadios.length} elementos encontrados com prefixo ${item}:`, 
                matchingRadios.map(r => r.id));
        }
        
        // Atualizar justificativa
        const justificativaField = `justificativa_${item}`;
        const justificativa = campos[justificativaField] || 'Justificativa não disponível';
        const justificativaElement = document.getElementById(`justificativa_${item}`);
        if (justificativaElement) {
            // Renderizar HTML se a justificativa contiver tags HTML (badges de documentos)
            if (justificativa.includes('<span') || justificativa.includes('badge')) {
                justificativaElement.innerHTML = justificativa;
            } else {
            justificativaElement.textContent = justificativa;
            }
            console.log(`📝 Justificativa ${item}: ${justificativa.substring(0, 50)}...`);
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
    const container = document.getElementById('qualificacaoResults');
    if (!container) return;
    
    if (!documentos || documentos.length === 0) {
        console.log('❌ Nenhum documento analisado para exibir');
        return;
    }
    
    console.log('📄 Exibindo documentos analisados:', documentos);
    
    let html = `
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-file-pdf me-2"></i>
                    Documentos Analisados (${documentos.length})
                </h5>
            </div>
            <div class="card-body">
                <div class="row">
    `;
    
    documentos.forEach((doc, index) => {
        const statusClass = doc.error ? 'border-danger' : 'border-success';
        const statusIcon = doc.error ? 'fas fa-exclamation-triangle text-danger' : 'fas fa-check-circle text-success';
        const statusText = doc.error ? 'Erro' : 'Processado';
        
        html += `
            <div class="col-md-6 mb-3">
                <div class="card ${statusClass}">
                    <div class="card-header bg-light">
                        <div class="d-flex justify-content-between align-items-center">
                            <strong>Documento ${index + 1}</strong>
                            <span class="badge ${doc.error ? 'bg-danger' : 'bg-success'}">
                                <i class="${statusIcon} me-1"></i>${statusText}
                            </span>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="mb-2">
                            <strong>Arquivo:</strong> ${doc.filename || 'N/A'}
                        </div>
                        <div class="mb-2">
                            <strong>ID:</strong> ${doc.file_id || 'N/A'}
                        </div>
                        <div class="mb-2">
                            <strong>Tamanho do texto:</strong> ${doc.text_length || 0} caracteres
                        </div>
                        ${doc.text_preview ? `
                        <div class="mb-2">
                            <strong>Preview:</strong>
                            <div class="alert alert-light p-2">
                                <small>${doc.text_preview.substring(0, 150)}${doc.text_preview.length > 150 ? '...' : ''}</small>
                            </div>
                        </div>
                        ` : ''}
                        ${doc.error ? `
                        <div class="alert alert-danger p-2">
                            <small><strong>Erro:</strong> ${doc.error}</small>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
                </div>
            </div>
        </div>
    `;
    
    // Inserir no início do container
    container.insertAdjacentHTML('afterbegin', html);
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

// Função para mostrar botão de edição
function showEditButton() {
    const editButton = document.getElementById('editChecklist');
    if (editButton) {
        editButton.style.display = 'inline-block';
        editButton.addEventListener('click', toggleChecklistEditMode);
    }
}

// Função para alternar modo de edição do checklist
function toggleChecklistEditMode() {
    const editButton = document.getElementById('editChecklist');
    const isEditing = editButton.classList.contains('btn-warning');
    
    if (isEditing) {
        // Sair do modo de edição
        editButton.classList.remove('btn-warning');
        editButton.classList.add('btn-outline-warning');
        editButton.innerHTML = '<i class="fas fa-edit"></i> Editar';
        
        // Desabilitar edição dos radio buttons
        disableChecklistEditing();
        
        // Remover indicador visual
        removeEditingIndicator();
        
        qualificacaoUI.showAlert('Modo de visualização ativado. As respostas estão protegidas contra alterações acidentais.', 'info');
            } else {
        // Entrar no modo de edição
        editButton.classList.remove('btn-outline-warning');
        editButton.classList.add('btn-warning');
        editButton.innerHTML = '<i class="fas fa-save"></i> Salvar';
        
        // Habilitar edição dos radio buttons
        enableChecklistEditing();
        
        // Adicionar indicador visual
        addEditingIndicator();
        
        qualificacaoUI.showAlert('Modo de edição ativado. Você pode alterar as respostas do checklist.', 'warning');
    }
}

// Função para adicionar indicador visual de modo de edição
function addEditingIndicator() {
    // Remover indicador existente se houver
    removeEditingIndicator();
    
    const indicator = document.createElement('div');
    indicator.className = 'editing-indicator';
    indicator.innerHTML = '<i class="fas fa-edit me-2"></i>MODO DE EDIÇÃO';
    indicator.id = 'editingIndicator';
    
    document.body.appendChild(indicator);
}

// Função para remover indicador visual de modo de edição
function removeEditingIndicator() {
    const indicator = document.getElementById('editingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Função para habilitar edição do checklist
function enableChecklistEditing() {
    // Habilitar todos os radio buttons
    enableAllChecklistRadios();
    
    // Adicionar classe de edição à tabela
    const checklistTable = document.querySelector('.checklist-table');
    if (checklistTable) {
        checklistTable.classList.add('editing-mode');
    }
    
    // Mostrar indicador de edição
    addEditingIndicator();
    
    console.log('✏️ Modo de edição habilitado');
}

// Função para desabilitar edição do checklist
function disableChecklistEditing() {
    // Desabilitar todos os radio buttons
    disableAllChecklistRadios();
    
    // Remover classe de edição da tabela
    const checklistTable = document.querySelector('.checklist-table');
    if (checklistTable) {
        checklistTable.classList.remove('editing-mode');
    }
    
    // Remover indicador de edição
    removeEditingIndicator();
    
    console.log('🔒 Modo de edição desabilitado');
}

// Função para baixar checklist em Word
function downloadChecklistWord() {
    try {
        // Coletar dados do checklist
        const checklistData = collectChecklistData();
        
        // Gerar conteúdo do Word
        const wordContent = generateWordContent(checklistData);
        
        // Criar e baixar arquivo
        const blob = new Blob([wordContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
        a.download = `checklist_qualificacao_${new Date().toISOString().split('T')[0]}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        qualificacaoUI.showAlert('Checklist baixado em formato Word com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao gerar arquivo Word:', error);
        qualificacaoUI.showAlert('Erro ao gerar arquivo Word. Tente novamente.', 'danger');
    }
}

// Função para coletar dados do checklist
function collectChecklistData() {
    const checklistData = {
        items: [],
        summary: {
            total: 0,
            sim: 0,
            nao: 0,
            na: 0
        },
        timestamp: new Date().toLocaleString('pt-BR'),
        documents: window.currentQualificacaoData?.campos?.documents_analyzed || []
    };
    
    // Lista de todos os itens do checklist
    const checklistItems = [
        'item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7', 'item8', 'item9',
        'itemT1', 'itemT2', 'itemT3', 'itemT4', 'itemT5', 'itemT6', 'itemT7', 'itemT8', 'itemT9', 'itemT10', 'itemT11', 'itemT12', 'itemT13', 'itemT14', 'itemT15', 'itemT16', 'itemT17', 'itemT18', 'itemT19', 'itemT20', 'itemT21', 'itemT22', 'itemT23'
    ];
    
    checklistItems.forEach(itemId => {
        const radioSim = document.getElementById(`${itemId}_sim`);
        const radioNao = document.getElementById(`${itemId}_nao`);
        const radioNa = document.getElementById(`${itemId}_na`);
        const justificativaElement = document.getElementById(`justificativa_${itemId}`);
        
        let resposta = 'N/A';
        if (radioSim && radioSim.checked) resposta = 'Sim';
        else if (radioNao && radioNao.checked) resposta = 'Não';
        else if (radioNa && radioNa.checked) resposta = 'N/A';
        
        const justificativa = justificativaElement ? justificativaElement.textContent : '';
        
        // Obter texto da pergunta
        const row = radioSim ? radioSim.closest('tr') : null;
        const pergunta = row ? row.querySelector('td:first-child').textContent.replace(/^\d+\)\s*/, '') : `Item ${itemId}`;
        
        checklistData.items.push({
            id: itemId,
            pergunta: pergunta,
            resposta: resposta,
            justificativa: justificativa
        });
        
        // Contar respostas
        if (resposta === 'Sim') checklistData.summary.sim++;
        else if (resposta === 'Não') checklistData.summary.nao++;
        else checklistData.summary.na++;
        checklistData.summary.total++;
    });
    
    return checklistData;
}

// Função para gerar conteúdo do Word
function generateWordContent(checklistData) {
    // Criar conteúdo HTML que será convertido para Word
    let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Checklist de Qualificação</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .summary { background-color: #f8f9fa; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
                .section { margin-bottom: 25px; }
                .section-title { font-weight: bold; font-size: 16px; color: #495057; margin-bottom: 10px; }
                .item { margin-bottom: 15px; border-left: 3px solid #007bff; padding-left: 10px; }
                .pergunta { font-weight: bold; margin-bottom: 5px; }
                .resposta { color: #28a745; font-weight: bold; }
                .justificativa { font-style: italic; color: #6c757d; margin-top: 5px; }
                .documents { background-color: #e9ecef; padding: 10px; margin-top: 20px; border-radius: 5px; }
                .document-item { margin-bottom: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>CHECKLIST DE QUALIFICAÇÃO</h1>
                <p><strong>Data:</strong> ${checklistData.timestamp}</p>
            </div>
            
            <div class="summary">
                <h3>Resumo da Análise</h3>
                <p><strong>Total de itens:</strong> ${checklistData.summary.total}</p>
                <p><strong>Sim:</strong> ${checklistData.summary.sim} | <strong>Não:</strong> ${checklistData.summary.nao} | <strong>N/A:</strong> ${checklistData.summary.na}</p>
            </div>
            
            <div class="section">
                <div class="section-title">MATRÍCULA</div>
    `;
    
    // Adicionar itens da matrícula
    checklistData.items.filter(item => item.id.startsWith('item') && !item.id.startsWith('itemT')).forEach((item, index) => {
        htmlContent += `
            <div class="item">
                <div class="pergunta">${index + 1}) ${item.pergunta}</div>
                <div class="resposta">Resposta: ${item.resposta}</div>
                ${item.justificativa ? `<div class="justificativa">Justificativa: ${item.justificativa}</div>` : ''}
            </div>
        `;
    });
    
    htmlContent += `
            </div>
            
            <div class="section">
                <div class="section-title">TÍTULO</div>
    `;
    
    // Adicionar itens do título
    checklistData.items.filter(item => item.id.startsWith('itemT')).forEach((item, index) => {
        htmlContent += `
            <div class="item">
                <div class="pergunta">${index + 1}) ${item.pergunta}</div>
                <div class="resposta">Resposta: ${item.resposta}</div>
                ${item.justificativa ? `<div class="justificativa">Justificativa: ${item.justificativa}</div>` : ''}
            </div>
        `;
    });
    
    htmlContent += `
            </div>
            
            <div class="documents">
                <h3>Documentos Analisados</h3>
    `;
    
    // Adicionar informações dos documentos
    checklistData.documents.forEach((doc, index) => {
        htmlContent += `
            <div class="document-item">
                <strong>Documento ${index + 1}:</strong> ${doc.filename} (${doc.document_type})
            </div>
        `;
    });
    
    htmlContent += `
            </div>
        </body>
        </html>
    `;
    
    return htmlContent;
}

// Função para configurar event listeners da qualificação
function setupQualificacaoEventListeners() {
    console.log('🔧 Configurando event listeners da qualificação...');
    
    // Desabilitar todos os radio buttons do checklist por padrão
    disableAllChecklistRadios();
    
    // Lista de event listeners
    const eventListeners = [
        { id: 'processFileQualificacao', func: () => {
            const fileInput = document.getElementById('fileInputQualificacao');
            if (fileInput && fileInput.files.length > 0) {
                processQualificacao(fileInput.files);
            } else {
                qualificacaoUI.showAlert('Selecione pelo menos um arquivo PDF para análise.', 'warning');
            }
        }},
        { id: 'downloadWordQualificacao', func: downloadChecklistWord },
        { id: 'generateNotaDevolutiva', func: generateNotaDevolutiva }
    ];
    
    // Adicionar event listeners
    eventListeners.forEach(({ id, func }) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', func);
            console.log(`✅ Event listener adicionado para ${id}`);
        } else {
            console.log(`❌ Elemento ${id} não encontrado`);
        }
    });
    
    // Configurar input de arquivo
    const fileInput = document.getElementById('fileInputQualificacao');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const processButton = document.getElementById('processFileQualificacao');
            if (processButton) {
                processButton.disabled = this.files.length === 0;
            }
            
            // Mostrar arquivos selecionados
            console.log(`📁 ${this.files.length} arquivo(s) selecionado(s)`);
        });
        console.log('✅ Event listener adicionado para fileInputQualificacao');
    }
    
    // Configurar event listeners para radio buttons do checklist
    const allRadios = document.querySelectorAll('.checklist-table input[type="radio"]');
    allRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            console.log(`📝 Radio button alterado: ${this.name} = ${this.value}`);
            
            // Se estiver no modo de edição, mostrar feedback
            const editButton = document.getElementById('editChecklist');
            if (editButton && editButton.classList.contains('btn-warning')) {
                qualificacaoUI.showAlert(`Resposta alterada para: ${this.value}`, 'info');
            }
        });
    });
    
    console.log('✅ Todos os event listeners da qualificação configurados');
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
    window.downloadChecklistWord = downloadChecklistWord; // Adicionar para exportação global
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