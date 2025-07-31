// App Axion - Sistema de Múltiplos Serviços
let currentData = null;
let currentFile = null;
let currentService = 'matricula'; // Serviço atual

// Variáveis para alta produção (múltiplos arquivos)
let processedFiles = []; // Array para armazenar dados de múltiplos arquivos
let currentFiles = []; // Array para armazenar arquivos selecionados

// Variáveis para memorial
let memorialData = null; // Dados do processamento de memorial

// Configuração dos serviços
const services = {
    matricula: {
        name: 'Matrícula 3º RI',
        icon: 'fas fa-file-contract',
        fields: [
            // CADASTRO
            'inscricaoImobiliaria', 'rip',
            // DADOS DO IMÓVEL
            'tipoImovel', 'tipoLogradouro', 'cep', 'nomeLogradouro', 'numeroLote', 'bloco', 'pavimento', 'andar', 'loteamento', 'numeroLoteamento', 'quadra', 'bairro', 'cidade', 'dominialidade', 'areaTotal', 'areaConstruida', 'areaPrivativa', 'areaUsoComum', 'areaCorrespondente', 'fracaoIdeal',
            // DADOS PESSOAIS
            'cpfCnpj', 'nomeCompleto', 'sexo', 'nacionalidade', 'estadoCivil', 'profissao', 'rg', 'cnh', 'enderecoCompleto', 'regimeCasamento', 'dataCasamento', 'matriculaCasamento', 'naturezaJuridica', 'representanteLegal',
            // INFORMAÇÕES UTILIZADAS PARA OS ATOS
            'valorTransacao', 'valorAvaliacao', 'dataAlienacao', 'formaAlienacao', 'valorDivida', 'valorAlienacaoContrato', 'tipoOnus'
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
    
    // Opções do ChatGPT sempre visíveis (OCR foi removido)
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
    // NOTA: fileInputQualificacao REMOVIDO - gerenciado exclusivamente por qualificacao.js
    const fileInputs = [
        'fileInputMatricula',
        'fileInputMinuta',
        'fileInputContratos',
        'fileInputEscrituras',
        // 'fileInputQualificacao', // REMOVIDO: evitar event listeners duplicados
        'fileInputMemorial',
        'fileInputOCR'
    ];
    
    fileInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            const serviceId = inputId.replace('fileInput', '').toLowerCase();
            input.addEventListener('change', (event) => handleFileSelect(event, serviceId));
            console.log(`✅ File input listener configurado para ${serviceId} (${inputId})`);
        } else {
            console.log(`❌ File input não encontrado: ${inputId}`);
        }
    });
    
    // Process button listeners
    // NOTA: processFileQualificacao REMOVIDO - gerenciado exclusivamente por qualificacao.js
    // NOTA: processFileMemorial REMOVIDO - gerenciado exclusivamente por main.js
    // NOTA: processFileCertidao REMOVIDO - gerenciado exclusivamente por main.js
    const processButtons = [
        'processFileMatricula',
        'processFileMinuta',
        'processFileContratos',
        'processFileEscrituras',
        // 'processFileQualificacao', // REMOVIDO: evitar event listeners duplicados
        // 'processFileMemorial', // REMOVIDO: gerenciado pelo main.js
        // 'processFileCertidao', // REMOVIDO: gerenciado pelo main.js
        'processFileOCR'
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
    
    // OCR specific listeners
    const processOCRBtn = document.getElementById('processFileOCR');
    if (processOCRBtn) {
        processOCRBtn.addEventListener('click', processOCRFile);
        console.log('✅ Process OCR button listener configurado');
    }
    
    const downloadOCRPDFBtn = document.getElementById('downloadOCRPDF');
    if (downloadOCRPDFBtn) {
        downloadOCRPDFBtn.addEventListener('click', downloadOCRPDF);
        console.log('✅ Download OCR PDF button listener configurado');
    }
    
    const downloadOCRTextBtn = document.getElementById('downloadOCRText');
    if (downloadOCRTextBtn) {
        downloadOCRTextBtn.addEventListener('click', downloadOCRText);
        console.log('✅ Download OCR Text button listener configurado');
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
                    let result;
                    try {
                        result = await response.json();
                    } catch (jsonError) {
                        const textResponse = await response.text();
                        console.error('Erro ao fazer parse do JSON:', jsonError);
                        console.error('Resposta recebida:', textResponse);
                        throw new Error('Resposta inválida do servidor');
                    }
                    
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
                    let errorData;
                    try {
                        errorData = await response.json();
                    } catch (jsonError) {
                        const textResponse = await response.text();
                        console.error('Erro ao fazer parse do JSON de erro:', jsonError);
                        console.error('Resposta de erro recebida:', textResponse);
                        throw new Error(`Erro HTTP: ${response.status}`);
                    }
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
            // CADASTRO
            'inscricaoImobiliaria', 'rip',
            // DADOS DO IMÓVEL
            'tipoImovel', 'tipoLogradouro', 'cep', 'nomeLogradouro', 'numeroLote', 'bloco', 'pavimento', 'andar', 'loteamento', 'numeroLoteamento', 'quadra', 'bairro', 'cidade', 'dominialidade', 'areaTotal', 'areaConstruida', 'areaPrivativa', 'areaUsoComum', 'areaCorrespondente', 'fracaoIdeal',
            // DADOS PESSOAIS
            'cpfCnpj', 'nomeCompleto', 'sexo', 'nacionalidade', 'estadoCivil', 'profissao', 'rg', 'cnh', 'enderecoCompleto', 'regimeCasamento', 'dataCasamento', 'matriculaCasamento', 'naturezaJuridica', 'representanteLegal',
            // INFORMAÇÕES UTILIZADAS PARA OS ATOS
            'valorTransacao', 'valorAvaliacao', 'dataAlienacao', 'formaAlienacao', 'valorDivida', 'valorAlienacaoContrato', 'tipoOnus'
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
    console.log('Método de processamento alterado para:', method);
    // OCR foi removido, apenas ChatGPT disponível
}

// Handle model change
function handleModelChange(event) {
    const model = event.target.value;
    console.log('Modelo ChatGPT alterado para:', model);
}

// Handle file select
function handleFileSelect(event, serviceId) {
    const files = event.target.files;
    let buttonId;
    
    // Tratamento especial para OCR (mantém maiúsculo)
    if (serviceId === 'ocr') {
        buttonId = 'processFileOCR';
    } else {
        buttonId = `processFile${serviceId.charAt(0).toUpperCase() + serviceId.slice(1)}`;
    }
    
    const processButton = document.getElementById(buttonId);
    
    console.log(`🔍 handleFileSelect chamado para ${serviceId}`);
    console.log(`🔍 Procurando botão: ${buttonId}`);
    console.log(`🔍 Botão encontrado:`, processButton);
    console.log(`🔍 Arquivos selecionados:`, files);
    
    if (serviceId === 'certidao' || serviceId === 'memorial') {
        // Para alta produção - múltiplos arquivos
        if (files && files.length > 0) {
            currentFiles = Array.from(files);
            if (processButton) {
                processButton.disabled = false;
                console.log(`✅ Botão habilitado para ${serviceId}`);
            }
            console.log(`${files.length} arquivo(s) selecionado(s) para ${getServiceName(serviceId)}`);
            showAlert(`${files.length} arquivo(s) selecionado(s) com sucesso!`, 'success');
        } else {
            currentFiles = [];
            if (processButton) {
                processButton.disabled = true;
                console.log(`❌ Botão desabilitado para ${serviceId}`);
            }
            console.log('Nenhum arquivo selecionado');
        }
    } else {
        // Para outros serviços - arquivo único
        const file = files[0];
        if (file) {
            currentFile = file;
            if (processButton) {
                processButton.disabled = false;
                console.log(`✅ Botão habilitado para ${serviceId}`);
            }
            console.log(`Arquivo selecionado para ${getServiceName(serviceId)}:`, file.name);
        } else {
            currentFile = null;
            if (processButton) {
                processButton.disabled = true;
                console.log(`❌ Botão desabilitado para ${serviceId}`);
            }
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
    } else if (serviceId === 'ocr') {
        // Processamento OCR - usa função específica
        await processOCRFile();
    } else if (serviceId === 'memorial') {
        // Processamento de memorial - múltiplos arquivos DOCX
        console.log('🔍 Verificando arquivos para memorial...');
        console.log('🔍 window.currentFiles:', window.currentFiles);
        console.log('🔍 Tipo:', typeof window.currentFiles);
        console.log('🔍 É array?', Array.isArray(window.currentFiles));
        console.log('🔍 Length:', window.currentFiles ? window.currentFiles.length : 'N/A');
        
        if (!window.currentFiles || window.currentFiles.length === 0) {
            console.error('❌ Nenhum arquivo encontrado para memorial');
            showAlert('Nenhum arquivo DOCX selecionado', 'warning');
            return;
        }
        
        console.log('✅ Arquivos encontrados, iniciando processamento...');
        await window.processMemorialFiles();
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
        const processingMethodElement = document.querySelector('input[name="processingMethod"]:checked');
        const processingMethod = processingMethodElement ? processingMethodElement.value : 'chatgpt';
        formData.append('method', processingMethod);
        
        // Sempre usar gpt-4o como modelo
        const DEFAULT_MODEL = 'gpt-4o';
        formData.append('model', DEFAULT_MODEL);
        console.log('�� Modelo selecionado para envio:', DEFAULT_MODEL);
        
        console.log('Enviando dados para processamento:');
        console.log('Arquivo:', currentFile.name);
        console.log('Serviço:', serviceId);
        console.log('Método:', processingMethod);
        if (processingMethod === 'chatgpt') {
            const modelElement = document.querySelector('input[name="chatgptModel"]:checked');
            const model = modelElement ? modelElement.value : 'gpt-4o';
            console.log('Modelo:', model);
        }
        
        // QUALIFICAÇÃO DESABILITADA - Usar apenas qualificacao.js
        if (serviceId === 'qualificacao') {
            console.log('🚫 QUALIFICAÇÃO BLOQUEADA em processSingleFile - usar qualificacao.js');
            console.log('⚠️ Esta função NÃO deve processar qualificação para evitar duplicação');
            console.log('✅ Redirecionando para qualificacao.js...');
            return; // BLOQUEAR processamento aqui
        }
        
        // Para outros serviços, usar endpoint padrão
        let endpoint = '/api/process-file';
        console.log('🎯 Usando endpoint padrão: /api/process-file');
        
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
        
        let result;
        try {
            result = await response.json();
        } catch (jsonError) {
            const textResponse = await response.text();
            console.error('Erro ao fazer parse do JSON:', jsonError);
            console.error('Resposta recebida:', textResponse);
            throw new Error('Resposta inválida do servidor');
        }
        
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
            
            try {
                if (result.success) {
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
            const processingMethodElement = document.querySelector('input[name="processingMethod"]:checked');
            const processingMethod = processingMethodElement ? processingMethodElement.value : 'chatgpt';
            let useAdvancedModel = 'true'; // Padrão para alta produção
            
            if (processingMethod === 'chatgpt') {
                const modelElement = document.querySelector('input[name="chatgptModel"]:checked');
                const model = modelElement ? modelElement.value : 'gpt-4o';
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
            
            let result;
            try {
                result = await response.json();
            } catch (jsonError) {
                const textResponse = await response.text();
                console.error('Erro ao fazer parse do JSON:', jsonError);
                console.error('Resposta recebida:', textResponse);
                throw new Error('Resposta inválida do servidor');
            }
            
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

// Funções específicas para OCR
async function processOCRFile() {
    const fileInput = document.getElementById('fileInputOCR');
    const processButton = document.getElementById('processFileOCR');
    const statusDiv = document.getElementById('ocrStatus');
    
    // Verificar se já está processando
    if (processButton.disabled) {
        console.log('OCR já está sendo processado, ignorando clique duplo');
        return;
    }
    
    if (!fileInput.files[0]) {
        showAlert('Por favor, selecione um arquivo PDF', 'warning');
        return;
    }
    
    const file = fileInput.files[0];
    if (!file.name.toLowerCase().endsWith('.pdf')) {
        showAlert('Apenas arquivos PDF são permitidos para OCR', 'warning');
        return;
    }
    
    // Obter configurações OCR
    const language = 'por'; // Apenas português para melhor velocidade e precisão
    const quality = document.getElementById('ocrQuality').value;
    const deskew = 'false'; // Sempre desabilitado para velocidade
    
    // Preparar interface
    processButton.disabled = true;
    processButton.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Processando...';
    statusDiv.innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-info-circle me-2"></i>
            <strong>Processando OCR...</strong><br>
            Arquivo: ${file.name}<br>
            Qualidade: ${quality}<br>
            Idioma: Português<br>
            Assinatura digital: Será removida automaticamente<br>
            Corrigir rotação: Não (otimizado para velocidade)
        </div>
    `;
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('language', language);
        formData.append('quality', quality);
        formData.append('deskew', deskew);
        
        console.log('Iniciando processamento OCR...');
        const response = await fetch('/api/ocr', {
            method: 'POST',
            body: formData
        });
        
        let result;
        try {
            result = await response.json();
        } catch (jsonError) {
            console.error('Erro ao parsear JSON:', jsonError);
            console.log('Response text:', await response.text());
            throw new Error('Resposta inválida do servidor');
        }
        
        if (result.success) {
            // Atualizar interface com resultados
            updateOCRInterface(result);
            showAlert('OCR processado com sucesso!', 'success');
        } else {
            throw new Error(result.error || 'Erro desconhecido no processamento OCR');
        }
        
    } catch (error) {
        console.error('Erro no processamento OCR:', error);
        statusDiv.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Erro no processamento OCR:</strong><br>
                ${error.message}
            </div>
        `;
        showAlert('Erro no processamento OCR', 'danger');
    } finally {
        processButton.disabled = false;
        processButton.innerHTML = '<i class="fas fa-play me-1"></i>Processar OCR';
    }
}

function updateOCRInterface(result) {
    // Habilitar botões de download
    document.getElementById('downloadOCRPDF').disabled = false;
    document.getElementById('downloadOCRText').disabled = false;
    
    // Armazenar dados para download
    window.ocrResult = result;
    
    // Atualizar status
    const statusDiv = document.getElementById('ocrStatus');
    statusDiv.innerHTML = `
        <div class="alert alert-success">
            <i class="fas fa-check-circle me-2"></i>
            <strong>OCR processado com sucesso!</strong><br>
            Arquivo: ${result.original_filename}<br>
            Páginas processadas: ${result.pages_processed}<br>
            Tempo de processamento: ${result.processing_time.toFixed(2)} segundos<br>
            Texto extraído: ${result.ocr_info?.text_length || 0} caracteres
        </div>
    `;
}

async function downloadOCRPDF() {
    console.log('🔍 Tentando download PDF do OCR...');
    console.log('📄 window.ocrResult:', window.ocrResult);
    
    if (!window.ocrResult) {
        showAlert('Nenhum resultado OCR disponível para download', 'warning');
        return;
    }
    
    // Usar apenas o nome original do arquivo, não o output_filename que contém file_id duplicado
    const downloadUrl = `/api/ocr/download/${window.ocrResult.file_id}?filename=${window.ocrResult.original_filename}`;
    const filename = `ocr_pesquisavel_${window.ocrResult.original_filename}`;
    
    console.log('🔗 URL de download:', downloadUrl);
    console.log('📁 Nome do arquivo:', filename);
    
    await downloadOCRFile(downloadUrl, filename);
}

async function downloadOCRText() {
    if (!window.ocrResult) {
        showAlert('Nenhum resultado OCR disponível para download', 'warning');
        return;
    }
    
    // Usar apenas o nome original do arquivo, não o output_filename que contém file_id duplicado
    const downloadUrl = `/api/ocr/text/${window.ocrResult.file_id}?filename=${window.ocrResult.original_filename}`;
    const filename = `texto_extraido_${window.ocrResult.original_filename.replace('.pdf', '.txt')}`;
    
    await downloadOCRFile(downloadUrl, filename);
}

// === ABA CERTIDÃO ===
// EVENT LISTENERS DA CERTIDÃO REMOVIDOS - Usar apenas os de main.js
// Os event listeners da aba Certidão agora são gerenciados exclusivamente por main.js
// para evitar conflitos e processamento duplicado
console.log('⚠️ Event listeners da Certidão REMOVIDOS do app-simple.js');
console.log('✅ Certidão agora gerenciada exclusivamente por main.js');
console.log('🚫 Event listeners duplicados eliminados para evitar processamento duplo');

const certidaoTipoSelect = document.getElementById('certidaoTipoSelect');

// === ABA QUALIFICAÇÃO ===
const fileInputQualificacao = document.getElementById('fileInputQualificacao');
const processFileQualificacao = document.getElementById('processFileQualificacao');
const qualificacaoStatus = document.getElementById('qualificacaoStatus');
const qualificacaoProgress = document.getElementById('qualificacaoProgress');
const documentosEnviados = document.getElementById('documentosEnviados');

// Variáveis para qualificação
let qualificacaoData = null;
let documentosSelecionados = [];

// EVENT LISTENERS DA QUALIFICAÇÃO REMOVIDOS - Usar apenas os de qualificacao.js
// Os event listeners da aba Qualificação agora são gerenciados exclusivamente por qualificacao.js
// para evitar conflitos e processamento duplicado
if (fileInputQualificacao && processFileQualificacao) {
    console.log('⚠️ Event listeners da Qualificação REMOVIDOS do app-simple.js');
    console.log('✅ Qualificação agora gerenciada exclusivamente por qualificacao.js');
    console.log('🚫 Event listeners duplicados eliminados para evitar processamento duplo');
    
    // NÃO adicionar event listeners aqui - eles são gerenciados por qualificacao.js
    // Isso elimina o processamento duplicado que estava acontecendo
}

function displayDocumentosSelecionados(files) {
    const container = document.getElementById('documentosEnviados');
    if (!container) return;
    
    container.innerHTML = '';
    
    files.forEach((file, index) => {
        const fileCard = document.createElement('div');
        fileCard.className = 'col-md-6 col-lg-4 mb-3';
        fileCard.innerHTML = `
            <div class="card border-primary">
                <div class="card-body p-2">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-file-pdf text-primary me-2"></i>
                        <div class="flex-grow-1">
                            <small class="text-muted d-block">Documento ${index + 1}</small>
                            <strong class="d-block text-truncate" title="${file.name}">${file.name}</strong>
                            <small class="text-muted">${(file.size / 1024 / 1024).toFixed(2)} MB</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(fileCard);
    });
}

function clearQualificacaoChecklist() {
    // Limpar checkboxes obrigatórios
    const obrigatorios = ['checkContrato', 'checkMatricula', 'checkCertidaoITBI', 'checkProcuracao', 'checkCND'];
    obrigatorios.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.checked = false;
            checkbox.disabled = true;
        }
    });
    
    // Limpar checkboxes complementares
    const complementares = ['checkCertidaoSimplificada', 'checkDeclaracaoPrimeiraAquisicao', 'checkAforamentoCAT', 'checkBoletimCadastro', 'checkOutrosDocumentos'];
    complementares.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.checked = false;
            checkbox.disabled = true;
        }
    });
    
    // Limpar campos de análise
    const analise = document.getElementById('analiseQualificacao');
    const observacoes = document.getElementById('observacoesQualificacao');
    const status = document.getElementById('statusQualificacao');
    const pontuacao = document.getElementById('pontuacaoQualificacao');
    
    if (analise) analise.value = '';
    if (observacoes) observacoes.value = '';
    if (status) status.value = '';
    if (pontuacao) pontuacao.value = '';
}

// FUNÇÃO DESABILITADA - Usar apenas a função processQualificacao do qualificacao.js
async function processQualificacao() {
    console.log('⚠️ AVISO: Função processQualificacao do app-simple.js está DESABILITADA');
    console.log('✅ Use apenas a função processQualificacao do qualificacao.js para evitar duplicação');
    console.log('🚫 Esta função foi desabilitada para eliminar processamento duplicado');
    
    // Mostrar alerta para debug
    if (typeof showAlert === 'function') {
        showAlert('Função duplicada desabilitada. Use a aba Qualificação corretamente.', 'warning');
    }
    
    return; // Sair imediatamente sem fazer nada
}

function updateQualificacaoInterface(result) {
    // Atualizar status
    qualificacaoStatus.innerHTML = `
        <div class="alert alert-success">
            <i class="fas fa-check-circle me-2"></i>
            <strong>Análise de qualificação concluída!</strong><br>
            Documentos processados: ${result.documentos_analisados.length}<br>
            Modelo utilizado: ${result.model}<br>
            Texto total analisado: ${result.total_text_length} caracteres
        </div>
    `;
    
    // Atualizar checklist baseado na análise da IA
    updateQualificacaoChecklist(result.campos);
    
    // Atualizar campos de análise
    const analise = document.getElementById('analiseQualificacao');
    const observacoes = document.getElementById('observacoesQualificacao');
    const status = document.getElementById('statusQualificacao');
    const pontuacao = document.getElementById('pontuacaoQualificacao');
    
    if (analise) analise.value = result.campos.analise_completa || '';
    if (observacoes) observacoes.value = result.campos.observacoes_recomendacoes || '';
    if (status) {
        status.value = result.campos.status_qualificacao || '';
        status.disabled = false;
    }
    if (pontuacao) pontuacao.value = result.campos.pontuacao_qualificacao || '0/100';
}

function updateQualificacaoChecklist(campos) {
    // Mapear campos da IA para checkboxes
    const mapeamento = {
        'contrato_presente': 'checkContrato',
        'matricula_presente': 'checkMatricula',
        'certidao_itbi_presente': 'checkCertidaoITBI',
        'procuracao_presente': 'checkProcuracao',
        'cnd_presente': 'checkCND',
        'certidao_simplificada_presente': 'checkCertidaoSimplificada',
        'declaracao_primeira_aquisicao_presente': 'checkDeclaracaoPrimeiraAquisicao',
        'aforamento_cat_presente': 'checkAforamentoCAT',
        'boletim_cadastro_presente': 'checkBoletimCadastro',
        'outros_documentos_presente': 'checkOutrosDocumentos'
    };
    
    // Atualizar cada checkbox
    Object.entries(mapeamento).forEach(([campoIA, checkboxId]) => {
        const checkbox = document.getElementById(checkboxId);
        if (checkbox) {
            const valor = campos[campoIA];
            checkbox.checked = valor === 'Sim';
            checkbox.disabled = false;
            
            // Adicionar classe visual
            if (valor === 'Sim') {
                checkbox.classList.add('text-success');
            } else {
                checkbox.classList.remove('text-success');
            }
        }
    });
}

// Funções de download para qualificação
function downloadQualificacaoWord() {
    if (!qualificacaoData) {
        showAlert('Nenhum resultado de qualificação disponível', 'warning');
        return;
    }
    
    const data = formatQualificacaoDataForDownload(qualificacaoData);
    downloadWordFile('qualificacao', data);
}

function downloadQualificacaoPDF() {
    if (!qualificacaoData) {
        showAlert('Nenhum resultado de qualificação disponível', 'warning');
        return;
    }
    
    const data = formatQualificacaoDataForDownload(qualificacaoData);
    downloadPDFFile('qualificacao', data);
}

function downloadQualificacaoJSON() {
    if (!qualificacaoData) {
        showAlert('Nenhum resultado de qualificação disponível', 'warning');
        return;
    }
    
    const data = formatQualificacaoDataForDownload(qualificacaoData);
    downloadJSONFile('qualificacao', data);
}

function formatQualificacaoDataForDownload(data) {
    return {
        titulo: 'Análise de Qualificação - Kit de Documentos',
        data_processamento: new Date().toLocaleString('pt-BR'),
        documentos_analisados: data.documentos_analisados,
        analise_completa: data.campos.analise_completa,
        observacoes_recomendacoes: data.campos.observacoes_recomendacoes,
        status_qualificacao: data.campos.status_qualificacao,
        pontuacao_qualificacao: data.campos.pontuacao_qualificacao,
        documentos_faltantes: data.campos.documentos_faltantes,
        problemas_identificados: data.campos.problemas_identificados,
        recomendacoes_especificas: data.campos.recomendacoes_especificas,
        modelo_utilizado: data.model,
        total_texto_analisado: data.total_text_length
    };
}

// Configurar botões de download da qualificação
const downloadButtonsQualificacao = [
    { id: 'downloadWordQualificacao', func: downloadQualificacaoWord },
    { id: 'downloadPDFQualificacao', func: downloadQualificacaoPDF },
    { id: 'downloadJSONQualificacao', func: downloadQualificacaoJSON }
];

downloadButtonsQualificacao.forEach(button => {
    const element = document.getElementById(button.id);
    if (element) {
        element.addEventListener('click', () => button.func());
        console.log(`✅ Download button ${button.id} listener configurado`);
    }
});

// Processamento de arquivos DOCX de memorial
window.processMemorialFiles = async function() {
    console.log('🚀 processMemorialFiles iniciado');
    console.log('📁 currentFiles:', window.currentFiles);
    console.log('📁 Tipo de currentFiles:', typeof window.currentFiles);
    console.log('📁 É array?', Array.isArray(window.currentFiles));
    
    // Declarar timerInterval fora do try para estar disponível no catch
    let timerInterval = null;
    
    try {
        // Iniciar cronômetro
        const startTime = Date.now();
        
        // Função para atualizar o cronômetro
        const updateTimer = () => {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            const timerElement = document.getElementById('memorialTimer');
            if (timerElement) {
                timerElement.textContent = `${elapsed}s`;
            }
        };
        
        // Exibir status de processamento com design moderno e cronômetro
        document.getElementById('memorialStatus').innerHTML = `
            <div class="alert alert-info border-0 shadow-sm">
                <div class="d-flex align-items-center">
                    <div class="flex-shrink-0">
                        <div class="spinner-border text-info" role="status">
                            <span class="visually-hidden">Processando...</span>
                        </div>
                    </div>
                    <div class="flex-grow-1 ms-3">
                        <h5 class="alert-heading mb-1">Processando Memorial</h5>
                        <p class="mb-0">Extraindo dados dos arquivos DOCX...</p>
                        <small class="text-muted"><i class="fas fa-clock me-1"></i>Tempo: <span id="memorialTimer">0.0s</span></small>
                    </div>
                </div>
            </div>
        `;
        
        // Iniciar atualização do cronômetro
        timerInterval = setInterval(updateTimer, 100);
        
        // Verificar se currentFiles existe
        if (!window.currentFiles || !Array.isArray(window.currentFiles)) {
            console.error('❌ currentFiles não está definido ou não é um array');
            document.getElementById('memorialStatus').innerHTML = `<div class="alert alert-danger"><i class="fas fa-exclamation-triangle me-2"></i>Erro: Nenhum arquivo selecionado</div>`;
            return;
        }
        
        console.log(`Iniciando processamento de ${window.currentFiles.length} arquivo(s) DOCX...`);
        
        const formData = new FormData();
        window.currentFiles.forEach(file => {
            formData.append('files[]', file);
        });
        
        const response = await fetch('/api/memorial', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        console.log('🔍 Resposta recebida:', result);
        console.log('🔍 Status da resposta:', response.ok);
        console.log('🔍 Success:', result.success);
        
        // Parar o cronômetro
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        if (response.ok && result.success) {
            console.log('✅ Processamento de memorial concluído:', result);
            console.log('🔍 Chamando updateMemorialInterface...');
            updateMemorialInterface(result);
        } else {
            console.error('❌ Erro no processamento de memorial:', result);
            document.getElementById('memorialStatus').innerHTML = `<div class="alert alert-danger"><i class="fas fa-exclamation-triangle me-2"></i>Erro: ${result.error || 'Erro desconhecido'}</div>`;
        }
        
    } catch (error) {
        // Parar o cronômetro em caso de erro
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        console.error('❌ Erro ao processar memorial:', error);
        document.getElementById('memorialStatus').innerHTML = `<div class="alert alert-danger"><i class="fas fa-exclamation-triangle me-2"></i>Erro de conexão: ${error.message}</div>`;
    }
}

// Gerenciamento dinâmico de colunas para Memorial
let memorialColumns = [
    { id: 'formato', name: 'Formato', type: 'default', visible: true },
    { id: 'apartamento', name: 'Apartamento', type: 'default', visible: true },
    { id: 'tipo', name: 'Tipo', type: 'default', visible: true },
    { id: 'torre_bloco', name: 'Torre/Bloco', type: 'default', visible: true },
    { id: 'pavimento', name: 'Pavimento', type: 'default', visible: true },
    { id: 'area_privativa', name: 'Área Privativa (m²)', type: 'default', visible: true },
    { id: 'area_privativa_total', name: 'Área Privativa Total (m²)', type: 'default', visible: true },
    { id: 'area_comum', name: 'Área Comum (m²)', type: 'default', visible: true },
    { id: 'area_total', name: 'Área Total (m²)', type: 'default', visible: true },
    { id: 'fracao_ideal', name: 'Fração Ideal (%)', type: 'default', visible: true },
    { id: 'area_terreno', name: 'Área Terreno (m²)', type: 'default', visible: true },
    { id: 'descricao', name: 'Descrição', type: 'default', visible: true }
];

function initializeColumnManagement() {
    // Verificar se o elemento existe antes de tentar acessá-lo
    const columnConfigElement = document.getElementById('memorialColumnConfig');
    if (!columnConfigElement) {
        console.log('⚠️ Elemento memorialColumnConfig não encontrado');
        return;
    }
    
    // Mostrar a configuração de colunas no topo
    columnConfigElement.style.display = 'block';
    
    // Renderizar lista de colunas
    renderColumnsList();
    
    // Configurar event listeners
    const addCustomColumnBtn = document.getElementById('addCustomColumn');
    const resetColumnsBtn = document.getElementById('resetColumns');
    const downloadExcelCustomBtn = document.getElementById('downloadExcelCustom');
    
    if (addCustomColumnBtn) addCustomColumnBtn.addEventListener('click', addCustomColumn);
    if (resetColumnsBtn) resetColumnsBtn.addEventListener('click', resetColumns);
    if (downloadExcelCustomBtn) downloadExcelCustomBtn.addEventListener('click', downloadCustomExcel);
    
    // Inicializar drag and drop
    initializeSortable();
}

function renderColumnsList() {
    const columnsList = document.getElementById('columnsList');
    columnsList.innerHTML = '';
    
    memorialColumns.forEach((column, index) => {
        const columnItem = document.createElement('div');
        columnItem.className = `column-item ${column.type}-column`;
        columnItem.dataset.columnId = column.id;
        columnItem.draggable = true;
        
        columnItem.innerHTML = `
            <div class="column-item-content">
                <div class="drag-handle">
                    <i class="fas fa-grip-vertical"></i>
                </div>
                <div class="column-checkbox">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" ${column.visible ? 'checked' : ''} 
                               onchange="toggleColumnVisibility('${column.id}')">
                    </div>
                </div>
                <div class="column-info">
                    <div class="column-name">${column.name}</div>
                    ${column.type === 'custom' ? 
                        `<div class="column-input">
                            <input type="text" class="form-control form-control-sm" 
                                    placeholder="Valor padrão" value="${column.defaultValue || ''}" 
                                    onchange="updateColumnDefaultValue('${column.id}', this.value)">
                        </div>` : 
                        `<div class="column-type">Coluna padrão</div>`
                    }
                </div>
                ${column.type === 'custom' ? 
                    `<div class="column-actions">
                        <button class="btn btn-sm btn-outline-danger remove-btn" onclick="removeCustomColumn('${column.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>` : ''
                }
            </div>
        `;
        
        columnsList.appendChild(columnItem);
    });
    
    updateColumnPreview();
}

function initializeSortable() {
    const columnsList = document.getElementById('columnsList');
    
    let draggedElement = null;
    let dragOverElement = null;
    
    columnsList.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('column-item')) {
            draggedElement = e.target;
            e.target.classList.add('dragging');
            
            // Adicionar efeito de elevação
            e.target.style.transform = 'rotate(2deg) scale(1.02)';
            e.target.style.zIndex = '1000';
            
            // Criar efeito de ghost
            setTimeout(() => {
                e.target.style.opacity = '0.8';
            }, 0);
        }
    });
    
    columnsList.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('column-item')) {
            e.target.classList.remove('dragging');
            e.target.style.transform = '';
            e.target.style.zIndex = '';
            e.target.style.opacity = '';
            
            // Remover indicadores de drop
            columnsList.querySelectorAll('.column-item').forEach(item => {
                item.classList.remove('drag-over');
            });
        }
    });
    
    columnsList.addEventListener('dragover', (e) => {
        e.preventDefault();
        
        if (!draggedElement) return;
        
        const afterElement = getDragAfterElement(columnsList, e.clientY);
        
        // Remover indicadores anteriores
        columnsList.querySelectorAll('.column-item').forEach(item => {
            item.classList.remove('drag-over');
        });
        
        // Adicionar indicador visual apenas
        if (afterElement) {
            afterElement.classList.add('drag-over');
        }
    });
    
    columnsList.addEventListener('dragenter', (e) => {
        e.preventDefault();
        if (e.target.classList.contains('column-item') && e.target !== draggedElement) {
            dragOverElement = e.target;
        }
    });
    
    columnsList.addEventListener('dragleave', (e) => {
        if (e.target.classList.contains('column-item')) {
            e.target.classList.remove('drag-over');
        }
    });
    
    columnsList.addEventListener('drop', (e) => {
        e.preventDefault();
        
        if (!draggedElement) return;
        
        const afterElement = getDragAfterElement(columnsList, e.clientY);
        
        // Remover todos os indicadores
        columnsList.querySelectorAll('.column-item').forEach(item => {
            item.classList.remove('drag-over');
        });
        
        // Mover elemento para a posição correta
        if (afterElement == null) {
            columnsList.appendChild(draggedElement);
        } else {
            columnsList.insertBefore(draggedElement, afterElement);
        }
        
        // Reordenar colunas
        reorderColumns();
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.column-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function reorderColumns() {
    const columnsList = document.getElementById('columnsList');
    const newOrder = [];
    
    columnsList.querySelectorAll('.column-item').forEach(item => {
        const columnId = item.dataset.columnId;
        const column = memorialColumns.find(col => col.id === columnId);
        if (column) {
            newOrder.push(column);
        }
    });
    
    memorialColumns = newOrder;
    updateColumnPreview();
}

function toggleColumnVisibility(columnId) {
    const column = memorialColumns.find(col => col.id === columnId);
    if (column) {
        column.visible = !column.visible;
        updateColumnPreview();
    }
}

function addCustomColumn() {
    const columnName = prompt('Nome da nova coluna:');
    if (columnName && columnName.trim()) {
        const columnId = 'custom_' + Date.now();
        const newColumn = {
            id: columnId,
            name: columnName.trim(),
            type: 'custom',
            visible: true,
            defaultValue: ''
        };
        
        memorialColumns.push(newColumn);
        renderColumnsList();
        initializeSortable();
    }
}

function removeCustomColumn(columnId) {
    if (confirm('Deseja remover esta coluna personalizada?')) {
        memorialColumns = memorialColumns.filter(col => col.id !== columnId);
        renderColumnsList();
        initializeSortable();
    }
}

function updateColumnDefaultValue(columnId, value) {
    const column = memorialColumns.find(col => col.id === columnId);
    if (column) {
        column.defaultValue = value;
    }
}

function resetColumns() {
    if (confirm('Deseja restaurar as colunas padrão? Todas as personalizações serão perdidas.')) {
        memorialColumns = [
            { id: 'formato', name: 'Formato', type: 'default', visible: true },
            { id: 'apartamento', name: 'Apartamento', type: 'default', visible: true },
            { id: 'tipo', name: 'Tipo', type: 'default', visible: true },
            { id: 'torre_bloco', name: 'Torre/Bloco', type: 'default', visible: true },
            { id: 'pavimento', name: 'Pavimento', type: 'default', visible: true },
            { id: 'area_privativa', name: 'Área Privativa (m²)', type: 'default', visible: true },
            { id: 'area_privativa_total', name: 'Área Privativa Total (m²)', type: 'default', visible: true },
            { id: 'area_comum', name: 'Área Comum (m²)', type: 'default', visible: true },
            { id: 'area_total', name: 'Área Total (m²)', type: 'default', visible: true },
            { id: 'fracao_ideal', name: 'Fração Ideal (%)', type: 'default', visible: true },
            { id: 'area_terreno', name: 'Área Terreno (m²)', type: 'default', visible: true },
            { id: 'descricao', name: 'Descrição', type: 'default', visible: true }
        ];
        renderColumnsList();
        initializeSortable();
    }
}

function updateColumnsBasedOnDocumentType(data, columnsFromBackend) {
    if (!data || data.length === 0) return;
    
    const firstRecord = data[0];
    const formato = firstRecord['Formato'] || '';
    
    // Mapear colunas do backend para as colunas da interface
    const columnMapping = {
        'Formato': 'formato',
        'Apartamento': 'apartamento',
        'Tipo': 'tipo',
        'Torre/Bloco': 'torre_bloco',
        'Pavimento': 'pavimento',
        'Área Privativa (m²)': 'area_privativa',
        'Área Privativa Total (m²)': 'area_privativa_total',
        'Área Comum (m²)': 'area_comum',
        'Área Total (m²)': 'area_total',
        'Fração Ideal (%)': 'fracao_ideal',
        'Área Terreno (m²)': 'area_terreno',
        'Descrição': 'descricao',
        'Número da Casa': 'numero_casa',
        'Área do Terreno (m²)': 'area_terreno',
        'Área Construída (m²)': 'area_construida',
        'Área Comum Real (m²)': 'area_comum_real',
        'Área Total Real (m²)': 'area_total_real'
    };
    
    // Criar novas colunas baseadas nos dados reais
    const newColumns = [];
    
    if (columnsFromBackend) {
        columnsFromBackend.forEach(columnName => {
            const columnId = columnMapping[columnName];
            if (columnId) {
                newColumns.push({
                    id: columnId,
                    name: columnName,
                    type: 'default',
                    visible: true
                });
            }
        });
    }
    
    // Se não conseguiu mapear, usar colunas padrão
    if (newColumns.length === 0) {
        newColumns.push(...memorialColumns);
    }
    
    // Atualizar colunas
    memorialColumns = newColumns;
    console.log('🔄 Colunas atualizadas baseado no tipo de documento:', formato, newColumns);
}

function updateColumnPreview() {
    const preview = document.getElementById('columnPreview');
    
    // Verificar se o elemento existe
    if (!preview) {
        console.log('⚠️ Elemento columnPreview não encontrado, pulando atualização');
        return;
    }
    
    const visibleColumns = memorialColumns.filter(col => col.visible);
    
    if (visibleColumns.length === 0) {
        preview.innerHTML = '<small class="text-muted">Nenhuma coluna selecionada</small>';
        return;
    }
    
    const previewHtml = visibleColumns.map((col, index) => 
        `<div class="column-preview-item" style="color: inherit;">
            <strong style="color: inherit;">${index + 1}. ${col.name}</strong>
            ${col.type === 'custom' && col.defaultValue ? 
                `<small class="text-muted d-block" style="color: inherit;">Valor: "${col.defaultValue}"</small>` : ''}
        </div>`
    ).join('');
    
    preview.innerHTML = previewHtml;
}

function downloadCustomExcel() {
    if (!memorialData || !memorialData.data) {
        alert('Nenhum dado disponível para download');
        return;
    }
    
    // Preparar configuração de colunas para enviar ao backend
    const columnConfig = {
        columns: memorialColumns.filter(col => col.visible).map(col => ({
            id: col.id,
            name: col.name,
            type: col.type,
            defaultValue: col.defaultValue || ''
        })),
        data: memorialData.data
    };
    
    // Enviar para o backend
    fetch('/api/memorial/download-custom', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(columnConfig)
    })
    .then(response => {
        if (response.ok) {
            return response.blob();
        }
        throw new Error('Erro ao gerar arquivo personalizado');
    })
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `memorial_personalizado_${new Date().toISOString().slice(0, 10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showAlert('Download personalizado iniciado!', 'success');
    })
    .catch(error => {
        console.error('Erro no download personalizado:', error);
        showAlert('Erro ao gerar arquivo personalizado', 'danger');
    });
}

window.updateMemorialInterface = function(result) {
    console.log('🚀 updateMemorialInterface iniciada');
    console.log('🔍 Resultado recebido:', result);
    
    // Armazenar dados para download
    memorialData = result;
    
    console.log('🔍 Resultado completo recebido:', result);
    console.log('🔍 Tipo do resultado:', typeof result);
    console.log('🔍 Chaves disponíveis:', Object.keys(result));
    console.log('🔍 Dados disponíveis:', result.data ? result.data.length : 'N/A');
    console.log('🔍 Resumo:', result.resumo);
    console.log('🔍 Success:', result.success);
    
    // Verificar se o resultado é válido
    if (!result || !result.success) {
        console.error('❌ Resultado inválido ou sem sucesso');
        document.getElementById('memorialStatus').innerHTML = `<div class="alert alert-danger"><i class="fas fa-exclamation-triangle me-2"></i>Erro: ${result.error || 'Erro desconhecido'}</div>`;
        return;
    }
    
    console.log('✅ Resultado válido, continuando...');
    
    // Atualizar colunas baseado no tipo de documento
    updateColumnsBasedOnDocumentType(result.data, result.columns);
    
    // Primeiro exibir os dados, depois inicializar gerenciamento de colunas (opcional)
    try {
        initializeColumnManagement();
        console.log('✅ Gerenciamento de colunas inicializado');
    } catch (error) {
        console.error('❌ Erro ao inicializar gerenciamento de colunas:', error);
        console.log('⚠️ Continuando sem gerenciamento de colunas...');
    }
    
    // Atualizar status com animação e tempo de processamento
    const processingTime = result.processing_time || 0;
    const timeText = processingTime > 0 ? ` (${processingTime}s)` : '';
    
    document.getElementById('memorialStatus').innerHTML = `
        <div class="alert alert-success border-0 shadow-sm">
            <div class="d-flex align-items-center">
                <div class="flex-shrink-0">
                    <i class="fas fa-check-circle fa-2x text-success"></i>
                </div>
                <div class="flex-grow-1 ms-3">
                    <h5 class="alert-heading mb-1">Processamento Concluído!${timeText}</h5>
                    <p class="mb-0">${result.message}</p>
                    ${processingTime > 0 ? `<small class="text-muted"><i class="fas fa-clock me-1"></i>Tempo de processamento: ${processingTime} segundos</small>` : ''}
                </div>
            </div>
        </div>
    `;
    
    // Exibir resumo com design moderno usando a paleta do projeto
    const resumo = result.resumo;
    const totalRecords = result.data ? result.data.length : 0;
    
    // Contar tipos de documento
    const documentTypes = {};
    if (result.data) {
        result.data.forEach(item => {
            const tipo = item.Formato || 'Desconhecido';
            documentTypes[tipo] = (documentTypes[tipo] || 0) + 1;
        });
    }
    
    let resumoHTML = `
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0"><i class="fas fa-chart-bar me-2"></i>Resumo do Processamento</h5>
            </div>
            <div class="card-body">
                <div class="processing-stats">
                    <div class="stat-item">
                        <span class="stat-number">${resumo.arquivos_processados || 1}</span>
                        <span class="stat-label">Arquivos Processados</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${totalRecords}</span>
                        <span class="stat-label">Registros Extraídos</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${processingTime.toFixed(2)}s</span>
                        <span class="stat-label">Tempo de Processamento</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${Object.keys(documentTypes).length}</span>
                        <span class="stat-label">Tipos de Documento</span>
                    </div>
                </div>
                
                ${Object.keys(documentTypes).length > 0 ? `
                    <div class="mb-3">
                        <h6 class="text-muted mb-2"><i class="fas fa-tags me-2"></i>Tipos de Documento Encontrados:</h6>
                        ${Object.entries(documentTypes).map(([tipo, count]) => 
                            `<span class="badge badge-info me-2" style="background: linear-gradient(135deg, var(--info-color) 0%, #2563eb 100%); color: white;">${tipo.toUpperCase()}: ${count}</span>`
                        ).join('')}
                    </div>
                ` : ''}
                
                ${resumo && resumo.descricao ? `
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        <strong>Descrição:</strong> ${resumo.descricao}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.getElementById('memorialResults').innerHTML = resumoHTML;
    
    // Exibir tabela de dados com design melhorado
    console.log('🔍 Verificando dados para tabela...');
    console.log('🔍 result.data:', result.data);
    console.log('🔍 É array?', Array.isArray(result.data));
    console.log('🔍 Length:', result.data ? result.data.length : 'N/A');
    
    if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        console.log('📊 Dados recebidos para tabela:', result.data.length, 'registros');
        console.log('📊 Primeiro registro:', result.data[0]);
        console.log('📊 Colunas disponíveis:', Object.keys(result.data[0]));
        
        try {
            const tableHTML = createMemorialTable(result.data, processingTime, result.columns);
            const tableElement = document.getElementById('memorialTable');
            if (tableElement) {
                tableElement.innerHTML = tableHTML;
                console.log('✅ Tabela criada com sucesso');
            } else {
                console.error('❌ Elemento memorialTable não encontrado');
            }
        } catch (error) {
            console.error('❌ Erro ao criar tabela:', error);
        }
    } else {
        console.log('⚠️ Nenhum dado para exibir na tabela');
        console.log('⚠️ Tipo de dados:', typeof result.data);
        console.log('⚠️ É array?', Array.isArray(result.data));
        const tableElement = document.getElementById('memorialTable');
        if (tableElement) {
            tableElement.innerHTML = '<div class="alert alert-warning"><i class="fas fa-exclamation-triangle me-2"></i>Nenhum dado encontrado para exibir na tabela</div>';
        }
    }
}

function createMemorialTable(data, processingTime = 0, columnsFromBackend = null) {
    if (!data || data.length === 0) return '<div class="alert alert-warning"><i class="fas fa-exclamation-triangle me-2"></i>Nenhum dado para exibir</div>';
    
    // Use a ordem das colunas do backend se fornecida
    let columns = columnsFromBackend && Array.isArray(columnsFromBackend) ? columnsFromBackend : Object.keys(data[0]).filter(col => col !== 'Arquivo');
    
    let tableHTML = `
        <div class="table-container">
            <div class="card-header d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-0"><i class="fas fa-table me-2"></i>Dados Extraídos (${data.length} registros)</h5>
                    ${processingTime > 0 ? `<span class="processing-time ms-2">Processado em ${processingTime.toFixed(2)}s</span>` : ''}
                </div>
                <div>
                    <button class="btn btn-light btn-sm" onclick="downloadMemorialExcel()" title="Baixar Excel">
                        <i class="fas fa-file-excel me-1"></i>Excel
                    </button>
                </div>
            </div>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
    `;
    
    // Cabeçalho com ícones
    const columnIcons = {
        'Formato': 'fas fa-building',
        'Apartamento': 'fas fa-home',
        'Tipo': 'fas fa-tag',
        'Torre/Bloco': 'fas fa-layer-group',
        'Área Privativa (m²)': 'fas fa-ruler-combined',
        'Área Comum (m²)': 'fas fa-share-alt',
        'Área Total (m²)': 'fas fa-calculator',
        'Fração Ideal (%)': 'fas fa-percentage',
        'Área Terreno (m²)': 'fas fa-map',
        'Descrição': 'fas fa-align-left',
        'Número da Casa': 'fas fa-home',
        'Área do Terreno (m²)': 'fas fa-map',
        'Área Construída (m²)': 'fas fa-ruler-combined',
        'Área Comum Real (m²)': 'fas fa-share-alt',
        'Área Total Real (m²)': 'fas fa-calculator',
        'Fração Ideal': 'fas fa-percentage'
    };
    
    columns.forEach(column => {
        const icon = columnIcons[column] || 'fas fa-columns';
        tableHTML += `<th><i class="${icon} me-1"></i>${column}</th>`;
    });
    
    tableHTML += `
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    // Dados com formatação
    data.forEach((row, index) => {
        const isHidden = index >= 10;
        tableHTML += `<tr class="${isHidden ? 'hidden-row' : ''}" style="${isHidden ? 'display: none;' : ''}">`;
        columns.forEach(column => {
            const value = row[column] || '';
            let formattedValue = value;
            
            // Formatação especial para valores numéricos
            if (column.includes('Área') && value && !isNaN(value)) {
                formattedValue = parseFloat(value).toFixed(2);
            } else if (column.includes('Fração') && value && !isNaN(value)) {
                formattedValue = parseFloat(value).toFixed(2) + '%';
            }
            
            // Formatação especial para coluna de descrição
            if (column === 'Descrição' && value.length > 100) {
                const shortText = value.substring(0, 100) + '...';
                const fullText = value;
                formattedValue = `
                    <div class="description-cell">
                        <div class="description-short" id="desc-short-${index}">
                            ${shortText}
                            <button class="btn btn-sm btn-link expand-btn" onclick="toggleDescription(${index})" style="padding: 0; margin-left: 5px; color: var(--accent-color);">
                                <i class="fas fa-chevron-down"></i> Ver mais
                            </button>
                        </div>
                        <div class="description-full" id="desc-full-${index}" style="display: none;">
                            ${fullText}
                            <button class="btn btn-sm btn-link collapse-btn" onclick="toggleDescription(${index})" style="padding: 0; margin-top: 5px; color: var(--accent-color);">
                                <i class="fas fa-chevron-up"></i> Ver menos
                            </button>
                        </div>
                    </div>
                `;
            }
            
            tableHTML += `<td>${formattedValue}</td>`;
        });
        tableHTML += '</tr>';
    });
    
    tableHTML += `
                        </tbody>
                    </table>
                </div>
                ${data.length > 10 ? `
                    <div class="card-footer text-center" style="background: var(--bg-secondary); border-top: 1px solid var(--blue-gray-200);">
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <i class="fas fa-info-circle me-1"></i>
                                Mostrando <span id="visible-count">10</span> de ${data.length} registros
                            </small>
                            <button class="btn btn-sm btn-outline-primary" onclick="toggleAllRows()" id="toggle-rows-btn">
                                <i class="fas fa-eye me-1"></i>Mostrar tudo
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    return tableHTML;
}

// Função para expandir/colapsar descrições
window.toggleDescription = function(index) {
    const shortElement = document.getElementById(`desc-short-${index}`);
    const fullElement = document.getElementById(`desc-full-${index}`);
    
    if (shortElement && fullElement) {
        if (shortElement.style.display !== 'none') {
            // Expandir
            shortElement.style.display = 'none';
            fullElement.style.display = 'block';
        } else {
            // Colapsar
            shortElement.style.display = 'block';
            fullElement.style.display = 'none';
        }
    }
};

// Função para mostrar/ocultar todas as linhas da tabela
window.toggleAllRows = function() {
    const hiddenRows = document.querySelectorAll('.hidden-row');
    const toggleBtn = document.getElementById('toggle-rows-btn');
    const visibleCount = document.getElementById('visible-count');
    const totalRows = document.querySelectorAll('tbody tr').length;
    
    if (hiddenRows.length > 0 && hiddenRows[0].style.display === 'none') {
        // Mostrar todas as linhas
        hiddenRows.forEach(row => {
            row.style.display = '';
        });
        
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-eye-slash me-1"></i>Ocultar extras';
            toggleBtn.classList.remove('btn-outline-primary');
            toggleBtn.classList.add('btn-outline-secondary');
        }
        
        if (visibleCount) {
            visibleCount.textContent = totalRows;
        }
    } else {
        // Ocultar linhas extras (manter apenas as primeiras 10)
        hiddenRows.forEach(row => {
            row.style.display = 'none';
        });
        
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-eye me-1"></i>Mostrar tudo';
            toggleBtn.classList.remove('btn-outline-secondary');
            toggleBtn.classList.add('btn-outline-primary');
        }
        
        if (visibleCount) {
            visibleCount.textContent = '10';
        }
    }
};

// Funções de download para memorial
function downloadMemorialExcel() {
    if (!memorialData || !memorialData.excel_file) {
        showAlert('Nenhum arquivo Excel disponível para download', 'warning');
        return;
    }
    
    const downloadUrl = `/api/memorial/download/${memorialData.excel_file}`;
    window.open(downloadUrl, '_blank');
    showAlert('Download iniciado!', 'success');
}

