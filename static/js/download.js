// download.js - Funções de download de arquivos
import { downloadTextAPI } from './api.js';

// Utilitário para formatar dados estruturados em texto
function formatStructuredData(data) {
    let txt = '';
    
    // CADASTRO
    txt += '=== CADASTRO ===\n';
    txt += `Inscrição Imobiliária: ${data.inscricao_imobiliaria || ''}\n`;
    txt += `RIP: ${data.rip || ''}\n`;
    txt += '\n';
    
    // DADOS DO IMÓVEL
    txt += '=== DADOS DO IMÓVEL ===\n';
    txt += `Tipo de Imóvel: ${data.tipo_imovel || ''}\n`;
    txt += `Tipo de Logradouro: ${data.tipo_logradouro || ''}\n`;
    txt += `CEP: ${data.cep || ''}\n`;
    txt += `Nome do Logradouro: ${data.nome_logradouro || ''}\n`;
    txt += `Número do Lote: ${data.numero_lote || ''}\n`;
    txt += `Bloco: ${data.bloco || ''}\n`;
    txt += `Pavimento: ${data.pavimento || ''}\n`;
    txt += `Andar: ${data.andar || ''}\n`;
    txt += `Loteamento: ${data.loteamento || ''}\n`;
    txt += `Número do Loteamento: ${data.numero_loteamento || ''}\n`;
    txt += `Quadra: ${data.quadra || ''}\n`;
    txt += `Bairro: ${data.bairro || ''}\n`;
    txt += `Cidade: ${data.cidade || ''}\n`;
    txt += `Dominialidade: ${data.dominialidade || ''}\n`;
    txt += `Área Total: ${data.area_total || ''}\n`;
    txt += `Área Construída: ${data.area_construida || ''}\n`;
    txt += `Área Privativa: ${data.area_privativa || ''}\n`;
    txt += `Área de Uso Comum: ${data.area_uso_comum || ''}\n`;
    txt += `Área Correspondente: ${data.area_correspondente || ''}\n`;
    txt += `Fração Ideal: ${data.fracao_ideal || ''}\n`;
    txt += '\n';
    
    // DADOS PESSOAIS
    txt += '=== DADOS PESSOAIS ===\n';
    txt += `CPF/CNPJ: ${data.cpf_cnpj || ''}\n`;
    txt += `Nome Completo: ${data.nome_completo || ''}\n`;
    txt += `Sexo: ${data.sexo || ''}\n`;
    txt += `Nacionalidade: ${data.nacionalidade || ''}\n`;
    txt += `Estado Civil: ${data.estado_civil || ''}\n`;
    txt += `Profissão: ${data.profissao || ''}\n`;
    txt += `RG: ${data.rg || ''}\n`;
    txt += `CNH: ${data.cnh || ''}\n`;
    txt += `Endereço Completo: ${data.endereco_completo || ''}\n`;
    txt += `Regime de Casamento: ${data.regime_casamento || ''}\n`;
    txt += `Data do Casamento: ${data.data_casamento || ''}\n`;
    txt += `Matrícula do Casamento: ${data.matricula_casamento || ''}\n`;
    txt += `Natureza Jurídica: ${data.natureza_juridica || ''}\n`;
    txt += `Representante Legal: ${data.representante_legal || ''}\n`;
    txt += '\n';
    
    // INFORMAÇÕES PARA ATOS
    txt += '=== INFORMAÇÕES PARA ATOS ===\n';
    txt += `Valor da Transação: ${data.valor_transacao || ''}\n`;
    txt += `Valor de Avaliação: ${data.valor_avaliacao || ''}\n`;
    txt += `Data da Alienação: ${data.data_alienacao || ''}\n`;
    txt += `Forma de Alienação: ${data.forma_alienacao || ''}\n`;
    txt += `Valor da Dívida: ${data.valor_divida || ''}\n`;
    txt += `Valor da Alienação do Contrato: ${data.valor_alienacao_contrato || ''}\n`;
    txt += `Tipo de Ônus: ${data.tipo_onus || ''}\n`;
    
    return txt;
}

export function downloadWordFile(currentData, ui) {
    console.log('[downloadWordFile] Chamado', currentData);
    if (!currentData) {
        ui.showAlert('Nenhum dado para baixar!', 'warning');
        return;
    }
    const content = formatStructuredData(currentData);
    const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const fileName = `dados_matricula_${new Date().toISOString().slice(0, 10)}.docx`;
    downloadBlobWithLocation(blob, fileName, 'word', ui);
}

export function downloadPDFFile(currentData, ui) {
    console.log('[downloadPDFFile] Chamado', currentData);
    if (!currentData) {
        ui.showAlert('Nenhum dado para baixar!', 'warning');
        return;
    }
    let jsPDF = null;
    if (window.jspdf && window.jspdf.jsPDF) {
        jsPDF = window.jspdf.jsPDF;
    } else if (window.jsPDF) {
        jsPDF = window.jsPDF;
    }
    if (!jsPDF) {
        ui.showAlert('jsPDF não carregado!', 'danger');
        return;
    }
    const doc = new jsPDF();
    const content = formatStructuredData(currentData);
    const lines = doc.splitTextToSize(content, 180);
    doc.text(lines, 10, 10);
    doc.save(`dados_matricula_${new Date().toISOString().slice(0, 10)}.pdf`);
    ui.showAlert('PDF gerado e baixado com sucesso!', 'success');
}

export function downloadJSONFile(currentData, currentFile, ui) {
    console.log('[downloadJSONFile] Chamado', currentData, currentFile);
    if (!currentData) {
        ui.showAlert('Nenhum dado para baixar!', 'warning');
        return;
    }
    const jsonData = {
        metadata: {
            extractedAt: new Date().toISOString(),
            fileName: currentFile ? currentFile.name : 'unknown',
            model: 'chatgpt'
        },
        data: currentData
    };
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json;charset=utf-8' });
    const fileName = `dados_matricula_${new Date().toISOString().slice(0, 10)}.json`;
    downloadBlobWithLocation(blob, fileName, 'json', ui);
}

export async function downloadTextFile(format, currentData, currentFile, ui) {
    console.log('[downloadTextFile] Chamado para', format, currentData, currentFile);
    if (!currentData || !currentData.text) {
        ui.showAlert('Nenhum texto para baixar!', 'warning');
        return;
    }
    try {
        ui.updateStatus(`Gerando arquivo ${format.toUpperCase()}...`, 'info');
        const result = await downloadTextAPI({
            text: currentData.text,
            format: format,
            fileName: `texto_extraido_${currentFile ? currentFile.name.replace(/\.[^/.]+$/, '') : 'documento'}`
        });
        if (result.success && result.file && result.file.url) {
            await downloadFileWithLocation(result.file.url, result.file.name, format, ui);
            ui.updateStatus('Arquivo baixado com sucesso!', 'success');
            ui.showAlert(`Arquivo ${format.toUpperCase()} baixado com sucesso!`, 'success');
        } else {
            throw new Error(result.error || 'Erro ao gerar arquivo');
        }
    } catch (error) {
        console.error('Erro no download:', error);
        ui.updateStatus('Erro ao gerar arquivo', 'danger');
        ui.showAlert(`Erro: ${error.message}`, 'danger');
    }
}

export async function downloadFileWithLocation(fileUrl, fileName, format, ui) {
    console.log('[downloadFileWithLocation] url:', fileUrl, 'name:', fileName, 'format:', format);
    try {
        if ('showSaveFilePicker' in window) {
            let extension;
            switch (format) {
                case 'txt': extension = '.txt'; break;
                case 'word': extension = '.docx'; break;
                case 'pdf': extension = '.pdf'; break;
                default: extension = '.txt';
            }
            const options = {
                suggestedName: fileName,
                types: [{
                    description: `Arquivo ${format.toUpperCase()}`,
                    accept: {
                        'text/plain': ['.txt'],
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                        'application/pdf': ['.pdf']
                    }
                }]
            };
            const fileHandle = await window.showSaveFilePicker(options);
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
        } else {
            const a = document.createElement('a');
            a.href = fileUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    } catch (error) {
        console.error('Erro ao salvar arquivo:', error);
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

export async function downloadBlobWithLocation(blob, fileName, format, ui) {
    console.log('[downloadBlobWithLocation] Chamado', fileName, format);
    try {
        if ('showSaveFilePicker' in window) {
            const options = {
                suggestedName: fileName,
                types: [{
                    description: `Arquivo ${format.toUpperCase()}`,
                    accept: {
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                        'application/json': ['.json'],
                        'application/pdf': ['.pdf']
                    }
                }]
            };
            const fileHandle = await window.showSaveFilePicker(options);
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            ui.showAlert(`Arquivo ${format.toUpperCase()} salvo com sucesso!`, 'success');
        } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            ui.showAlert(`Arquivo ${format.toUpperCase()} baixado com sucesso!`, 'success');
        }
    } catch (error) {
        console.error('Erro ao salvar arquivo:', error);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        ui.showAlert(`Arquivo ${format.toUpperCase()} baixado com sucesso!`, 'success');
    }
} 