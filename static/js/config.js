// Configurações da aplicação
const CONFIG = {
    API_BASE_URL: window.location.origin,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_FORMATS: ['.pdf', '.jpg', '.jpeg', '.png'],
    ALERT_TIMEOUT: 5000,
    PROGRESS_INTERVAL: 200,
    HEALTH_CHECK_INTERVAL: 30000
};

// Elementos DOM essenciais
const DOM_ELEMENTS = {
    // Configurações
    saveConfig: 'saveConfig',
    processingMethod: 'input[name="processingMethod"]',
    chatgptOptions: 'chatgptOptions',
    chatgptModel: 'input[name="chatgptModel"]',
    
    // Upload e processamento
    fileInput: 'fileInput',
    processFile: 'processFile',
    fileInputMatricula: 'fileInputMatricula',
    processFileMatricula: 'processFileMatricula',
    status: 'status',
    progress: 'progress',
    progressBar: '#progress .progress-bar',
    
    // Texto extraído
    extractedTextContainer: 'extractedTextContainer',
    textJustify: 'textJustify',
    copyText: 'copyText',
    downloadTextTXT: 'downloadTextTXT',
    downloadTextWord: 'downloadTextWord',
    downloadTextPDF: 'downloadTextPDF',
    
    // Dados extraídos
    downloadWord: 'downloadWord',
    downloadPDF: 'downloadPDF',
    downloadJSON: 'downloadJSON',
    
    // Documentos
    generateDocuments: 'generateDocuments',
    uploadTemplate: 'uploadTemplate',
    generatedDocuments: 'generatedDocuments',
    
    // Campos de dados
    matricula: 'matricula',
    dataMatricula: 'dataMatricula',
    descricaoImovel: 'descricaoImovel',
    endereco: 'endereco',
    areaPrivativa: 'areaPrivativa',
    areaTotal: 'areaTotal',
    garagem: 'garagem',
    proprietarios: 'proprietarios',
    livroAnterior: 'livroAnterior',
    folhaAnterior: 'folhaAnterior',
    matriculaAnterior: 'matriculaAnterior',
    tipoTitulo: 'tipoTitulo',
    valorTitulo: 'valorTitulo',
    comprador: 'comprador',
    cpfCnpj: 'cpfCnpj',
    valorITBI: 'valorITBI',
    numeroDAM: 'numeroDAM',
    dataPagamentoITBI: 'dataPagamentoITBI'
};

// Utilitários
const UTILS = {
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    validateFile(file) {
        if (!file) return { valid: false, error: 'Nenhum arquivo selecionado' };
        
        if (file.size > CONFIG.MAX_FILE_SIZE) {
            return { 
                valid: false, 
                error: `Arquivo muito grande. Tamanho máximo: ${UTILS.formatFileSize(CONFIG.MAX_FILE_SIZE)}` 
            };
        }
        
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        if (!CONFIG.SUPPORTED_FORMATS.includes(extension)) {
            return { 
                valid: false, 
                error: `Formato não suportado. Formatos aceitos: ${CONFIG.SUPPORTED_FORMATS.join(', ')}` 
            };
        }
        
        return { valid: true };
    },
    
    getElement(id) {
        return document.getElementById(id);
    },
    
    getElements(selector) {
        return document.querySelectorAll(selector);
    }
};

// Exportar para uso global
window.CONFIG = CONFIG;
window.DOM_ELEMENTS = DOM_ELEMENTS;
window.UTILS = UTILS; 