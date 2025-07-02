// events.js - Event listeners e inicialização
import { downloadTextFile, downloadWordFile, downloadPDFFile, downloadJSONFile } from './download.js';
import { processFile } from './process.js';

export function setupEventListeners(ui, getCurrentData, setCurrentData, getCurrentFile, setCurrentFile) {
    // File input (geral)
    ui.elements.fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        setCurrentFile(file);
        if (file) {
            ui.updateStatus(`Arquivo selecionado: ${file.name}`, 'info');
        } else {
            ui.updateStatus('Nenhum arquivo selecionado', 'warning');
        }
    });

    // File input da aba matrícula
    if (ui.elements.fileInputMatricula) {
        ui.elements.fileInputMatricula.addEventListener('change', (event) => {
            const file = event.target.files[0];
            setCurrentFile(file);
            if (file) {
                ui.updateStatus(`Arquivo selecionado: ${file.name}`, 'info');
                // Habilitar botão de processar
                if (ui.elements.processFileMatricula) {
                    ui.elements.processFileMatricula.disabled = false;
                }
            } else {
                ui.updateStatus('Nenhum arquivo selecionado', 'warning');
                if (ui.elements.processFileMatricula) {
                    ui.elements.processFileMatricula.disabled = true;
                }
            }
        });
    }

    // Método de processamento
    const methodOCR = document.getElementById('methodOCR');
    const methodChatGPT = document.getElementById('methodChatGPT');
    const chatgptOptions = document.getElementById('chatgptOptions');

    if (methodOCR && methodChatGPT && chatgptOptions) {
        methodOCR.addEventListener('change', () => {
            chatgptOptions.style.display = 'none';
        });
        methodChatGPT.addEventListener('change', () => {
            chatgptOptions.style.display = 'block';
        });
    }

    // Processar arquivo (geral)
    ui.elements.processFile.addEventListener('click', () => {
        processFile(getCurrentFile(), ui, setCurrentData);
    });

    // Processar arquivo da aba matrícula
    if (ui.elements.processFileMatricula) {
        ui.elements.processFileMatricula.addEventListener('click', () => {
            processFile(getCurrentFile(), ui, setCurrentData);
        });
    }

    // Download texto extraído
    ui.elements.downloadTextTXT.addEventListener('click', () => {
        downloadTextFile('txt', getCurrentData(), getCurrentFile(), ui);
    });
    ui.elements.downloadTextWord.addEventListener('click', () => {
        downloadTextFile('word', getCurrentData(), getCurrentFile(), ui);
    });
    ui.elements.downloadTextPDF.addEventListener('click', () => {
        downloadTextFile('pdf', getCurrentData(), getCurrentFile(), ui);
    });

    // Download dados extraídos
    ui.elements.downloadWord.addEventListener('click', () => {
        downloadWordFile(getCurrentData(), ui);
    });
    ui.elements.downloadPDF.addEventListener('click', () => {
        downloadPDFFile(getCurrentData(), ui);
    });
    ui.elements.downloadJSON.addEventListener('click', () => {
        downloadJSONFile(getCurrentData(), getCurrentFile(), ui);
    });

    // Copiar texto extraído
    ui.elements.copyText.addEventListener('click', () => {
        ui.copyExtractedText();
    });

    // Justificar texto
    ui.elements.textJustify.addEventListener('change', () => {
        if (getCurrentData() && getCurrentData().text) {
            ui.displayExtractedText(getCurrentData().text);
        }
    });

    // Inicialização de abas e outros eventos podem ser adicionados aqui
} 