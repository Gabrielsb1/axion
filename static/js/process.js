// process.js - Processamento de arquivos

// Utilitários
const UTILS = {
    validateFile: function(file) {
        if (!file) {
            return { valid: false, error: 'Nenhum arquivo selecionado' };
        }
        
        const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
        const fileName = file.name.toLowerCase();
        const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
        
        if (!hasValidExtension) {
            return { valid: false, error: 'Tipo de arquivo não suportado. Use PDF, JPG, JPEG ou PNG.' };
        }
        
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return { valid: false, error: 'Arquivo muito grande. Tamanho máximo: 10MB' };
        }
        
        return { valid: true };
    }
};

export async function processFile(files, ui, setCurrentData, serviceType = 'matricula') {
    if (!files || files.length === 0) {
        ui.showAlert('Nenhum arquivo selecionado!', 'warning');
        return;
    }

    // Validar arquivos
    for (let i = 0; i < files.length; i++) {
        const validation = UTILS.validateFile(files[i]);
        if (!validation.valid) {
            ui.showAlert(`Erro no arquivo ${files[i].name}: ${validation.error}`, 'danger');
            return;
        }
    }

    ui.showProgress(true);
    ui.updateStatus(`Processando ${files.length} arquivo(s)...`, 'info');

    try {
        // Processar todos os arquivos e combinar os resultados
        let combinedData = {};
        let processedCount = 0;
        let lastProcessedData = null;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            ui.updateStatus(`Processando arquivo ${i + 1} de ${files.length}: ${file.name}`, 'info');

            const formData = new FormData();
            formData.append('file', file);
            
            // Sempre usar gpt-4o como modelo
            formData.append('model', 'gpt-4o');
            formData.append('service', serviceType);

            const response = await fetch('/api/process-file', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                let data;
                try {
                    data = await response.json();
                } catch (jsonError) {
                    // Se não conseguir fazer parse do JSON, tentar ler como texto
                    const textResponse = await response.text();
                    console.error('Erro ao fazer parse do JSON:', jsonError);
                    console.error('Resposta recebida:', textResponse);
                    ui.updateStatus(`Erro no processamento do arquivo ${file.name}: Resposta inválida do servidor`, 'danger');
                    ui.showAlert(`Erro no processamento do arquivo ${file.name}: Resposta inválida do servidor`, 'danger');
                    return;
                }
                
                // Armazenar último resultado processado
                lastProcessedData = data;
                
                // Combinar os dados extraídos
                if (data.campos) {
                    Object.assign(combinedData, data.campos);
                }
                
                processedCount++;
            } else {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    // Se não conseguir fazer parse do JSON de erro, tentar ler como texto
                    const textResponse = await response.text();
                    console.error('Erro ao fazer parse do JSON de erro:', jsonError);
                    console.error('Resposta de erro recebida:', textResponse);
                    ui.updateStatus(`Erro no arquivo ${file.name}: Erro no servidor`, 'danger');
                    ui.showAlert(`Erro no processamento do arquivo ${file.name}: Erro no servidor`, 'danger');
                    return;
                }
                ui.updateStatus(`Erro no arquivo ${file.name}: ${errorData.error}`, 'danger');
                ui.showAlert(`Erro no processamento do arquivo ${file.name}: ${errorData.error}`, 'danger');
                return;
            }
        }

        // Definir os dados combinados
        setCurrentData({ campos: combinedData });
        
        // Tratar diferentes tipos de serviço
        if (serviceType === 'ocr') {
            // Para OCR, mostrar informações específicas
            // Usar o último resultado processado
            displayOCRResults(lastProcessedData, ui);
        } else {
            // Para outros serviços, preencher campos da matrícula
            fillMatriculaFields(combinedData);
        }
        
        ui.updateStatus(`${processedCount} arquivo(s) processado(s) com sucesso!`, 'success');
        ui.showAlert('Processamento concluído!', 'success');
    } catch (error) {
        console.error('Erro no processamento:', error);
        ui.updateStatus('Erro inesperado no processamento', 'danger');
        ui.showAlert('Erro inesperado no processamento', 'danger');
    } finally {
        ui.showProgress(false);
    }
}

// Função para exibir resultados do OCR
function displayOCRResults(data, ui) {
    console.log('📄 Exibindo resultados do OCR:', data);
    
    const ocrStatus = document.getElementById('ocrStatus');
    const ocrResults = document.getElementById('ocrResults');
    
    if (!ocrStatus || !ocrResults) {
        console.error('❌ Elementos OCR não encontrados');
        return;
    }
    
    // Obter informações do backend
    const processingTime = data.processing_time || 'N/A';
    const textLength = data.text_length || (data.text_content ? data.text_content.length : 0);
    const quality = data.ocr_quality || (textLength > 1000 ? 'Alta' : textLength > 500 ? 'Média' : 'Baixa');
    
    console.log('⏱️ Tempo de processamento recebido:', processingTime);
    
    // Criar HTML para status
    const statusHTML = `
        <div class="alert alert-success">
            <h6><i class="fas fa-check-circle me-2"></i>OCR Concluído com Sucesso!</h6>
            <p class="mb-2"><small class="text-muted"><i class="fas fa-info-circle me-1"></i>Apenas OCR executado - sem análise de IA</small></p>
            <div class="processing-stats">
                <div class="stat-item">
                    <span class="stat-label">Tempo de Processamento:</span>
                    <span class="processing-time">${processingTime}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Caracteres Extraídos:</span>
                    <span class="badge bg-primary">${textLength.toLocaleString()}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Qualidade Estimada:</span>
                    <span class="badge bg-success">${quality}</span>
                </div>
            </div>
        </div>
    `;
    
    // Criar HTML para resultados
    const resultsHTML = `
        <div class="card">
            <div class="card-header">
                <h6 class="mb-0">
                    <i class="fas fa-file-text me-2"></i>
                    Texto Extraído
                </h6>
            </div>
            <div class="card-body">
                <div class="text-preview">
                    ${(data.text_content || (data.campos && data.campos.text_content)) ? 
                        (data.text_content || data.campos.text_content).substring(0, 1000) + 
                        ((data.text_content || data.campos.text_content).length > 1000 ? '...' : '') : 
                        'Nenhum texto extraído'}
                </div>
                ${(data.text_content || (data.campos && data.campos.text_content)) && 
                  (data.text_content || data.campos.text_content).length > 1000 ? `
                <div class="text-center mt-3">
                    <button class="btn btn-outline-primary btn-sm" onclick="showFullOCRText()">
                        <i class="fas fa-expand me-1"></i>Ver Texto Completo
                    </button>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    // Exibir resultados
    ocrStatus.innerHTML = statusHTML;
    ocrResults.innerHTML = resultsHTML;
    
    // Armazenar texto completo para visualização
    if (data.text_content) {
        window.fullOCRText = data.text_content;
    } else if (data.campos && data.campos.text_content) {
        window.fullOCRText = data.campos.text_content;
    }
    
    // Armazenar resultado completo para download
    window.ocrResult = {
        file_id: data.file_id,
        original_filename: data.original_filename,
        text_content: data.text_content || (data.campos && data.campos.text_content),
        text_length: data.text_length
    };
    
    // Habilitar botão de download PDF
    const downloadPDFBtn = document.getElementById('downloadOCRPDF');
    if (downloadPDFBtn) {
        downloadPDFBtn.disabled = false;
        console.log('✅ Botão de download PDF habilitado');
    } else {
        console.error('❌ Botão de download PDF não encontrado');
    }
    
    console.log('✅ Resultados do OCR exibidos com sucesso');
}

// Função para mostrar texto completo do OCR
window.showFullOCRText = function() {
    if (window.fullOCRText) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-file-text me-2"></i>
                            Texto Completo Extraído
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="text-preview" style="max-height: 400px; overflow-y: auto;">
                            ${window.fullOCRText}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        <button type="button" class="btn btn-primary" onclick="downloadOCRText()">
                            <i class="fas fa-download me-1"></i>Baixar como TXT
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Inicializar modal Bootstrap
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
        
        // Remover modal do DOM após fechar
        modal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
        });
    }
};

// Função para baixar texto do OCR
window.downloadOCRText = function() {
    if (window.fullOCRText) {
        const blob = new Blob([window.fullOCRText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ocr_texto_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

// Função para preencher os campos da matrícula
function fillMatriculaFields(campos) {
    console.log('🔍 Dados recebidos para preenchimento:', campos);
    
    // Mapeamento dos campos do backend para os IDs do frontend
    const fieldMapping = {
        // CADASTRO
        'inscricao_imobiliaria': 'inscricaoImobiliaria',
        'rip': 'rip',
        
        // DADOS DO IMÓVEL
        'tipo_imovel': 'tipoImovel',
        'tipo_logradouro': 'tipoLogradouro',
        'cep': 'cep',
        'nome_logradouro': 'nomeLogradouro',
        'numero_lote': 'numeroLote',
        'bloco': 'bloco',
        'pavimento': 'pavimento',
        'andar': 'andar',
        'loteamento': 'loteamento',
        'numero_loteamento': 'numeroLoteamento',
        'quadra': 'quadra',
        'bairro': 'bairro',
        'cidade': 'cidade',
        'dominialidade': 'dominialidade',
        'area_total': 'areaTotal',
        'area_construida': 'areaConstruida',
        'area_privativa': 'areaPrivativa',
        'area_uso_comum': 'areaUsoComum',
        'area_correspondente': 'areaCorrespondente',
        'fracao_ideal': 'fracaoIdeal',
        
        // DADOS PESSOAIS
        'cpf_cnpj': 'cpfCnpj',
        'nome_completo': 'nomeCompleto',
        'sexo': 'sexo',
        'nacionalidade': 'nacionalidade',
        'estado_civil': 'estadoCivil',
        'profissao': 'profissao',
        'rg': 'rg',
        'cnh': 'cnh',
        'endereco_completo': 'enderecoCompleto',
        'regime_casamento': 'regimeCasamento',
        'data_casamento': 'dataCasamento',
        'matricula_casamento': 'matriculaCasamento',
        'natureza_juridica': 'naturezaJuridica',
        'representante_legal': 'representanteLegal',
        
        // INFORMAÇÕES UTILIZADAS PARA OS ATOS
        'valor_transacao': 'valorTransacao',
        'valor_avaliacao': 'valorAvaliacao',
        'data_alienacao': 'dataAlienacao',
        'forma_alienacao': 'formaAlienacao',
        'valor_divida': 'valorDivida',
        'valor_alienacao_contrato': 'valorAlienacaoContrato',
        'tipo_onus': 'tipoOnus'
    };

    let preenchidos = 0;
    let naoEncontrados = 0;

    // Preencher cada campo
    Object.entries(fieldMapping).forEach(([backendField, frontendId]) => {
        const element = document.getElementById(frontendId);
        if (element) {
            const value = campos[backendField] || '';
            element.value = value;
            
            if (value) {
                console.log(`✅ ${backendField} → ${frontendId}: "${value}"`);
                preenchidos++;
            } else {
                console.log(`❌ ${backendField} → ${frontendId}: (vazio)`);
            }
        } else {
            console.log(`⚠️ Elemento não encontrado: ${frontendId}`);
            naoEncontrados++;
        }
    });

    // Verificar campos específicos que sabemos que têm dados
    const camposComDados = [
        'inscricao_imobiliaria', 'tipo_imovel', 'tipo_logradouro', 'nome_logradouro', 
        'numero_lote', 'pavimento', 'bairro', 'cidade', 'area_total', 'area_construida',
        'area_privativa', 'area_uso_comum', 'fracao_ideal', 'cpf_cnpj', 'nome_completo',
        'endereco_completo', 'natureza_juridica', 'valor_transacao', 'valor_avaliacao',
        'data_alienacao', 'forma_alienacao', 'valor_alienacao_contrato'
    ];
    
    console.log('🔍 Verificação específica dos campos com dados:');
    camposComDados.forEach(campo => {
        const valor = campos[campo];
        const elemento = document.getElementById(fieldMapping[campo]);
        if (valor && elemento) {
            console.log(`✅ ${campo}: "${valor}" → ${fieldMapping[campo]}`);
        } else if (valor && !elemento) {
            console.log(`❌ ${campo}: "${valor}" → ${fieldMapping[campo]} (elemento não encontrado)`);
        } else if (!valor) {
            console.log(`⚠️ ${campo}: (sem dados)`);
        }
    });

    console.log(`📊 Resumo: ${preenchidos} campos preenchidos, ${naoEncontrados} elementos não encontrados`);
    console.log('✅ Campos da matrícula preenchidos com sucesso');
} 