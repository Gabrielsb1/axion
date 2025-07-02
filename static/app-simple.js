// App Axion - Sistema de Múltiplos Serviços
let currentData = null;
let currentFile = null;
let currentService = 'matricula'; // Serviço atual

// Variáveis para alta produção (múltiplos arquivos)
let processedFiles = []; // Array para armazenar dados de múltiplos arquivos
let currentFiles = []; // Array para armazenar arquivos selecionados

// Configuração dos serviços
const services = {
    matricula: {
        name: 'Matrícula 3º RI',
        icon: 'fas fa-file-contract',
        fields: ['matricula', 'dataMatricula', 'descricaoImovel', 'endereco', 'areaPrivativa', 'areaTotal', 'garagem', 'proprietarios', 'livroAnterior', 'folhaAnterior', 'matriculaAnterior', 'tipoTitulo', 'valorTitulo', 'comprador', 'cpfCnpj', 'valorITBI', 'numeroDAM', 'dataPagamentoITBI']
    },
    contratos: {
        name: 'Contratos',
        icon: 'fas fa-file-signature',
        fields: [
            // 1. Qualificação das Partes - Parte 1
            'nomeParte1', 'nacionalidadeParte1', 'estadoCivilParte1', 'profissaoParte1', 'cpfParte1', 'rgParte1', 'enderecoParte1', 'conjugeParte1',
            // 1. Qualificação das Partes - Parte 2
            'nomeParte2', 'nacionalidadeParte2', 'estadoCivilParte2', 'profissaoParte2', 'cpfParte2', 'rgParte2', 'enderecoParte2', 'conjugeParte2',
            // 1. Qualificação das Partes - Pessoas Jurídicas
            'razaoSocial', 'cnpj', 'enderecoPJ', 'representanteLegal', 'instrumentoRepresentacao',
            // 2. Identificação do Imóvel
            'enderecoImovel', 'numeroMatriculaImovel', 'cartorioRegistro', 'tipoImovel', 'descricaoCompletaImovel', 'origemPropriedade',
            // 3. Natureza do Negócio Jurídico
            'tipoContrato', 'finalidadeTransacao', 'valorNegocio', 'formaPagamento', 'condicoesClausulas',
            // 4. Informações Tributárias e Encargos
            'valorITBI', 'itbiPago', 'baseCalculo', 'declaracaoIsencao', 'itrCcir', 'debitosFiscais', 'certidoesNegativas',
            // 5. Ônus e Gravames
            'hipoteca', 'alienacaoFiduciaria', 'usufruto', 'penhora', 'clausulasInalienabilidade', 'acoesJudiciais',
            // 6. Documentos Complementares
            'procuracoes', 'escriturasAnteriores', 'contratosPreliminares', 'certidoes',
            // 7. Informações para a Minuta
            'tituloMinuta', 'identificacaoOutorgantes', 'clausulasContratuais', 'declaracoesLegais', 'responsabilidadeTributos', 'reconhecimentoFirma'
        ]
    },
    escrituras: {
        name: 'Escrituras',
        icon: 'fas fa-scroll',
        fields: [
            // 1. Identificação do Ato
            'tipoEscritura', 'numeroLivro', 'numeroFolha', 'dataLavratura', 'nomeTabeliao', 'termoEletronico',
            // 2. Qualificação das Partes - Parte 1
            'nomeParte1Escritura', 'nacionalidadeParte1Escritura', 'estadoCivilParte1Escritura', 'profissaoParte1Escritura', 'cpfParte1Escritura', 'rgParte1Escritura', 'enderecoParte1Escritura', 'regimeBensParte1',
            // 2. Qualificação das Partes - Parte 2
            'nomeParte2Escritura', 'nacionalidadeParte2Escritura', 'estadoCivilParte2Escritura', 'profissaoParte2Escritura', 'cpfParte2Escritura', 'rgParte2Escritura', 'enderecoParte2Escritura', 'regimeBensParte2',
            // 2. Qualificação das Partes - Pessoas Jurídicas
            'razaoSocialEscritura', 'cnpjEscritura', 'enderecoPJEscritura', 'representanteLegalEscritura', 'instrumentoRepresentacaoEscritura',
            // 3. Identificação do Imóvel
            'enderecoImovelEscritura', 'matriculaEscritura', 'cartorioRegistroEscritura', 'areaTotalEscritura', 'confrontacoesEscritura', 'benfeitoriasEscritura', 'inscricaoCadastral', 'origemPropriedadeEscritura',
            // 4. Informações do Negócio Jurídico
            'valorImovelEscritura', 'formaPagamentoEscritura', 'condicoesSuspensivas', 'participacaoTerceiros', 'clausulasEspeciais',
            // 5. Tributos e Documentos
            'valorITBIEscritura', 'declaracaoIsencaoEscritura', 'numeroGuia', 'dataGuia', 'certidoesNegativas', 'certidaoEstadoCivil', 'certidaoMatricula', 'comprovantesResidencia',
            // 6. Procurações
            'outorganteProcura', 'outorgadoProcura', 'livroProcura', 'folhaProcura', 'dataLavraturaProcura', 'poderesConcedidos', 'validadeProcura', 'procuraEspecifica',
            // 7. Ônus e Gravames
            'existeOnus', 'tipoOnusEscritura', 'clausulasImpeditivas',
            // 8. Cláusulas e Declarações Importantes
            'declaracaoTributos', 'responsabilidadeRegistro', 'declaracaoQuitacao', 'imovelLivreDesembaracado', 'fePublicaTabeliao', 'assinaturas'
        ]
    },
    qualificacao: {
        name: 'Qualificação',
        icon: 'fas fa-user-check',
        fields: ['nome', 'cpfCnpj', 'qualificacao', 'endereco', 'documentos']
    },
    memorial: {
        name: 'Memorial',
        icon: 'fas fa-file-alt',
        fields: ['numeroMemorial', 'tipoMemorial', 'descricao', 'dataMemorial']
    },
    minuta: {
        name: 'Minuta',
        icon: 'fas fa-file-alt',
        fields: ['descricaoImovelCompleta', 'proprietarioAtual', 'tipoOnusAtivo', 'descricaoOnusCompleta', 'numeroMatricula', 'possiveisErros']
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Axion - Solução Registral iniciando...');
    setupEventListeners();
    
    // Inicializar opções do ChatGPT (já que está selecionado por padrão)
    const chatgptOptions = document.getElementById('chatgptOptions');
    if (chatgptOptions) {
        chatgptOptions.style.display = 'block';
    }
});

// Configurar event listeners
function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    // Métodos de processamento
    const methodRadios = document.querySelectorAll('input[name="processingMethod"]');
    methodRadios.forEach(radio => {
        radio.addEventListener('change', handleMethodChange);
    });
    
    // Modelos ChatGPT
    const modelRadios = document.querySelectorAll('input[name="chatgptModel"]');
    modelRadios.forEach(radio => {
        radio.addEventListener('change', handleModelChange);
    });
    
    // File inputs para cada serviço
    const fileInputs = [
        'fileInputMatricula',
        'fileInputMinuta',
        'fileInputContratos',
        'fileInputEscrituras',
        'fileInputQualificacao',
        'fileInputMemorial'
    ];
    
    fileInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            const serviceId = inputId.replace('fileInput', '').toLowerCase();
            input.addEventListener('change', (event) => handleFileSelect(event, serviceId));
            console.log(`✅ File input listener configurado para ${serviceId}`);
        }
    });
    
    // Process button listeners
    const processButtons = [
        'processFileMatricula',
        'processFileMinuta',
        'processFileContratos',
        'processFileEscrituras',
        'processFileQualificacao',
        'processFileMemorial'
    ];
    
    processButtons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            const serviceId = buttonId.replace('processFile', '').toLowerCase();
            button.addEventListener('click', () => processFile(serviceId));
            console.log(`✅ Process button listener configurado para ${serviceId}`);
        }
    });
    
    // Download buttons
    const downloadButtons = [
        { id: 'downloadWord', func: downloadWordFile },
        { id: 'downloadPDF', func: downloadPDFFile },
        { id: 'downloadJSON', func: downloadJSONFile },
        { id: 'downloadWordMinuta', func: downloadWordFile },
        { id: 'downloadPDFMinuta', func: downloadPDFFile },
        { id: 'downloadJSONMinuta', func: downloadJSONFile },
        { id: 'downloadWordContratos', func: downloadWordFile },
        { id: 'downloadPDFContratos', func: downloadPDFFile },
        { id: 'downloadJSONContratos', func: downloadJSONFile },
        { id: 'downloadWordEscrituras', func: downloadWordFile },
        { id: 'downloadPDFEscrituras', func: downloadPDFFile },
        { id: 'downloadJSONEscrituras', func: downloadJSONFile },
        { id: 'downloadWordQualificacao', func: downloadWordFile },
        { id: 'downloadPDFQualificacao', func: downloadPDFFile },
        { id: 'downloadJSONQualificacao', func: downloadJSONFile },
        { id: 'downloadWordMemorial', func: downloadWordFile },
        { id: 'downloadPDFMemorial', func: downloadPDFFile },
        { id: 'downloadJSONMemorial', func: downloadJSONFile }
    ];
    
    downloadButtons.forEach(button => {
        const element = document.getElementById(button.id);
        if (element) {
            element.addEventListener('click', () => button.func());
            console.log(`✅ Download button ${button.id} listener configurado`);
        }
    });
    
    // Download CSV button
    const downloadCSVBtn = document.getElementById('downloadCSV');
    if (downloadCSVBtn) {
        downloadCSVBtn.addEventListener('click', downloadCSV);
        console.log('✅ Download CSV listener configurado');
    }
    
    // Download Excel button
    const downloadExcelBtn = document.getElementById('downloadExcel');
    if (downloadExcelBtn) {
        downloadExcelBtn.addEventListener('click', downloadExcel);
        console.log('✅ Download Excel listener configurado');
    }
    
    // Abas de serviços
    const serviceTabs = document.querySelectorAll('#servicesTabs .nav-link');
    serviceTabs.forEach(tab => {
        tab.addEventListener('click', handleServiceChange);
    });
    
    // --- OCR Tesseract ---
    const fileInputOCRTesseract = document.getElementById('fileInputOCRTesseract');
    const processFileOCRTesseract = document.getElementById('processFileOCRTesseract');
    const ocrTesseractStatus = document.getElementById('ocrTesseractStatus');

    if (fileInputOCRTesseract && processFileOCRTesseract) {
        fileInputOCRTesseract.addEventListener('change', function() {
            const file = fileInputOCRTesseract.files[0];
            if (file) {
                // Validar arquivo
                if (!file.name.toLowerCase().endsWith('.pdf')) {
                    ocrTesseractStatus.innerHTML = '<div class="alert alert-warning">Apenas arquivos PDF são permitidos para OCR Tesseract.</div>';
                    fileInputOCRTesseract.value = '';
                    processFileOCRTesseract.disabled = true;
                    return;
                }
                processFileOCRTesseract.disabled = false;
                ocrTesseractStatus.innerHTML = `<div class="alert alert-info">Arquivo selecionado: ${file.name}</div>`;
            } else {
                processFileOCRTesseract.disabled = true;
                ocrTesseractStatus.innerHTML = '';
            }
        });

        processFileOCRTesseract.addEventListener('click', async function() {
            const file = fileInputOCRTesseract.files[0];
            if (!file) {
                ocrTesseractStatus.innerHTML = '<div class="alert alert-warning">Selecione um arquivo PDF.</div>';
                return;
            }
            
            // Mostrar progresso
            ocrTesseractStatus.innerHTML = '<div class="alert alert-info"><i class="fas fa-spinner fa-spin me-2"></i>Enviando arquivo para processamento OCR Python...</div>';
            processFileOCRTesseract.disabled = true;
            processFileOCRTesseract.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processando...';
            
            try {
                const formData = new FormData();
                formData.append('file', file);
                
                const response = await fetch('/api/ocr-tesseract', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        ocrTesseractStatus.innerHTML = `
                            <div class="alert alert-success">
                                <i class="fas fa-check-circle me-2"></i>${result.message}
                                <button class="btn btn-success btn-sm ms-2" onclick="downloadOCRFile('${result.download_url}', '${result.processed_filename}')">
                                    <i class="fas fa-download me-1"></i>Baixar PDF Pesquisável
                                </button>
                            </div>
                        `;
                } else {
                        throw new Error(result.error || 'Erro desconhecido');
                }
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }
            } catch (err) {
                console.error('Erro no OCR:', err);
                ocrTesseractStatus.innerHTML = `<div class="alert alert-danger"><i class="fas fa-exclamation-triangle me-2"></i>Erro: ${err.message}</div>`;
            } finally {
            processFileOCRTesseract.disabled = false;
                processFileOCRTesseract.innerHTML = '<i class="fas fa-play me-1"></i>Processar com Python OCR';
            }
        });
    }
    
    console.log('✅ Todos os event listeners configurados');
}

// Handle service change
function handleServiceChange(event) {
    const serviceId = event.target.getAttribute('data-bs-target').replace('#', '');
    currentService = serviceId;
    
    // Atualizar interface baseada no serviço
    updateInterfaceForService(serviceId);
    
    console.log('Serviço alterado para:', serviceId);
}

// Update interface for service
function updateInterfaceForService(serviceId) {
    // Limpar dados anteriores
    currentData = null;
    currentFile = null;
    
    // Limpar dados de alta produção
    if (serviceId === 'certidao') {
        processedFiles = [];
        currentFiles = [];
        updatePreviewTable();
    }
    
    // Reset file inputs específicos
    const fileInputs = {
        'matricula': 'fileInputMatricula',
        'memorial': 'fileInputMemorial',
        'minuta': 'fileInputMinuta'
    };
    
    Object.values(fileInputs).forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.value = '';
        }
    });
    
    // Disable process buttons específicos
    const processButtons = {
        'matricula': 'processFileMatricula',
        'memorial': 'processFileMemorial',
        'minuta': 'processFileMinuta'
    };
    
    Object.values(processButtons).forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = true;
        }
    });
    
    // Clear form fields based on service
    clearFormFields(serviceId);
}

// Get service name
function getServiceName(serviceId) {
    return services[serviceId] ? services[serviceId].name : serviceId;
}

// Clear form fields
function clearFormFields(serviceId) {
    if (serviceId === 'matricula') {
        const fields = [
            'matricula', 'dataMatricula', 'descricaoImovel', 'endereco',
            'areaPrivativa', 'areaTotal', 'garagem', 'proprietarios',
            'livroAnterior', 'folhaAnterior', 'matriculaAnterior',
            'tipoTitulo', 'valorTitulo', 'comprador', 'cpfCnpj',
            'valorITBI', 'numeroDAM', 'dataPagamentoITBI'
        ];
        
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.value = '';
            }
        });
    } else if (serviceId === 'minuta') {
        const fields = [
            'descricaoImovelCompleta', 'proprietarioAtual', 'tipoOnusAtivo', 'descricaoOnusCompleta',
            'numeroMatricula', 'possiveisErros'
        ];
        
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.value = '';
            }
        });
    } else if (services[serviceId]) {
        // Para outros serviços, limpar campos específicos se existirem
        const serviceFields = services[serviceId].fields;
        serviceFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                element.value = '';
            }
        });
    }
}

// Handle method change
function handleMethodChange(event) {
    const method = event.target.value;
    const chatgptOptions = document.getElementById('chatgptOptions');
    
    if (chatgptOptions) {
        if (method === 'chatgpt') {
            chatgptOptions.style.display = 'block';
        } else {
            chatgptOptions.style.display = 'none';
        }
    }
    
    console.log('Método de processamento alterado para:', method);
}

// Handle model change
function handleModelChange(event) {
    const model = event.target.value;
    console.log('Modelo ChatGPT alterado para:', model);
}

// Handle file select
function handleFileSelect(event, serviceId) {
    const files = event.target.files;
    const processButton = document.getElementById(`processFile${serviceId.charAt(0).toUpperCase() + serviceId.slice(1)}`);
    
    if (serviceId === 'certidao') {
        // Para alta produção - múltiplos arquivos
        if (files && files.length > 0) {
            currentFiles = Array.from(files);
            if (processButton) processButton.disabled = false;
            console.log(`${files.length} arquivo(s) selecionado(s) para ${getServiceName(serviceId)}`);
            showAlert(`${files.length} arquivo(s) selecionado(s) com sucesso!`, 'success');
        } else {
            currentFiles = [];
            if (processButton) processButton.disabled = true;
            console.log('Nenhum arquivo selecionado');
        }
    } else {
        // Para outros serviços - arquivo único
        const file = files[0];
    if (file) {
        currentFile = file;
            if (processButton) processButton.disabled = false;
            console.log(`Arquivo selecionado para ${getServiceName(serviceId)}:`, file.name);
    } else {
        currentFile = null;
            if (processButton) processButton.disabled = true;
            console.log('Nenhum arquivo selecionado');
        }
    }
}

// Process file
async function processFile(serviceId) {
    if (serviceId === 'certidao') {
        // Processamento de alta produção - múltiplos arquivos
        if (!currentFiles || currentFiles.length === 0) {
            showAlert('Nenhum arquivo selecionado', 'warning');
            return;
        }
        
        await processMultipleFiles(serviceId);
    } else {
        // Processamento normal - arquivo único
    if (!currentFile) {
            showAlert('Nenhum arquivo selecionado', 'warning');
        return;
    }
    
        await processSingleFile(serviceId);
    }
}

// Process single file (para outros serviços)
async function processSingleFile(serviceId) {
    try {
        // Exibir status de processamento na aba correspondente
        if (serviceId === 'matricula') {
            document.getElementById('matriculaStatus').innerHTML = '<div class="alert alert-info"><i class="fas fa-spinner fa-spin me-2"></i>Processando arquivo e extraindo dados da matrícula...</div>';
        } else if (serviceId === 'minuta') {
            document.getElementById('minutaStatus').innerHTML = '<div class="alert alert-info"><i class="fas fa-spinner fa-spin me-2"></i>Processando arquivo e extraindo dados da minuta...</div>';
        } else if (serviceId === 'contratos') {
            document.getElementById('contratosStatus').innerHTML = '<div class="alert alert-info"><i class="fas fa-spinner fa-spin me-2"></i>Processando arquivo e extraindo dados dos contratos...</div>';
        } else if (serviceId === 'escrituras') {
            document.getElementById('escriturasStatus').innerHTML = '<div class="alert alert-info"><i class="fas fa-spinner fa-spin me-2"></i>Processando arquivo e extraindo dados das escrituras...</div>';
        }
        console.log(`Iniciando processamento do ${getServiceName(serviceId)}...`);
        
        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('service', serviceId);
        
        // Adicionar configurações de processamento
        const processingMethod = document.querySelector('input[name="processingMethod"]:checked').value;
        formData.append('method', processingMethod);
        
        if (processingMethod === 'chatgpt') {
            const model = document.querySelector('input[name="chatgptModel"]:checked').value;
            formData.append('model', model);
            console.log('🔧 Modelo selecionado para envio:', model);
        }
        
        console.log('Enviando dados para processamento:');
        console.log('Arquivo:', currentFile.name);
        console.log('Serviço:', serviceId);
        console.log('Método:', processingMethod);
        if (processingMethod === 'chatgpt') {
            const model = document.querySelector('input[name="chatgptModel"]:checked').value;
            console.log('Modelo:', model);
        }
        
        // Usar apenas endpoint do ChatGPT (OCR foi removido)
        let endpoint = '/api/process-file';
        console.log('Usando endpoint ChatGPT');
        
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            if (response.status === 429) {
                throw new Error(`Rate limit atingido para o arquivo ${currentFile.name}. Aguarde alguns minutos antes de tentar novamente.`);
            }
            throw new Error(`Erro no processamento do arquivo ${currentFile.name}: HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Usar result.campos do ChatGPT
            if (result.campos) {
                    console.log('🎯 Campos recebidos da API:', result.campos);
                    
                    let mappedData = {};
                    
                    // Mapear campos baseado no serviço
                    if (serviceId === 'matricula') {
                        mappedData = {
                            matricula: result.campos.numero_matricula || '',
                            dataMatricula: result.campos.data_matricula || '',
                            descricaoImovel: result.campos.descricao_imovel || '',
                            endereco: result.campos.endereco || '',
                            areaPrivativa: result.campos.area_privativa || '',
                            areaTotal: result.campos.area_total || '',
                            garagem: result.campos.garagem_vagas || '',
                            proprietarios: result.campos.proprietarios || '',
                            livroAnterior: result.campos.livro_anterior || '',
                            folhaAnterior: result.campos.folha_anterior || '',
                            matriculaAnterior: result.campos.matricula_anterior || '',
                            tipoTitulo: result.campos.tipo_titulo || '',
                            valorTitulo: result.campos.valor_titulo || '',
                            comprador: result.campos.comprador || '',
                            cpfCnpj: result.campos.cpf_cnpj || '',
                            valorITBI: result.campos.valor_itbi || '',
                            numeroDAM: result.campos.numero_dam || '',
                            dataPagamentoITBI: result.campos.data_pagamento_itbi || ''
                        };
                    } else if (serviceId === 'minuta') {
                        mappedData = {
                            descricaoImovelCompleta: result.campos.descricao_imovel_completa || '',
                            proprietarioAtual: result.campos.proprietario_atual || '',
                            tipoOnusAtivo: result.campos.tipo_onus_ativo || '',
                            descricaoOnusCompleta: result.campos.descricao_onus_completa || '',
                            numeroMatricula: result.campos.numero_matricula || '',
                            possiveisErros: result.campos.possiveis_erros || ''
                        };
                    } else if (serviceId === 'contratos') {
                        mappedData = {
                            // 1. Qualificação das Partes - Parte 1
                            nomeParte1: result.campos.nome_parte1 || '',
                            nacionalidadeParte1: result.campos.nacionalidade_parte1 || '',
                            estadoCivilParte1: result.campos.estado_civil_parte1 || '',
                            profissaoParte1: result.campos.profissao_parte1 || '',
                            cpfParte1: result.campos.cpf_parte1 || '',
                            rgParte1: result.campos.rg_parte1 || '',
                            enderecoParte1: result.campos.endereco_parte1 || '',
                            conjugeParte1: result.campos.conjuge_parte1 || '',
                            // 1. Qualificação das Partes - Parte 2
                            nomeParte2: result.campos.nome_parte2 || '',
                            nacionalidadeParte2: result.campos.nacionalidade_parte2 || '',
                            estadoCivilParte2: result.campos.estado_civil_parte2 || '',
                            profissaoParte2: result.campos.profissao_parte2 || '',
                            cpfParte2: result.campos.cpf_parte2 || '',
                            rgParte2: result.campos.rg_parte2 || '',
                            enderecoParte2: result.campos.endereco_parte2 || '',
                            conjugeParte2: result.campos.conjuge_parte2 || '',
                            // 1. Qualificação das Partes - Pessoas Jurídicas
                            razaoSocial: result.campos.razao_social || '',
                            cnpj: result.campos.cnpj || '',
                            enderecoPJ: result.campos.endereco_pj || '',
                            representanteLegal: result.campos.representante_legal || '',
                            instrumentoRepresentacao: result.campos.instrumento_representacao || '',
                            // 2. Identificação do Imóvel
                            enderecoImovel: result.campos.endereco_imovel || '',
                            numeroMatriculaImovel: result.campos.numero_matricula_imovel || '',
                            cartorioRegistro: result.campos.cartorio_registro || '',
                            tipoImovel: result.campos.tipo_imovel || '',
                            descricaoCompletaImovel: result.campos.descricao_completa_imovel || '',
                            origemPropriedade: result.campos.origem_propriedade || '',
                            // 3. Natureza do Negócio Jurídico
                            tipoContrato: result.campos.tipo_contrato || '',
                            finalidadeTransacao: result.campos.finalidade_transacao || '',
                            valorNegocio: result.campos.valor_negocio || '',
                            formaPagamento: result.campos.forma_pagamento || '',
                            condicoesClausulas: result.campos.condicoes_clausulas || '',
                            // 4. Informações Tributárias e Encargos
                            valorITBI: result.campos.valor_itbi || '',
                            itbiPago: result.campos.itbi_pago || '',
                            baseCalculo: result.campos.base_calculo || '',
                            declaracaoIsencao: result.campos.declaracao_isencao || '',
                            itrCcir: result.campos.itr_ccir || '',
                            debitosFiscais: result.campos.debitos_fiscais || '',
                            certidoesNegativas: result.campos.certidoes_negativas || '',
                            // 5. Ônus e Gravames
                            hipoteca: result.campos.hipoteca || '',
                            alienacaoFiduciaria: result.campos.alienacao_fiduciaria || '',
                            usufruto: result.campos.usufruto || '',
                            penhora: result.campos.penhora || '',
                            clausulasInalienabilidade: result.campos.clausulas_inalienabilidade || '',
                            acoesJudiciais: result.campos.acoes_judiciais || '',
                            // 6. Documentos Complementares
                            procuracoes: result.campos.procuracoes || '',
                            escriturasAnteriores: result.campos.escrituras_anteriores || '',
                            contratosPreliminares: result.campos.contratos_preliminares || '',
                            certidoes: result.campos.certidoes || '',
                            // 7. Informações para a Minuta
                            tituloMinuta: result.campos.titulo_minuta || '',
                            identificacaoOutorgantes: result.campos.identificacao_outorgantes || '',
                            clausulasContratuais: result.campos.clausulas_contratuais || '',
                            declaracoesLegais: result.campos.declaracoes_legais || '',
                            responsabilidadeTributos: result.campos.responsabilidade_tributos || '',
                            reconhecimentoFirma: result.campos.reconhecimento_firma || ''
                        };
                    } else if (serviceId === 'escrituras') {
                        mappedData = {
                            // 1. Identificação do Ato
                            tipoEscritura: result.campos.tipo_escritura || '',
                            numeroLivro: result.campos.numero_livro || '',
                            numeroFolha: result.campos.numero_folha || '',
                            dataLavratura: result.campos.data_lavratura || '',
                            nomeTabeliao: result.campos.nome_tabeliao || '',
                            termoEletronico: result.campos.termo_eletronico || '',
                            // 2. Qualificação das Partes - Parte 1
                            nomeParte1Escritura: result.campos.nome_parte1_escritura || '',
                            nacionalidadeParte1Escritura: result.campos.nacionalidade_parte1_escritura || '',
                            estadoCivilParte1Escritura: result.campos.estado_civil_parte1_escritura || '',
                            profissaoParte1Escritura: result.campos.profissao_parte1_escritura || '',
                            cpfParte1Escritura: result.campos.cpf_parte1_escritura || '',
                            rgParte1Escritura: result.campos.rg_parte1_escritura || '',
                            enderecoParte1Escritura: result.campos.endereco_parte1_escritura || '',
                            regimeBensParte1: result.campos.regime_bens_parte1 || '',
                            // 2. Qualificação das Partes - Parte 2
                            nomeParte2Escritura: result.campos.nome_parte2_escritura || '',
                            nacionalidadeParte2Escritura: result.campos.nacionalidade_parte2_escritura || '',
                            estadoCivilParte2Escritura: result.campos.estado_civil_parte2_escritura || '',
                            profissaoParte2Escritura: result.campos.profissao_parte2_escritura || '',
                            cpfParte2Escritura: result.campos.cpf_parte2_escritura || '',
                            rgParte2Escritura: result.campos.rg_parte2_escritura || '',
                            enderecoParte2Escritura: result.campos.endereco_parte2_escritura || '',
                            regimeBensParte2: result.campos.regime_bens_parte2 || '',
                            // 2. Qualificação das Partes - Pessoas Jurídicas
                            razaoSocialEscritura: result.campos.razao_social_escritura || '',
                            cnpjEscritura: result.campos.cnpj_escritura || '',
                            enderecoPJEscritura: result.campos.endereco_pj_escritura || '',
                            representanteLegalEscritura: result.campos.representante_legal_escritura || '',
                            instrumentoRepresentacaoEscritura: result.campos.instrumento_representacao_escritura || '',
                            // 3. Identificação do Imóvel
                            enderecoImovelEscritura: result.campos.endereco_imovel_escritura || '',
                            matriculaEscritura: result.campos.matricula_escritura || '',
                            cartorioRegistroEscritura: result.campos.cartorio_registro_escritura || '',
                            areaTotalEscritura: result.campos.area_total_escritura || '',
                            confrontacoesEscritura: result.campos.confrontacoes_escritura || '',
                            benfeitoriasEscritura: result.campos.benfeitorias_escritura || '',
                            inscricaoCadastral: result.campos.inscricao_cadastral || '',
                            origemPropriedadeEscritura: result.campos.origem_propriedade_escritura || '',
                            // 4. Informações do Negócio Jurídico
                            valorImovelEscritura: result.campos.valor_imovel_escritura || '',
                            formaPagamentoEscritura: result.campos.forma_pagamento_escritura || '',
                            condicoesSuspensivas: result.campos.condicoes_suspensivas || '',
                            participacaoTerceiros: result.campos.participacao_terceiros || '',
                            clausulasEspeciais: result.campos.clausulas_especiais || '',
                            // 5. Tributos e Documentos
                            valorITBIEscritura: result.campos.valor_itbi_escritura || '',
                            declaracaoIsencaoEscritura: result.campos.declaracao_isencao_escritura || '',
                            numeroGuia: result.campos.numero_guia || '',
                            dataGuia: result.campos.data_guia || '',
                            certidoesNegativas: result.campos.certidoes_negativas || '',
                            certidaoEstadoCivil: result.campos.certidao_estado_civil || '',
                            certidaoMatricula: result.campos.certidao_matricula || '',
                            comprovantesResidencia: result.campos.comprovantes_residencia || '',
                            // 6. Procurações
                            outorganteProcura: result.campos.outorgante_procura || '',
                            outorgadoProcura: result.campos.outorgado_procura || '',
                            livroProcura: result.campos.livro_procura || '',
                            folhaProcura: result.campos.folha_procura || '',
                            dataLavraturaProcura: result.campos.data_lavratura_procura || '',
                            poderesConcedidos: result.campos.poderes_concedidos || '',
                            validadeProcura: result.campos.validade_procura || '',
                            procuraEspecifica: result.campos.procura_especifica || '',
                            // 7. Ônus e Gravames
                            existeOnus: result.campos.existe_onus || '',
                            tipoOnusEscritura: result.campos.tipo_onus_escritura || '',
                            clausulasImpeditivas: result.campos.clausulas_impeditivas || '',
                            // 8. Cláusulas e Declarações Importantes
                            declaracaoTributos: result.campos.declaracao_tributos || '',
                            responsabilidadeRegistro: result.campos.responsabilidade_registro || '',
                            declaracaoQuitacao: result.campos.declaracao_quitacao || '',
                            imovelLivreDesembaracado: result.campos.imovel_livre_desembaracado || '',
                            fePublicaTabeliao: result.campos.fe_publica_tabeliao || '',
                            assinaturas: result.campos.assinaturas || ''
                        };
                    }
                    
                    console.log('📊 Dados mapeados:', mappedData);
                    currentData = mappedData;
                    
                    displayExtractedData(mappedData);
                } else {
                    console.warn('⚠️ Nenhum campo encontrado no resultado');
                    currentData = result.data || {};
                    displayExtractedData(result.data || {});
                }
            }
            
            showAlert(`Processamento do ${getServiceName(serviceId)} concluído com sucesso!`, 'success');
            
            // Mostrar informações do modelo usado
            const modelInfo = result.model ? ` (Modelo: ${result.model})` : '';
            console.log(`Processamento concluído${modelInfo}`);
        } else {
            throw new Error(result.error || 'Erro desconhecido no processamento');
        }
        
        // Limpar status ao finalizar
        if (serviceId === 'matricula') {
            document.getElementById('matriculaStatus').innerHTML = '';
        } else if (serviceId === 'minuta') {
            document.getElementById('minutaStatus').innerHTML = '';
        } else if (serviceId === 'contratos') {
            document.getElementById('contratosStatus').innerHTML = '';
        } else if (serviceId === 'escrituras') {
            document.getElementById('escriturasStatus').innerHTML = '';
        }
    } catch (error) {
        console.error('Erro no processamento:', error);
        showAlert(`Erro: ${error.message}`, 'danger');
        // Exibir erro no status
        if (serviceId === 'matricula') {
            document.getElementById('matriculaStatus').innerHTML = `<div class='alert alert-danger'><i class='fas fa-exclamation-triangle me-2'></i>Erro: ${error.message}</div>`;
        } else if (serviceId === 'minuta') {
            document.getElementById('minutaStatus').innerHTML = `<div class='alert alert-danger'><i class='fas fa-exclamation-triangle me-2'></i>Erro: ${error.message}</div>`;
        } else if (serviceId === 'contratos') {
            document.getElementById('contratosStatus').innerHTML = `<div class='alert alert-danger'><i class='fas fa-exclamation-triangle me-2'></i>Erro: ${error.message}</div>`;
        } else if (serviceId === 'escrituras') {
            document.getElementById('escriturasStatus').innerHTML = `<div class='alert alert-danger'><i class='fas fa-exclamation-triangle me-2'></i>Erro: ${error.message}</div>`;
        }
    }
}

// Função removida: extractMatriculaFields não é mais necessária (OCR foi removido)

// Função de delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Process multiple files (para alta produção)
async function processMultipleFiles(serviceId) {
    try {
        console.log(`Iniciando processamento de ${currentFiles.length} arquivo(s) para ${getServiceName(serviceId)}...`);
        
        // Limpar dados anteriores
        processedFiles = [];
        
        // Processar cada arquivo
        for (let i = 0; i < currentFiles.length; i++) {
            const file = currentFiles[i];
            console.log(`Processando arquivo ${i + 1}/${currentFiles.length}: ${file.name}`);
            
            // Adicionar delay entre processamentos para evitar rate limit
            if (i > 0) {
                console.log('Aguardando 3 segundos antes do próximo arquivo...');
                await delay(3000);
            }
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('service', serviceId);
            formData.append('method', 'chatgpt'); // Sempre usar ChatGPT para alta produção
            
            // Obter configurações de processamento
            const processingMethod = document.querySelector('input[name="processingMethod"]:checked').value;
            let useAdvancedModel = 'true'; // Padrão para alta produção
            
            if (processingMethod === 'chatgpt') {
                const model = document.querySelector('input[name="chatgptModel"]:checked').value;
                useAdvancedModel = (model === 'gpt-4o').toString();
                console.log('Modelo selecionado:', model, 'useAdvancedModel:', useAdvancedModel);
            }
            
            formData.append('useAdvancedModel', useAdvancedModel);
            
            // Usar apenas endpoint do ChatGPT (OCR foi removido)
            let endpoint = '/api/process-file';
            console.log('Usando endpoint ChatGPT');
            
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error(`Rate limit atingido para o arquivo ${file.name}. Aguarde alguns minutos antes de tentar novamente.`);
                }
                throw new Error(`Erro no arquivo ${file.name}: HTTP ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                // Adicionar dados processados ao array
                processedFiles.push({
                    fileName: file.name,
                    data: result.data,
                    model: result.model
                });
                
                console.log(`Arquivo ${file.name} processado com sucesso`);
            } else {
                throw new Error(`Erro no processamento do arquivo ${file.name}: ${result.error}`);
            }
        }
        
        // Atualizar interface com os dados processados
        updatePreviewTable();
        showAlert(`${currentFiles.length} arquivo(s) processado(s) com sucesso!`, 'success');
        
    } catch (error) {
        console.error('Erro no processamento de múltiplos arquivos:', error);
        showAlert(`Erro: ${error.message}`, 'danger');
    }
}

// Display extracted data
function displayExtractedData(data) {
    console.log('Exibindo dados:', data);
    
    // Verificar se data existe
    if (!data || typeof data !== 'object') {
        console.error('❌ Dados inválidos para exibição:', data);
        return;
    }
    
    // Verificar se estamos na aba correta
    const activeTab = document.querySelector('.tab-pane.active');
    console.log('🔍 Aba ativa:', activeTab ? activeTab.id : 'nenhuma');
    
    // Determinar campos baseado na aba ativa
    let fields = [];
    if (activeTab && activeTab.id === 'matriculaTab') {
        fields = [
            'matricula', 'dataMatricula', 'descricaoImovel', 'endereco',
            'areaPrivativa', 'areaTotal', 'garagem', 'proprietarios',
            'livroAnterior', 'folhaAnterior', 'matriculaAnterior',
            'tipoTitulo', 'valorTitulo', 'comprador', 'cpfCnpj',
            'valorITBI', 'numeroDAM', 'dataPagamentoITBI'
        ];
    } else if (activeTab && activeTab.id === 'minuta') {
        fields = [
            'descricaoImovelCompleta', 'proprietarioAtual', 'tipoOnusAtivo', 'descricaoOnusCompleta',
            'numeroMatricula', 'possiveisErros'
        ];
    } else if (activeTab && activeTab.id === 'contratos') {
        fields = [
            // 1. Qualificação das Partes - Parte 1
            'nomeParte1', 'nacionalidadeParte1', 'estadoCivilParte1', 'profissaoParte1', 'cpfParte1', 'rgParte1', 'enderecoParte1', 'conjugeParte1',
            // 1. Qualificação das Partes - Parte 2
            'nomeParte2', 'nacionalidadeParte2', 'estadoCivilParte2', 'profissaoParte2', 'cpfParte2', 'rgParte2', 'enderecoParte2', 'conjugeParte2',
            // 1. Qualificação das Partes - Pessoas Jurídicas
            'razaoSocial', 'cnpj', 'enderecoPJ', 'representanteLegal', 'instrumentoRepresentacao',
            // 2. Identificação do Imóvel
            'enderecoImovel', 'numeroMatriculaImovel', 'cartorioRegistro', 'tipoImovel', 'descricaoCompletaImovel', 'origemPropriedade',
            // 3. Natureza do Negócio Jurídico
            'tipoContrato', 'finalidadeTransacao', 'valorNegocio', 'formaPagamento', 'condicoesClausulas',
            // 4. Informações Tributárias e Encargos
            'valorITBI', 'itbiPago', 'baseCalculo', 'declaracaoIsencao', 'itrCcir', 'debitosFiscais', 'certidoesNegativas',
            // 5. Ônus e Gravames
            'hipoteca', 'alienacaoFiduciaria', 'usufruto', 'penhora', 'clausulasInalienabilidade', 'acoesJudiciais',
            // 6. Documentos Complementares
            'procuracoes', 'escriturasAnteriores', 'contratosPreliminares', 'certidoes',
            // 7. Informações para a Minuta
            'tituloMinuta', 'identificacaoOutorgantes', 'clausulasContratuais', 'declaracoesLegais', 'responsabilidadeTributos', 'reconhecimentoFirma'
        ];
    } else if (activeTab && activeTab.id === 'escrituras') {
        fields = [
            // 1. Identificação do Ato
            'tipoEscritura', 'numeroLivro', 'numeroFolha', 'dataLavratura', 'nomeTabeliao', 'termoEletronico',
            // 2. Qualificação das Partes - Parte 1
            'nomeParte1Escritura', 'nacionalidadeParte1Escritura', 'estadoCivilParte1Escritura', 'profissaoParte1Escritura', 'cpfParte1Escritura', 'rgParte1Escritura', 'enderecoParte1Escritura', 'regimeBensParte1',
            // 2. Qualificação das Partes - Parte 2
            'nomeParte2Escritura', 'nacionalidadeParte2Escritura', 'estadoCivilParte2Escritura', 'profissaoParte2Escritura', 'cpfParte2Escritura', 'rgParte2Escritura', 'enderecoParte2Escritura', 'regimeBensParte2',
            // 2. Qualificação das Partes - Pessoas Jurídicas
            'razaoSocialEscritura', 'cnpjEscritura', 'enderecoPJEscritura', 'representanteLegalEscritura', 'instrumentoRepresentacaoEscritura',
            // 3. Identificação do Imóvel
            'enderecoImovelEscritura', 'matriculaEscritura', 'cartorioRegistroEscritura', 'areaTotalEscritura', 'confrontacoesEscritura', 'benfeitoriasEscritura', 'inscricaoCadastral', 'origemPropriedadeEscritura',
            // 4. Informações do Negócio Jurídico
            'valorImovelEscritura', 'formaPagamentoEscritura', 'condicoesSuspensivas', 'participacaoTerceiros', 'clausulasEspeciais',
            // 5. Tributos e Documentos
            'valorITBIEscritura', 'declaracaoIsencaoEscritura', 'numeroGuia', 'dataGuia', 'certidoesNegativas', 'certidaoEstadoCivil', 'certidaoMatricula', 'comprovantesResidencia',
            // 6. Procurações
            'outorganteProcura', 'outorgadoProcura', 'livroProcura', 'folhaProcura', 'dataLavraturaProcura', 'poderesConcedidos', 'validadeProcura', 'procuraEspecifica',
            // 7. Ônus e Gravames
            'existeOnus', 'tipoOnusEscritura', 'clausulasImpeditivas',
            // 8. Cláusulas e Declarações Importantes
            'declaracaoTributos', 'responsabilidadeRegistro', 'declaracaoQuitacao', 'imovelLivreDesembaracado', 'fePublicaTabeliao', 'assinaturas'
        ];
    } else {
        console.warn('⚠️ Aba não reconhecida para exibição de dados');
        return;
    }
    
    let camposPreenchidos = 0;
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            let value = data[field];
            
            // Log específico para campos importantes
            if (field === 'matricula' || field === 'numeroMinuta') {
                console.log(`🔍 Debug preenchimento campo ${field}:`);
                console.log('  - Valor recebido:', value);
                console.log('  - Tipo do valor:', typeof value);
                console.log('  - Elemento encontrado:', !!element);
                console.log('  - Elemento ID:', element.id);
                console.log('  - Elemento value antes:', element.value);
            }
            
            // Converter para string e tratar valores especiais
            if (value === null || value === undefined) {
                value = '';
            } else if (typeof value === 'object') {
                // Se for objeto, tentar converter para string
                value = JSON.stringify(value);
            } else {
                value = String(value);
            }
            
            element.value = value;
            
            // Log específico para campos importantes após definir valor
            if (field === 'matricula' || field === 'numeroMinuta') {
                console.log('  - Elemento value depois:', element.value);
                console.log('  - Valor definido com sucesso:', element.value === value);
            }
            
            if (value.trim()) {
                camposPreenchidos++;
                console.log(`✅ Campo ${field} preenchido: ${value}`);
            } else {
                console.log(`⚠️ Campo ${field} vazio`);
            }
        } else {
            console.error(`❌ Elemento HTML não encontrado: ${field}`);
        }
    });
    
    console.log(`📊 Total de campos preenchidos: ${camposPreenchidos}/${fields.length}`);
}

// Download functions
function downloadWordFile(serviceId = currentService) {
    console.log('Download Word chamado');
    if (!currentData) {
        showAlert('Nenhum dado disponível para download', 'warning');
        return;
    }
    
    const serviceName = getServiceName(serviceId).toLowerCase().replace(/\s+/g, '_');
    const content = formatDataForDownload(currentData);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dados_${serviceName}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showAlert(`Arquivo ${getServiceName(serviceId)} baixado com sucesso!`, 'success');
}

function downloadPDFFile(serviceId = currentService) {
    console.log('Download PDF chamado');
    if (!currentData) {
        showAlert('Nenhum dado disponível para download', 'warning');
        return;
    }

    try {
        const serviceName = getServiceName(serviceId).toLowerCase().replace(/\s+/g, '_');
        const doc = new window.jspdf.jsPDF();
        const content = formatDataForDownload(currentData);
        const lines = doc.splitTextToSize(content, 180); // largura da página
        const lineHeight = 10; // altura de cada linha em pt
        const marginTop = 10;
        const marginLeft = 10;
        const pageHeight = doc.internal.pageSize.getHeight();
        let cursorY = marginTop;

        lines.forEach((line, idx) => {
            if (cursorY + lineHeight > pageHeight - marginTop) {
                doc.addPage();
                cursorY = marginTop;
            }
            doc.text(line, marginLeft, cursorY);
            cursorY += lineHeight;
        });

        doc.save(`dados_${serviceName}_${new Date().toISOString().slice(0, 10)}.pdf`);
        showAlert(`PDF ${getServiceName(serviceId)} baixado com sucesso!`, 'success');
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        showAlert('Erro ao gerar PDF. Verifique se a biblioteca jsPDF está carregada.', 'error');
    }
}

function downloadJSONFile(serviceId = currentService) {
    console.log('Download JSON chamado');
    if (!currentData) {
        showAlert('Nenhum dado disponível para download', 'warning');
        return;
    }
    
    const serviceName = getServiceName(serviceId).toLowerCase().replace(/\s+/g, '_');
    const jsonData = {
        metadata: {
            service: getServiceName(serviceId),
            extractedAt: new Date().toISOString(),
            fileName: currentFile ? currentFile.name : 'unknown'
        },
        data: currentData
    };
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dados_${serviceName}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showAlert(`JSON ${getServiceName(serviceId)} baixado com sucesso!`, 'success');
}

// Format data for download
function formatDataForDownload(data) {
    const serviceName = getServiceName(currentService);
    let content = `DADOS DO ${serviceName.toUpperCase()}\n`;
    content += '='.repeat(50) + '\n\n';
    
    if (currentService === 'matricula') {
        content += 'INFORMAÇÕES BÁSICAS\n';
        content += `Número da Matrícula: ${data.matricula || 'Não informado'}\n`;
        content += `Data da Matrícula: ${data.dataMatricula || 'Não informado'}\n`;
        content += `Descrição do Imóvel: ${data.descricaoImovel || 'Não informado'}\n`;
        content += `Endereço: ${data.endereco || 'Não informado'}\n\n`;
        
        content += 'ÁREAS E GARAGEM\n';
        content += `Área Privativa: ${data.areaPrivativa || 'Não informado'} m²\n`;
        content += `Área Total: ${data.areaTotal || 'Não informado'} m²\n`;
        content += `Garagem: ${data.garagem || 'Não informado'}\n\n`;
        
        content += 'PROPRIETÁRIOS\n';
        content += `Nome: ${data.proprietarios || 'Não informado'}\n`;
        content += `Livro Anterior: ${data.livroAnterior || 'Não informado'}\n`;
        content += `Folha Anterior: ${data.folhaAnterior || 'Não informado'}\n`;
        content += `Matrícula Anterior: ${data.matriculaAnterior || 'Não informado'}\n\n`;
        
        content += 'TRANSAÇÃO\n';
        content += `Tipo do Título: ${data.tipoTitulo || 'Não informado'}\n`;
        content += `Valor do Título: ${data.valorTitulo || 'Não informado'}\n`;
        content += `Comprador: ${data.comprador || 'Não informado'}\n`;
        content += `CPF/CNPJ: ${data.cpfCnpj || 'Não informado'}\n\n`;
        
        content += 'ITBI\n';
        content += `Valor do ITBI: ${data.valorITBI || 'Não informado'}\n`;
        content += `Número da DAM: ${data.numeroDAM || 'Não informado'}\n`;
        content += `Data de Pagamento: ${data.dataPagamentoITBI || 'Não informado'}\n\n`;
    } else if (currentService === 'minuta') {
        content += 'DESCRIÇÃO DO IMÓVEL\n';
        content += `Descrição Completa: ${data.descricaoImovelCompleta || 'Não informado'}\n\n`;
        
        content += 'PROPRIETÁRIO ATUAL\n';
        content += `Nome: ${data.proprietarioAtual || 'Não informado'}\n\n`;
        
        content += 'ÔNUS ATIVO\n';
        content += `Tipo de Ônus: ${data.tipoOnusAtivo || 'Não informado'}\n`;
        content += `Descrição Completa: ${data.descricaoOnusCompleta || 'Não informado'}\n\n`;
        
        content += 'INFORMAÇÕES ADICIONAIS\n';
        content += `Número da Matrícula: ${data.numeroMatricula || 'Não informado'}\n`;
        content += `Possíveis Erros: ${data.possiveisErros || 'Nenhum erro encontrado'}\n\n`;
    } else if (currentService === 'contratos') {
        content += '1. QUALIFICAÇÃO DAS PARTES\n';
        content += 'Parte 1 (Vendedor/Outorgante):\n';
        content += `Nome Completo: ${data.nomeParte1 || 'Não informado'}\n`;
        content += `Nacionalidade: ${data.nacionalidadeParte1 || 'Não informado'}\n`;
        content += `Estado Civil: ${data.estadoCivilParte1 || 'Não informado'}\n`;
        content += `Profissão: ${data.profissaoParte1 || 'Não informado'}\n`;
        content += `CPF: ${data.cpfParte1 || 'Não informado'}\n`;
        content += `RG: ${data.rgParte1 || 'Não informado'}\n`;
        content += `Endereço: ${data.enderecoParte1 || 'Não informado'}\n`;
        content += `Cônjuge: ${data.conjugeParte1 || 'Não informado'}\n\n`;
        
        content += 'Parte 2 (Comprador/Outorgado):\n';
        content += `Nome Completo: ${data.nomeParte2 || 'Não informado'}\n`;
        content += `Nacionalidade: ${data.nacionalidadeParte2 || 'Não informado'}\n`;
        content += `Estado Civil: ${data.estadoCivilParte2 || 'Não informado'}\n`;
        content += `Profissão: ${data.profissaoParte2 || 'Não informado'}\n`;
        content += `CPF: ${data.cpfParte2 || 'Não informado'}\n`;
        content += `RG: ${data.rgParte2 || 'Não informado'}\n`;
        content += `Endereço: ${data.enderecoParte2 || 'Não informado'}\n`;
        content += `Cônjuge: ${data.conjugeParte2 || 'Não informado'}\n\n`;
        
        content += 'Pessoas Jurídicas:\n';
        content += `Razão Social: ${data.razaoSocial || 'Não informado'}\n`;
        content += `CNPJ: ${data.cnpj || 'Não informado'}\n`;
        content += `Endereço: ${data.enderecoPJ || 'Não informado'}\n`;
        content += `Representante Legal: ${data.representanteLegal || 'Não informado'}\n`;
        content += `Instrumento de Representação: ${data.instrumentoRepresentacao || 'Não informado'}\n\n`;
        
        content += '2. IDENTIFICAÇÃO DO IMÓVEL\n';
        content += `Endereço Completo: ${data.enderecoImovel || 'Não informado'}\n`;
        content += `Número da Matrícula: ${data.numeroMatriculaImovel || 'Não informado'}\n`;
        content += `Cartório de Registro: ${data.cartorioRegistro || 'Não informado'}\n`;
        content += `Tipo do Imóvel: ${data.tipoImovel || 'Não informado'}\n`;
        content += `Descrição Completa: ${data.descricaoCompletaImovel || 'Não informado'}\n`;
        content += `Origem da Propriedade: ${data.origemPropriedade || 'Não informado'}\n\n`;
        
        content += '3. NATUREZA DO NEGÓCIO JURÍDICO\n';
        content += `Tipo de Contrato: ${data.tipoContrato || 'Não informado'}\n`;
        content += `Finalidade da Transação: ${data.finalidadeTransacao || 'Não informado'}\n`;
        content += `Valor do Negócio: ${data.valorNegocio || 'Não informado'}\n`;
        content += `Forma de Pagamento: ${data.formaPagamento || 'Não informado'}\n`;
        content += `Condições e Cláusulas: ${data.condicoesClausulas || 'Não informado'}\n\n`;
        
        content += '4. INFORMAÇÕES TRIBUTÁRIAS E ENCARGOS\n';
        content += `Valor do ITBI: ${data.valorITBI || 'Não informado'}\n`;
        content += `ITBI Pago: ${data.itbiPago || 'Não informado'}\n`;
        content += `Base de Cálculo: ${data.baseCalculo || 'Não informado'}\n`;
        content += `Declaração de Isenção: ${data.declaracaoIsencao || 'Não informado'}\n`;
        content += `ITR ou CCIR: ${data.itrCcir || 'Não informado'}\n`;
        content += `Débitos Fiscais: ${data.debitosFiscais || 'Não informado'}\n`;
        content += `Certidões Negativas: ${data.certidoesNegativas || 'Não informado'}\n\n`;
        
        content += '5. ÔNUS E GRAVAMES\n';
        content += `Hipoteca: ${data.hipoteca || 'Não informado'}\n`;
        content += `Alienação Fiduciária: ${data.alienacaoFiduciaria || 'Não informado'}\n`;
        content += `Usufruto: ${data.usufruto || 'Não informado'}\n`;
        content += `Penhora: ${data.penhora || 'Não informado'}\n`;
        content += `Cláusulas de Inalienabilidade: ${data.clausulasInalienabilidade || 'Não informado'}\n`;
        content += `Ações Judiciais: ${data.acoesJudiciais || 'Não informado'}\n\n`;
        
        content += '6. DOCUMENTOS COMPLEMENTARES\n';
        content += `Procurações: ${data.procuracoes || 'Não informado'}\n`;
        content += `Escrituras Anteriores: ${data.escriturasAnteriores || 'Não informado'}\n`;
        content += `Contratos Preliminares: ${data.contratosPreliminares || 'Não informado'}\n`;
        content += `Certidões: ${data.certidoes || 'Não informado'}\n\n`;
        
        content += '7. INFORMAÇÕES PARA A MINUTA\n';
        content += `Título da Minuta: ${data.tituloMinuta || 'Não informado'}\n`;
        content += `Identificação dos Outorgantes: ${data.identificacaoOutorgantes || 'Não informado'}\n`;
        content += `Cláusulas Contratuais: ${data.clausulasContratuais || 'Não informado'}\n`;
        content += `Declarações Legais: ${data.declaracoesLegais || 'Não informado'}\n`;
        content += `Responsabilidade por Tributos: ${data.responsabilidadeTributos || 'Não informado'}\n`;
        content += `Reconhecimento de Firma: ${data.reconhecimentoFirma || 'Não informado'}\n\n`;
    } else if (currentService === 'escrituras') {
        content += '1. IDENTIFICAÇÃO DO ATO\n';
        content += `Tipo de Escritura: ${data.tipoEscritura || 'Não informado'}\n`;
        content += `Número do Livro: ${data.numeroLivro || 'Não informado'}\n`;
        content += `Número da Folha: ${data.numeroFolha || 'Não informado'}\n`;
        content += `Data da Lavratura: ${data.dataLavratura || 'Não informado'}\n`;
        content += `Nome do Tabelião: ${data.nomeTabeliao || 'Não informado'}\n`;
        content += `Termo Eletrônico: ${data.termoEletronico || 'Não informado'}\n\n`;
        
        content += '2. QUALIFICAÇÃO DAS PARTES\n';
        content += 'Parte 1 (Outorgante):\n';
        content += `Nome Completo: ${data.nomeParte1Escritura || 'Não informado'}\n`;
        content += `Nacionalidade: ${data.nacionalidadeParte1Escritura || 'Não informado'}\n`;
        content += `Estado Civil: ${data.estadoCivilParte1Escritura || 'Não informado'}\n`;
        content += `Profissão: ${data.profissaoParte1Escritura || 'Não informado'}\n`;
        content += `CPF: ${data.cpfParte1Escritura || 'Não informado'}\n`;
        content += `RG: ${data.rgParte1Escritura || 'Não informado'}\n`;
        content += `Endereço: ${data.enderecoParte1Escritura || 'Não informado'}\n`;
        content += `Regime de Bens: ${data.regimeBensParte1 || 'Não informado'}\n\n`;
        
        content += 'Parte 2 (Outorgado):\n';
        content += `Nome Completo: ${data.nomeParte2Escritura || 'Não informado'}\n`;
        content += `Nacionalidade: ${data.nacionalidadeParte2Escritura || 'Não informado'}\n`;
        content += `Estado Civil: ${data.estadoCivilParte2Escritura || 'Não informado'}\n`;
        content += `Profissão: ${data.profissaoParte2Escritura || 'Não informado'}\n`;
        content += `CPF: ${data.cpfParte2Escritura || 'Não informado'}\n`;
        content += `RG: ${data.rgParte2Escritura || 'Não informado'}\n`;
        content += `Endereço: ${data.enderecoParte2Escritura || 'Não informado'}\n`;
        content += `Regime de Bens: ${data.regimeBensParte2 || 'Não informado'}\n\n`;
        
        content += 'Pessoas Jurídicas:\n';
        content += `Razão Social: ${data.razaoSocialEscritura || 'Não informado'}\n`;
        content += `CNPJ: ${data.cnpjEscritura || 'Não informado'}\n`;
        content += `Endereço: ${data.enderecoPJEscritura || 'Não informado'}\n`;
        content += `Representante Legal: ${data.representanteLegalEscritura || 'Não informado'}\n`;
        content += `Instrumento de Representação: ${data.instrumentoRepresentacaoEscritura || 'Não informado'}\n\n`;
        
        content += '3. IDENTIFICAÇÃO DO IMÓVEL\n';
        content += `Endereço Completo: ${data.enderecoImovelEscritura || 'Não informado'}\n`;
        content += `Matrícula: ${data.matriculaEscritura || 'Não informado'}\n`;
        content += `Cartório de Registro: ${data.cartorioRegistroEscritura || 'Não informado'}\n`;
        content += `Área Total: ${data.areaTotalEscritura || 'Não informado'}\n`;
        content += `Confrontações: ${data.confrontacoesEscritura || 'Não informado'}\n`;
        content += `Benfeitorias: ${data.benfeitoriasEscritura || 'Não informado'}\n`;
        content += `Inscrição Cadastral: ${data.inscricaoCadastral || 'Não informado'}\n`;
        content += `Origem da Propriedade: ${data.origemPropriedadeEscritura || 'Não informado'}\n\n`;
        
        content += '4. INFORMAÇÕES DO NEGÓCIO JURÍDICO\n';
        content += `Valor do Imóvel: ${data.valorImovelEscritura || 'Não informado'}\n`;
        content += `Forma de Pagamento: ${data.formaPagamentoEscritura || 'Não informado'}\n`;
        content += `Condições Suspensivas: ${data.condicoesSuspensivas || 'Não informado'}\n`;
        content += `Participação de Terceiros: ${data.participacaoTerceiros || 'Não informado'}\n`;
        content += `Cláusulas Especiais: ${data.clausulasEspeciais || 'Não informado'}\n\n`;
        
        content += '5. TRIBUTOS E DOCUMENTOS\n';
        content += `Valor do ITBI: ${data.valorITBIEscritura || 'Não informado'}\n`;
        content += `Declaração de Isenção: ${data.declaracaoIsencaoEscritura || 'Não informado'}\n`;
        content += `Número da Guia: ${data.numeroGuia || 'Não informado'}\n`;
        content += `Data da Guia: ${data.dataGuia || 'Não informado'}\n`;
        content += `Certidões Negativas: ${data.certidoesNegativas || 'Não informado'}\n`;
        content += `Certidão de Estado Civil: ${data.certidaoEstadoCivil || 'Não informado'}\n`;
        content += `Certidão da Matrícula: ${data.certidaoMatricula || 'Não informado'}\n`;
        content += `Comprovantes de Residência: ${data.comprovantesResidencia || 'Não informado'}\n\n`;
        
        content += '6. PROCURAÇÕES\n';
        content += `Outorgante: ${data.outorganteProcura || 'Não informado'}\n`;
        content += `Outorgado: ${data.outorgadoProcura || 'Não informado'}\n`;
        content += `Livro: ${data.livroProcura || 'Não informado'}\n`;
        content += `Folha: ${data.folhaProcura || 'Não informado'}\n`;
        content += `Data de Lavratura: ${data.dataLavraturaProcura || 'Não informado'}\n`;
        content += `Poderes Concedidos: ${data.poderesConcedidos || 'Não informado'}\n`;
        content += `Validade: ${data.validadeProcura || 'Não informado'}\n`;
        content += `Procuração Específica: ${data.procuraEspecifica || 'Não informado'}\n\n`;
        
        content += '7. ÔNUS E GRAVAMES\n';
        content += `Existe Ônus: ${data.existeOnus || 'Não informado'}\n`;
        content += `Tipo de Ônus: ${data.tipoOnusEscritura || 'Não informado'}\n`;
        content += `Cláusulas Impeditivas: ${data.clausulasImpeditivas || 'Não informado'}\n\n`;
        
        content += '8. CLÁUSULAS E DECLARAÇÕES IMPORTANTES\n';
        content += `Declaração de Tributos: ${data.declaracaoTributos || 'Não informado'}\n`;
        content += `Responsabilidade pelo Registro: ${data.responsabilidadeRegistro || 'Não informado'}\n`;
        content += `Declaração de Quitação: ${data.declaracaoQuitacao || 'Não informado'}\n`;
        content += `Imóvel Livre e Desembaraçado: ${data.imovelLivreDesembaracado || 'Não informado'}\n`;
        content += `Fé Pública do Tabelião: ${data.fePublicaTabeliao || 'Não informado'}\n`;
        content += `Assinaturas: ${data.assinaturas || 'Não informado'}\n\n`;
    } else {
        content += 'DADOS EXTRAÍDOS\n';
        content += 'Os dados específicos deste serviço serão implementados em breve.\n\n';
    }
    
    content += `Serviço: ${serviceName}\n`;
    content += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
    content += 'Sistema Axion - Solução Registral';
    
    return content;
}

// Utility functions
function showAlert(message, type = 'info') {
    // Criar alerta temporário
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Update preview table
function updatePreviewTable() {
    console.log('🔄 Atualizando tabela de preview...');
    console.log('📊 Arquivos processados:', processedFiles.length);
    
    // Determinar qual aba está ativa
    const activeTab = document.querySelector('.tab-pane.active');
    const isCertidaoTab = activeTab && activeTab.id === 'certidao';
    
    console.log('📋 Aba ativa:', activeTab ? activeTab.id : 'nenhuma');
    console.log('🎯 É aba certidão:', isCertidaoTab);
    
    // Selecionar elementos baseado na aba ativa
    const tableContainer = document.getElementById(isCertidaoTab ? 'previewTableContainerCertidao' : 'previewTableContainer');
    const noDataMessage = document.getElementById(isCertidaoTab ? 'noDataMessageCertidao' : 'noDataMessage');
    const tableBody = document.getElementById(isCertidaoTab ? 'previewTableBodyCertidao' : 'previewTableBody');
    const fileCount = document.getElementById(isCertidaoTab ? 'fileCountCertidao' : 'fileCount');
    const downloadCSVBtn = document.getElementById(isCertidaoTab ? 'downloadCSVCertidao' : 'downloadCSV');
    const downloadExcelBtn = document.getElementById(isCertidaoTab ? 'downloadExcelCertidao' : 'downloadExcel');
    
    console.log('🔍 Elementos encontrados:', {
        tableContainer: !!tableContainer,
        noDataMessage: !!noDataMessage,
        tableBody: !!tableBody,
        fileCount: !!fileCount,
        downloadCSVBtn: !!downloadCSVBtn,
        downloadExcelBtn: !!downloadExcelBtn,
        isCertidaoTab: isCertidaoTab
    });
    
    if (processedFiles.length > 0) {
        // Mostrar tabela e esconder mensagem
        tableContainer.style.display = 'block';
        noDataMessage.style.display = 'none';
        
        // Atualizar contador
        fileCount.textContent = processedFiles.length;
        
        // Limpar tabela
        tableBody.innerHTML = '';
        
        // Adicionar dados à tabela
        processedFiles.forEach((fileData, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${fileData.data.numeroMatricula || 'Não encontrado'}</td>
                <td>${fileData.data.textoInicial || 'Não encontrado'}</td>
                <td>${fileData.data.atoAverbacao || 'Não encontrado'}</td>
                <td><small class="text-muted">${fileData.fileName}</small></td>
            `;
            tableBody.appendChild(row);
        });
        
        // Habilitar botões de download
        downloadCSVBtn.disabled = false;
        downloadExcelBtn.disabled = false;
        
        console.log('✅ Tabela atualizada com sucesso');
        
    } else {
        // Esconder tabela e mostrar mensagem
        tableContainer.style.display = 'none';
        noDataMessage.style.display = 'block';
        downloadCSVBtn.disabled = true;
        downloadExcelBtn.disabled = true;
        fileCount.textContent = '0';
        
        console.log('📭 Nenhum dado para exibir');
    }
}

// Download CSV
function downloadCSV() {
    if (processedFiles.length === 0) {
        showAlert('Nenhum dado disponível para download', 'warning');
        return;
    }
    
    // Criar cabeçalho CSV
    let csvContent = 'Matrícula,Imóvel,Alienação,Arquivo\n';
    
    // Adicionar dados
    processedFiles.forEach(fileData => {
        const row = [
            `"${fileData.data.numeroMatricula || ''}"`,
            `"${fileData.data.textoInicial || ''}"`,
            `"${fileData.data.atoAverbacao || ''}"`,
            `"${fileData.fileName}"`
        ].join(',');
        csvContent += row + '\n';
    });
    
    // Criar e baixar arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matriculas_1ri_alta_producao_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showAlert('Arquivo CSV baixado com sucesso!', 'success');
}

// Download Excel
function downloadExcel() {
    if (processedFiles.length === 0) {
        showAlert('Nenhum dado disponível para download', 'warning');
        return;
    }
    
    // Criar conteúdo HTML para Excel
    let htmlContent = `
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
            </style>
        </head>
        <body>
            <table>
                <thead>
                    <tr>
                        <th>Matrícula</th>
                        <th>Imóvel</th>
                        <th>Alienação</th>
                        <th>Arquivo</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Adicionar dados
    processedFiles.forEach(fileData => {
        htmlContent += `
            <tr>
                <td>${fileData.data.numeroMatricula || ''}</td>
                <td>${fileData.data.textoInicial || ''}</td>
                <td>${fileData.data.atoAverbacao || ''}</td>
                <td>${fileData.fileName}</td>
            </tr>
        `;
    });
    
    htmlContent += `
                </tbody>
            </table>
        </body>
        </html>
    `;
    
    // Criar e baixar arquivo
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matriculas_1ri_alta_producao_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showAlert('Arquivo Excel baixado com sucesso!', 'success');
}

// Função para download de arquivos OCR
async function downloadOCRFile(downloadUrl, filename) {
    try {
        const response = await fetch(downloadUrl);
        if (!response.ok) {
            throw new Error(`Erro no download: ${response.status}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showAlert('PDF pesquisável baixado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro no download:', error);
        showAlert(`Erro no download: ${error.message}`, 'danger');
    }
}