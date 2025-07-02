// ocr-tesseract.js - Funcionalidade específica para OCR Tesseract

class OCRTesseractHandler {
    constructor() {
        this.currentFile = null;
        this.currentResult = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUI();
    }

    bindEvents() {
        // Input de arquivo
        const fileInput = document.getElementById('fileInputOCRTesseract');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Botão de processamento
        const processBtn = document.getElementById('processFileOCRTesseract');
        if (processBtn) {
            processBtn.addEventListener('click', () => this.processFile());
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) {
            this.currentFile = null;
            this.updateUI();
            return;
        }

        // Validar arquivo
        const validation = UTILS.validateFile(file);
        if (!validation.valid) {
            this.showAlert(validation.error, 'danger');
            event.target.value = '';
            this.currentFile = null;
            this.updateUI();
            return;
        }

        // Verificar se é PDF
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            this.showAlert('Apenas arquivos PDF são permitidos para OCR Tesseract', 'warning');
            event.target.value = '';
            this.currentFile = null;
            this.updateUI();
            return;
        }

        this.currentFile = file;
        this.updateUI();
        this.showAlert(`Arquivo selecionado: ${file.name} (${UTILS.formatFileSize(file.size)})`, 'success');
    }

    async processFile() {
        if (!this.currentFile) {
            this.showAlert('Selecione um arquivo PDF primeiro!', 'warning');
            return;
        }

        try {
            this.showProgress(true);
            this.updateStatus('Enviando arquivo para processamento OCR...', 'info');

            const formData = new FormData();
            formData.append('file', this.currentFile);

            const response = await fetch('/api/ocr-tesseract', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                this.currentResult = result;
                this.updateStatus('PDF processado com sucesso!', 'success');
                this.showAlert(result.message, 'success');
                this.showDownloadButton();
            } else {
                throw new Error(result.error || 'Erro desconhecido no processamento');
            }

        } catch (error) {
            console.error('Erro no processamento OCR:', error);
            this.updateStatus('Erro no processamento do arquivo', 'danger');
            this.showAlert(`Erro: ${error.message}`, 'danger');
        } finally {
            this.showProgress(false);
        }
    }

    showDownloadButton() {
        const statusDiv = document.getElementById('ocrTesseractStatus');
        if (statusDiv && this.currentResult) {
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'btn btn-success mt-3';
            downloadBtn.innerHTML = '<i class="fas fa-download me-2"></i>Baixar PDF Pesquisável';
            downloadBtn.onclick = () => this.downloadFile();
            
            // Remover botão anterior se existir
            const existingBtn = statusDiv.querySelector('.btn-success');
            if (existingBtn) {
                existingBtn.remove();
            }
            
            statusDiv.appendChild(downloadBtn);
        }
    }

    async downloadFile() {
        if (!this.currentResult) {
            this.showAlert('Nenhum arquivo processado para download!', 'warning');
            return;
        }

        try {
            this.updateStatus('Iniciando download...', 'info');
            
            const response = await fetch(this.currentResult.download_url);
            if (!response.ok) {
                throw new Error(`Erro no download: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = this.currentResult.processed_filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            this.updateStatus('Download concluído!', 'success');
            this.showAlert('PDF pesquisável baixado com sucesso!', 'success');

        } catch (error) {
            console.error('Erro no download:', error);
            this.updateStatus('Erro no download', 'danger');
            this.showAlert(`Erro no download: ${error.message}`, 'danger');
        }
    }

    updateUI() {
        const processBtn = document.getElementById('processFileOCRTesseract');
        if (processBtn) {
            processBtn.disabled = !this.currentFile;
        }
    }

    showProgress(show) {
        const processBtn = document.getElementById('processFileOCRTesseract');
        if (processBtn) {
            if (show) {
                processBtn.disabled = true;
                processBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processando...';
            } else {
                processBtn.disabled = !this.currentFile;
                processBtn.innerHTML = '<i class="fas fa-play me-1"></i>Processar com Python OCR';
            }
        }
    }

    updateStatus(message, type = 'info') {
        const statusDiv = document.getElementById('ocrTesseractStatus');
        if (statusDiv) {
            // Manter botões de download se existirem
            const downloadButtons = statusDiv.querySelectorAll('.btn');
            
            statusDiv.innerHTML = '';
            
            // Adicionar mensagem de status
            const statusMsg = document.createElement('div');
            statusMsg.className = `alert alert-${type} mt-3`;
            statusMsg.innerHTML = `<i class="fas fa-info-circle me-2"></i>${message}`;
            statusDiv.appendChild(statusMsg);
            
            // Restaurar botões de download
            downloadButtons.forEach(btn => {
                statusDiv.appendChild(btn);
            });
        }
    }

    showAlert(message, type = 'info') {
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
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se estamos na aba OCR Tesseract
    const ocrTab = document.getElementById('ocr-tesseract-tab');
    if (ocrTab) {
        // Inicializar handler quando a aba for ativada
        ocrTab.addEventListener('shown.bs.tab', () => {
            if (!window.ocrTesseractHandler) {
                window.ocrTesseractHandler = new OCRTesseractHandler();
            }
        });
        
        // Se a aba já estiver ativa, inicializar imediatamente
        if (ocrTab.classList.contains('active')) {
            window.ocrTesseractHandler = new OCRTesseractHandler();
        }
    }
}); 