// main.js - Configuração principal do sistema NicSan
import { processFile } from './process.js';

// Configuração da UI moderna
const ui = {
    showAlert: function(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        // Implementação de alertas mais sofisticados pode ser adicionada aqui
    },
    
    updateStatus: function(message, type = 'info', statusId = 'status') {
        const statusElement = document.getElementById(statusId);
        if (statusElement) {
            const iconClass = this.getStatusIcon(type);
            statusElement.innerHTML = `
                <div class="alert alert-${type} fade-in">
                    <i class="${iconClass} me-2"></i>
                    ${message}
                </div>
            `;
        }
    },
    
    getStatusIcon: function(type) {
        const icons = {
            'info': 'fas fa-info-circle',
            'success': 'fas fa-check-circle',
            'warning': 'fas fa-exclamation-triangle',
            'danger': 'fas fa-times-circle',
            'loading': 'fas fa-spinner fa-spin'
        };
        return icons[type] || icons.info;
    },
    
    showProgress: function(show, elementId = 'status') {
        const element = document.getElementById(elementId);
        if (element) {
            if (show) {
                element.innerHTML = `
                    <div class="alert alert-info fade-in">
                        <i class="fas fa-spinner fa-spin me-2"></i>
                        Processando documento...
                    </div>
                `;
            }
        }
        console.log(`Progress: ${show}`);
    },
    
    updateFileInput: function(inputId, fileName) {
        const input = document.getElementById(inputId);
        const label = input.nextElementSibling;
        if (label && fileName) {
            label.innerHTML = `
                <i class="fas fa-file me-2"></i>
                ${fileName}
            `;
            label.style.borderColor = 'var(--success-color)';
            label.style.color = 'var(--success-color)';
        }
    },
    
    resetFileInput: function(inputId) {
        const input = document.getElementById(inputId);
        const label = input.nextElementSibling;
        if (label) {
            label.innerHTML = `
                <i class="fas fa-cloud-upload-alt me-2"></i>
                Selecionar Arquivo
            `;
            label.style.borderColor = '';
            label.style.color = '';
        }
    }
};

// Sistema de Tema
const themeManager = {
    currentTheme: localStorage.getItem('theme') || 'light',
    
    init: function() {
        this.setTheme(this.currentTheme);
        this.setupThemeToggle();
    },
    
    setTheme: function(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        
        // Atualizar ícone do botão
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun text-light' : 'fas fa-moon text-light';
            }
        }
        
        // Atualizar logo baseado no tema
        const brandLogo = document.getElementById('brandLogo');
        if (brandLogo) {
            brandLogo.src = theme === 'dark' ? '/static/logo-dark.png' : '/static/logo-light.png';
        }
    },
    
    toggleTheme: function() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    },
    
    setupThemeToggle: function() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }
};

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 NicSan - Sistema inicializado...');
    
    // Verificar se as funções do app-simple.js estão disponíveis
    console.log('🔍 Verificando funções disponíveis:');
    console.log('processMemorialFiles:', typeof window.processMemorialFiles);
    console.log('processFile:', typeof processFile);
    console.log('updateMemorialInterface:', typeof window.updateMemorialInterface);
    
    // Inicializar sistema de tema
    themeManager.init();
    
    // Configurar event listeners para Certidão
    setupCertidaoEventListeners();
    
    // Configurar event listeners para Memorial
    setupMemorialEventListeners();
    
    // Configurar event listeners para OCR
    setupOCREventListeners();
    
    // Adicionar animações de entrada
    addEntranceAnimations();
});

// Função para configurar event listeners da Certidão
function setupCertidaoEventListeners() {
    console.log('🚀 Configurando event listeners da Certidão...');
    
    const fileInput = document.getElementById('fileInputCertidao');
    const processButton = document.getElementById('processFileCertidao');
    
    if (fileInput && processButton) {
        fileInput.addEventListener('change', (event) => {
            const files = event.target.files;
            if (files && files.length > 0) {
                processButton.disabled = false;
                processButton.classList.add('btn-pulse');
                ui.updateFileInput('fileInputCertidao', files[0].name);
                console.log(`${files.length} arquivo(s) selecionado(s) para certidão`);
            } else {
                processButton.disabled = true;
                processButton.classList.remove('btn-pulse');
                ui.resetFileInput('fileInputCertidao');
            }
        });
        
        processButton.addEventListener('click', async () => {
            const files = fileInput.files;
            if (!files || files.length === 0) {
                ui.showAlert('Nenhum arquivo selecionado!', 'warning');
                return;
            }
            
            // Adicionar estado de loading
            processButton.disabled = true;
            processButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processando...';
            
            try {
                const file = files[0];
                const formData = new FormData();
                formData.append('file', file);
                
                // Obter modelo das configurações globais
                const modelElement = document.querySelector('input[name="chatgptModel"]:checked');
                const selectedModel = modelElement ? modelElement.value : 'gpt-4o';
                formData.append('model', selectedModel);
                
                // Mostrar status de processamento
                const statusArea = document.getElementById('certidaoStatus');
                const documentPreviewArea = document.getElementById('certidaoDocumentPreview');
                
                console.log('🔍 Elementos encontrados:', {
                    statusArea: !!statusArea,
                    documentPreviewArea: !!documentPreviewArea
                });
                
                if (statusArea) statusArea.innerHTML = '<div class="alert alert-info">Executando OCR e processando certidão, aguarde...</div>';
                if (documentPreviewArea) documentPreviewArea.style.display = 'none';
                
                // Fazer chamada para extrair dados
                const response = await fetch('/api/certidao/data', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    const result = await response.json();
                    window.currentCertidaoData = result.data;
                    
                    // Mostrar dados extraídos
                    if (result.data) {
                        let info = '';
                        if (result.tipo && result.motivo) {
                            let tipoLabel = '';
                            if (result.tipo === 'STForeiro') tipoLabel = 'Foreira';
                            else if (result.tipo === 'STPositiva') tipoLabel = 'Positiva';
                            else if (result.tipo === 'STNegativa') tipoLabel = 'Negativa';
                            else tipoLabel = result.tipo;
                            info = `<div class='alert alert-secondary mb-2'><b>Tipo de Certidão:</b> ${tipoLabel}<br/><b>Motivo:</b> ${result.motivo}</div>`;
                        }
                        
                        statusArea.innerHTML = info + '<div class="alert alert-success">OCR executado e certidão processada com sucesso! Clique para baixar em Word.</div>';
                        
                        // Mostrar preview do documento formatado
                        if (result.formatted_html) {
                            console.log('📄 HTML formatado recebido:', result.formatted_html.substring(0, 200) + '...');
                            
                            if (documentPreviewArea) {
                                documentPreviewArea.style.display = 'block';
                                const documentContent = document.getElementById('certidaoDocumentContent');
                                console.log('🔍 Elemento documentContent encontrado:', !!documentContent);
                                
                                if (documentContent) {
                                    documentContent.innerHTML = result.formatted_html;
                                    console.log('✅ Preview formatado inserido com sucesso');
                                } else {
                                    console.error('❌ Elemento certidaoDocumentContent não encontrado');
                                }
                            } else {
                                console.error('❌ Elemento certidaoDocumentPreview não encontrado');
                            }
                        } else {
                            console.log('⚠️ Nenhum HTML formatado recebido');
                        }
                        
                        // Habilitar botão de download Word
                        const downloadWordBtn = document.getElementById('downloadCertidaoWord');
                        if (downloadWordBtn) {
                            downloadWordBtn.disabled = false;
                        }
                    } else {
                        statusArea.innerHTML = '<div class="alert alert-warning">Processamento concluído, mas nenhum dado foi extraído.</div>';
                    }
                } else {
                    let errorMsg = 'Erro ao processar certidão.';
                    try {
                        const err = await response.json();
                        errorMsg = err.error || errorMsg;
                    } catch (jsonError) {
                        console.error('Erro ao fazer parse do JSON de erro:', jsonError);
                    }
                    statusArea.innerHTML = `<div class="alert alert-danger">${errorMsg}</div>`;
                }
            } catch (error) {
                console.error('Erro no processamento:', error);
                const statusArea = document.getElementById('certidaoStatus');
                statusArea.innerHTML = `<div class="alert alert-danger">Erro inesperado: ${error.message}</div>`;
            }
            
            // Restaurar botão
            processButton.disabled = false;
            processButton.innerHTML = '<i class="fas fa-play me-2"></i>Processar';
        });
        
        console.log('✅ Event listeners da Certidão configurados');
    }
    
    // Configurar event listener para download Word da certidão
    const downloadWordBtn = document.getElementById('downloadCertidaoWord');
    if (downloadWordBtn) {
        downloadWordBtn.addEventListener('click', async () => {
            if (!window.currentCertidaoData) {
                ui.showAlert('Nenhum dado da certidão disponível para download Word', 'warning');
                return;
            }
            
            try {
                downloadWordBtn.disabled = true;
                downloadWordBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Gerando...';
                
                // Chamar API para gerar arquivo Word
                const response = await fetch('/api/certidao/word', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        data: window.currentCertidaoData
                    })
                });
                
                if (response.ok) {
                    const blob = await response.blob();
                    const fileName = `certidao_${new Date().toISOString().slice(0, 10)}.docx`;
                    
                    // Download do arquivo
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    ui.showAlert('Arquivo Word da certidão baixado com sucesso!', 'success');
                } else {
                    const error = await response.json();
                    ui.showAlert(`Erro ao gerar arquivo Word: ${error.error}`, 'danger');
                }
            } catch (error) {
                console.error('Erro ao gerar Word:', error);
                ui.showAlert('Erro ao gerar arquivo Word', 'danger');
            } finally {
                downloadWordBtn.disabled = false;
                downloadWordBtn.innerHTML = '<i class="fas fa-file-word me-1"></i>Word';
            }
        });
        
        console.log('✅ Event listener para download Word da certidão configurado');
    }
}

// Função para configurar event listeners do Memorial
function setupMemorialEventListeners() {
    console.log('🚀 Configurando event listeners do Memorial...');
    
    const fileInput = document.getElementById('fileInputMemorial');
    const processButton = document.getElementById('processFileMemorial');
    
    if (fileInput && processButton) {
        fileInput.addEventListener('change', (event) => {
            const files = event.target.files;
            if (files && files.length > 0) {
                processButton.disabled = false;
                processButton.classList.add('btn-pulse');
                ui.updateFileInput('fileInputMemorial', files[0].name);
                console.log(`Arquivo selecionado para memorial: ${files[0].name}`);
            } else {
                processButton.disabled = true;
                processButton.classList.remove('btn-pulse');
                ui.resetFileInput('fileInputMemorial');
            }
        });
        
        processButton.addEventListener('click', async () => {
            const files = fileInput.files;
            if (!files || files.length === 0) {
                ui.showAlert('Nenhum arquivo selecionado!', 'warning');
        return;
    }
    
            // Adicionar estado de loading
            processButton.disabled = true;
            processButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processando...';
            
            // Usar a função específica do memorial do app-simple.js
            try {
                // Definir currentFiles globalmente para o app-simple.js (apenas 1 arquivo)
                window.currentFiles = [files[0]];
                console.log('📁 currentFiles definido:', window.currentFiles);
                console.log('📁 Arquivo selecionado:', window.currentFiles[0]?.name);
                
                // Verificar se a função existe
                if (typeof window.processMemorialFiles === 'function') {
                    console.log('✅ Usando window.processMemorialFiles');
                    await window.processMemorialFiles();
                } else if (typeof processFile === 'function') {
                    console.log('✅ Usando processFile("memorial")');
                    await processFile('memorial');
                } else {
                    console.error('Função de processamento não encontrada');
                    ui.showAlert('Erro: Função de processamento não encontrada', 'danger');
                }
            } catch (error) {
                console.error('Erro no processamento:', error);
                ui.showAlert('Erro no processamento: ' + error.message, 'danger');
            }
            
            // Restaurar botão
            processButton.disabled = false;
            processButton.innerHTML = '<i class="fas fa-play me-2"></i>Processar';
        });
        
        console.log('✅ Event listeners do Memorial configurados');
    }
}

// Função para configurar event listeners do OCR
function setupOCREventListeners() {
    console.log('🚀 Configurando event listeners do OCR...');
    
    const fileInput = document.getElementById('fileInputOCR');
    const processButton = document.getElementById('processFileOCR');
    
    if (fileInput && processButton) {
        fileInput.addEventListener('change', (event) => {
            const files = event.target.files;
            if (files && files.length > 0) {
                processButton.disabled = false;
                processButton.classList.add('btn-pulse');
                ui.updateFileInput('fileInputOCR', files[0].name);
                console.log(`${files.length} arquivo(s) selecionado(s) para OCR`);
            } else {
                processButton.disabled = true;
                processButton.classList.remove('btn-pulse');
                ui.resetFileInput('fileInputOCR');
            }
        });
        
        processButton.addEventListener('click', async () => {
            const files = fileInput.files;
            if (!files || files.length === 0) {
                ui.showAlert('Nenhum arquivo selecionado!', 'warning');
                return;
            }
            
            // Adicionar estado de loading
            processButton.disabled = true;
            processButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processando...';
            
            const filesArray = Array.from(files);
            await processFile(filesArray, ui, (data) => {
                window.currentOCRData = data;
            }, 'ocr');
            
            // Restaurar botão
            processButton.disabled = false;
            processButton.innerHTML = '<i class="fas fa-play me-2"></i>Processar';
        });
        
        console.log('✅ Event listeners do OCR configurados');
    }
}

// Função para adicionar animações de entrada
function addEntranceAnimations() {
    // Animar elementos na entrada
            const elements = document.querySelectorAll('.service-card');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Adicionar estilos CSS dinâmicos para animações
const style = document.createElement('style');
style.textContent = `
    .btn-pulse {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 rgba(73, 80, 87, 0.7);
        }
        70% {
            box-shadow: 0 0 0 10px rgba(73, 80, 87, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(73, 80, 87, 0);
        }
    }
    
    .fade-in {
        animation: fadeIn 0.5s ease-in;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style); 