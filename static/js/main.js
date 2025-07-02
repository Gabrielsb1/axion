// main.js - Ponto de entrada da aplicação
import './config.js';
import './ui.js';
import { setupEventListeners } from './events.js';

let currentData = null;
let currentFile = null;

function getCurrentData() {
    return currentData;
}
function setCurrentData(data) {
    currentData = data;
    if (data && data.text) {
        ui.displayExtractedText(data.text);
    }
}
function getCurrentFile() {
    return currentFile;
}
function setCurrentFile(file) {
    currentFile = file;
}

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
    const ui = new window.UI();
    if (!ui.validateElements()) return;
    ui.updateStatus('Pronto para processar', 'info');
    ui.checkBrowserCompatibility();
    setupEventListeners(ui, getCurrentData, setCurrentData, getCurrentFile, setCurrentFile);
    // Outras inicializações podem ser feitas aqui
}); 