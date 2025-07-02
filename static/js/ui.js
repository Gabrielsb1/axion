// Módulo de Interface do Usuário
class UI {
    constructor() {
        this.elements = {};
        this.initializeElements();
    }
    
    initializeElements() {
        // Mapear todos os elementos DOM
        Object.keys(DOM_ELEMENTS).forEach(key => {
            const selector = DOM_ELEMENTS[key];
            if (selector.startsWith('input[') || selector.startsWith('#')) {
                this.elements[key] = document.querySelector(selector);
            } else {
                this.elements[key] = document.getElementById(selector);
            }
        });
        
        console.log('🔍 Elementos DOM inicializados:', Object.keys(this.elements).length);
    }
    
    // Verificar se todos os elementos essenciais existem
    validateElements() {
        const missingElements = [];
        const essentialElements = [
            'saveConfig', 'fileInput', 'processFile', 'status', 'progress', 
            'extractedTextContainer', 'textJustify', 'copyText',
            'downloadTextTXT', 'downloadTextWord', 'downloadTextPDF',
            'downloadWord', 'downloadPDF', 'downloadJSON'
        ];
        
        essentialElements.forEach(id => {
            if (!this.elements[id]) {
                missingElements.push(id);
                console.error(`❌ Elemento ${id} não encontrado no DOM`);
            } else {
                console.log(`✅ Elemento ${id} encontrado`);
            }
        });
        
        if (missingElements.length > 0) {
            console.error('❌ Elementos faltando:', missingElements);
            this.showAlert(`Erro: Elementos não encontrados: ${missingElements.join(', ')}`, 'danger');
            return false;
        }
        
        console.log('✅ Todos os elementos essenciais encontrados');
        return true;
    }
    
    // Atualizar status
    updateStatus(message, type = 'info') {
        const status = this.elements.status;
        if (status) {
            status.className = `alert alert-${type}`;
            status.innerHTML = `<i class="fas fa-info-circle me-2"></i>${message}`;
        }
    }
    
    // Mostrar/esconder progresso
    showProgress(show) {
        const progress = this.elements.progress;
        const progressBar = document.querySelector(DOM_ELEMENTS.progressBar);
        
        if (!progress || !progressBar) return;
        
        if (show) {
            progress.classList.remove('d-none');
            progressBar.style.width = '0%';
            
            // Simular progresso
            let width = 0;
            const interval = setInterval(() => {
                if (width >= 90) {
                    clearInterval(interval);
                } else {
                    width += Math.random() * 10;
                    progressBar.style.width = width + '%';
                }
            }, CONFIG.PROGRESS_INTERVAL);
            
            // Armazenar o intervalo para limpar depois
            progress.dataset.interval = interval;
        } else {
            progress.classList.add('d-none');
            progressBar.style.width = '100%';
            
            // Limpar intervalo se existir
            if (progress.dataset.interval) {
                clearInterval(parseInt(progress.dataset.interval));
                delete progress.dataset.interval;
            }
        }
    }
    
    // Mostrar alertas
    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Auto-remover após timeout
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, CONFIG.ALERT_TIMEOUT);
    }
    
    // Verificar compatibilidade do navegador
    checkBrowserCompatibility() {
        const supportsFilePicker = 'showSaveFilePicker' in window;
        const compatibilityIndicator = document.getElementById('browserCompatibility');
        
        if (supportsFilePicker) {
            console.log('✅ Navegador suporta seleção de local para downloads');
            
            // Mostrar indicador de compatibilidade
            if (compatibilityIndicator) {
                compatibilityIndicator.classList.remove('d-none');
            }
            
            // Adicionar indicador visual de que a funcionalidade está disponível
            const downloadButtons = document.querySelectorAll('[id^="download"]');
            downloadButtons.forEach(button => {
                button.title = 'Clique para selecionar onde salvar o arquivo';
                button.classList.add('btn-advanced');
            });
        } else {
            console.log('⚠️ Navegador não suporta seleção de local, usando download padrão');
            
            // Adicionar indicador visual de funcionalidade limitada
            const downloadButtons = document.querySelectorAll('[id^="download"]');
            downloadButtons.forEach(button => {
                button.title = 'Arquivo será baixado na pasta padrão do navegador';
            });
            
            // Mostrar aviso discreto após um delay
            setTimeout(() => {
                this.showAlert('💡 Dica: Use Chrome, Edge ou Firefox para selecionar onde salvar os arquivos', 'info');
            }, 2000);
        }
    }
    
    // Exibir texto extraído
    displayExtractedText(text) {
        const container = this.elements.extractedTextContainer;
        const isJustified = this.elements.textJustify?.checked;
        
        if (!container) {
            console.error('❌ Container de texto extraído não encontrado');
            return;
        }
        
        if (isJustified) {
            // Formatar texto justificado
            const formattedText = this.formatJustifiedText(text);
            container.innerHTML = `<div style="text-align: justify; line-height: 1.6; font-family: 'Courier New', monospace;">${formattedText}</div>`;
        } else {
            // Texto simples
            container.innerHTML = `<pre style="font-family: 'Courier New', monospace; line-height: 1.6;">${text}</pre>`;
        }
        
        console.log('✅ Texto extraído exibido com sucesso');
    }
    
    // Formatar texto justificado
    formatJustifiedText(text) {
        // Quebrar em parágrafos e justificar
        const paragraphs = text.split('\n\n').filter(p => p.trim());
        return paragraphs.map(p => {
            const lines = p.split('\n').filter(line => line.trim());
            return lines.map(line => `<div style="text-align: justify; margin-bottom: 0.5em;">${line}</div>`).join('');
        }).join('<br><br>');
    }
    
    // Alternar justificação do texto
    toggleTextJustify() {
        if (window.currentData && window.currentData.text) {
            this.displayExtractedText(window.currentData.text);
        }
    }
    
    // Copiar texto extraído
    copyExtractedText() {
        if (!window.currentData || !window.currentData.text) {
            this.showAlert('Nenhum texto para copiar!', 'warning');
            return;
        }
        
        navigator.clipboard.writeText(window.currentData.text).then(() => {
            this.showAlert('Texto copiado para a área de transferência!', 'success');
        }).catch(() => {
            this.showAlert('Erro ao copiar texto!', 'danger');
        });
    }
}

// Exportar para uso global
window.UI = UI; 