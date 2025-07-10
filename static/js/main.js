// main.js - Configuração específica para matrícula
import { processFile } from './process.js';

// Configuração da UI
const ui = {
    showAlert: function(message, type = 'info') {
        // Implementação simples de alerta
        console.log(`[${type.toUpperCase()}] ${message}`);
        // Aqui você pode implementar um sistema de alertas mais sofisticado
    },
    updateStatus: function(message, type = 'info') {
        const statusElement = document.getElementById('matriculaStatus');
        if (statusElement) {
            statusElement.innerHTML = `<div class="alert alert-${type}"><i class="fas fa-spinner fa-spin me-2"></i>${message}</div>`;
        }
    },
    showProgress: function(show) {
        // Implementação de progresso se necessário
        console.log(`Progress: ${show}`);
    }
};

// Função para configurar event listeners específicos da matrícula
function setupMatriculaEventListeners() {
    console.log('🚀 Configurando event listeners da matrícula...');
    
    // File input para matrícula
    const fileInputMatricula = document.getElementById('fileInputMatricula');
    if (fileInputMatricula) {
        // Remover listeners existentes se houver
        const newFileInput = fileInputMatricula.cloneNode(true);
        fileInputMatricula.parentNode.replaceChild(newFileInput, fileInputMatricula);
        
        newFileInput.addEventListener('change', (event) => {
            const files = event.target.files;
            const processButton = document.getElementById('processFileMatricula');
            
            if (files && files.length > 0) {
                processButton.disabled = false;
                console.log(`${files.length} arquivo(s) selecionado(s) para matrícula`);
            } else {
                processButton.disabled = true;
            }
        });
        console.log('✅ File input matrícula configurado');
    }
    
    // Process button para matrícula
    const processButtonMatricula = document.getElementById('processFileMatricula');
    if (processButtonMatricula) {
        // Remover listeners existentes se houver
        const newProcessButton = processButtonMatricula.cloneNode(true);
        processButtonMatricula.parentNode.replaceChild(newProcessButton, processButtonMatricula);
        
        newProcessButton.addEventListener('click', async () => {
            const fileInput = document.getElementById('fileInputMatricula');
            const files = fileInput.files;
            
            if (!files || files.length === 0) {
                ui.showAlert('Nenhum arquivo selecionado!', 'warning');
                return;
            }
            
            // Converter FileList para Array
            const filesArray = Array.from(files);
            
            // Processar arquivos
            await processFile(filesArray, ui, (data) => {
                // Callback para definir dados atuais
                window.currentData = data;
            });
        });
        console.log('✅ Process button matrícula configurado');
    }
    
    // Download buttons para matrícula
    const downloadButtons = [
        { id: 'downloadWord', func: downloadWordFile },
        { id: 'downloadPDF', func: downloadPDFFile },
        { id: 'downloadJSON', func: downloadJSONFile }
    ];
    
    downloadButtons.forEach(button => {
        const element = document.getElementById(button.id);
        if (element) {
            // Remover listeners existentes se houver
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
            
            newElement.addEventListener('click', () => button.func());
            console.log(`✅ Download button ${button.id} configurado para matrícula`);
        }
    });
}

// Funções de download específicas para matrícula
function downloadWordFile() {
    if (!window.currentData) {
        ui.showAlert('Nenhum dado disponível para download', 'warning');
        return;
    }
    
    const content = formatDataForDownload(window.currentData);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dados_matricula_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    ui.showAlert('Arquivo Word baixado com sucesso!', 'success');
}

function downloadPDFFile() {
    if (!window.currentData) {
        ui.showAlert('Nenhum dado disponível para download', 'warning');
        return;
    }

    try {
        const doc = new window.jspdf.jsPDF();
        const content = formatDataForDownload(window.currentData);
        const lines = doc.splitTextToSize(content, 180);
        doc.text(lines, 10, 10);
        doc.save(`dados_matricula_${new Date().toISOString().slice(0, 10)}.pdf`);
        ui.showAlert('PDF baixado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        ui.showAlert('Erro ao gerar PDF. Verifique se a biblioteca jsPDF está carregada.', 'error');
    }
}

function downloadJSONFile() {
    if (!window.currentData) {
        ui.showAlert('Nenhum dado disponível para download', 'warning');
        return;
    }
    
    const jsonData = {
        metadata: {
            extractedAt: new Date().toISOString(),
            service: 'matricula'
        },
        data: window.currentData
    };
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dados_matricula_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    ui.showAlert('JSON baixado com sucesso!', 'success');
}

// Função para formatar dados para download
function formatDataForDownload(data) {
    let content = 'DADOS DA MATRÍCULA\n';
    content += '='.repeat(50) + '\n\n';
    
    if (data.campos) {
        // CADASTRO
        content += '=== CADASTRO ===\n';
        content += `Inscrição Imobiliária: ${data.campos.inscricao_imobiliaria || 'Não informado'}\n`;
        content += `RIP: ${data.campos.rip || 'Não informado'}\n\n`;
        
        // DADOS DO IMÓVEL
        content += '=== DADOS DO IMÓVEL ===\n';
        content += `Tipo de Imóvel: ${data.campos.tipo_imovel || 'Não informado'}\n`;
        content += `Tipo de Logradouro: ${data.campos.tipo_logradouro || 'Não informado'}\n`;
        content += `CEP: ${data.campos.cep || 'Não informado'}\n`;
        content += `Nome do Logradouro: ${data.campos.nome_logradouro || 'Não informado'}\n`;
        content += `Número do Lote: ${data.campos.numero_lote || 'Não informado'}\n`;
        content += `Bloco: ${data.campos.bloco || 'Não informado'}\n`;
        content += `Pavimento: ${data.campos.pavimento || 'Não informado'}\n`;
        content += `Andar: ${data.campos.andar || 'Não informado'}\n`;
        content += `Loteamento: ${data.campos.loteamento || 'Não informado'}\n`;
        content += `Número do Loteamento: ${data.campos.numero_loteamento || 'Não informado'}\n`;
        content += `Quadra: ${data.campos.quadra || 'Não informado'}\n`;
        content += `Bairro: ${data.campos.bairro || 'Não informado'}\n`;
        content += `Cidade: ${data.campos.cidade || 'Não informado'}\n`;
        content += `Dominialidade: ${data.campos.dominialidade || 'Não informado'}\n`;
        content += `Área Total: ${data.campos.area_total || 'Não informado'}\n`;
        content += `Área Construída: ${data.campos.area_construida || 'Não informado'}\n`;
        content += `Área Privativa: ${data.campos.area_privativa || 'Não informado'}\n`;
        content += `Área de Uso Comum: ${data.campos.area_uso_comum || 'Não informado'}\n`;
        content += `Área Correspondente: ${data.campos.area_correspondente || 'Não informado'}\n`;
        content += `Fração Ideal: ${data.campos.fracao_ideal || 'Não informado'}\n\n`;
        
        // DADOS PESSOAIS
        content += '=== DADOS PESSOAIS ===\n';
        content += `CPF/CNPJ: ${data.campos.cpf_cnpj || 'Não informado'}\n`;
        content += `Nome Completo: ${data.campos.nome_completo || 'Não informado'}\n`;
        content += `Sexo: ${data.campos.sexo || 'Não informado'}\n`;
        content += `Nacionalidade: ${data.campos.nacionalidade || 'Não informado'}\n`;
        content += `Estado Civil: ${data.campos.estado_civil || 'Não informado'}\n`;
        content += `Profissão: ${data.campos.profissao || 'Não informado'}\n`;
        content += `RG: ${data.campos.rg || 'Não informado'}\n`;
        content += `CNH: ${data.campos.cnh || 'Não informado'}\n`;
        content += `Endereço Completo: ${data.campos.endereco_completo || 'Não informado'}\n`;
        content += `Regime de Casamento: ${data.campos.regime_casamento || 'Não informado'}\n`;
        content += `Data do Casamento: ${data.campos.data_casamento || 'Não informado'}\n`;
        content += `Matrícula do Casamento: ${data.campos.matricula_casamento || 'Não informado'}\n`;
        content += `Natureza Jurídica: ${data.campos.natureza_juridica || 'Não informado'}\n`;
        content += `Representante Legal: ${data.campos.representante_legal || 'Não informado'}\n\n`;
        
        // INFORMAÇÕES PARA ATOS
        content += '=== INFORMAÇÕES PARA ATOS ===\n';
        content += `Valor da Transação: ${data.campos.valor_transacao || 'Não informado'}\n`;
        content += `Valor de Avaliação: ${data.campos.valor_avaliacao || 'Não informado'}\n`;
        content += `Data da Alienação: ${data.campos.data_alienacao || 'Não informado'}\n`;
        content += `Forma de Alienação: ${data.campos.forma_alienacao || 'Não informado'}\n`;
        content += `Valor da Dívida: ${data.campos.valor_divida || 'Não informado'}\n`;
        content += `Valor da Alienação do Contrato: ${data.campos.valor_alienacao_contrato || 'Não informado'}\n`;
        content += `Tipo de Ônus: ${data.campos.tipo_onus || 'Não informado'}\n`;
    }
    
    return content;
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Axion - Configurando matrícula...');
    // Aguardar um pouco para o app-simple.js carregar primeiro
    setTimeout(() => {
        setupMatriculaEventListeners();
    }, 100);
}); 