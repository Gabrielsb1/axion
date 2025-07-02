// process.js - Lógica de processamento de arquivos e dados
import { processFileAPI, processOCRTraditional, processOCRTesseract } from './api.js';

export async function processFile(currentFile, ui, setCurrentData) {
    if (!currentFile) {
        ui.showAlert('Selecione um arquivo primeiro!', 'warning');
        return;
    }

    // Verificar método de processamento selecionado
    const methodOCR = document.getElementById('methodOCR');
    const methodChatGPT = document.getElementById('methodChatGPT');
    const modelGPT35 = document.getElementById('modelGPT35');
    const modelGPT4o = document.getElementById('modelGPT4o');

    let processingMethod = 'ocr'; // padrão
    let model = 'gpt-3.5-turbo'; // padrão

    if (methodChatGPT && methodChatGPT.checked) {
        processingMethod = 'chatgpt';
        if (modelGPT4o && modelGPT4o.checked) {
            model = 'gpt-4o';
        }
    }

    try {
        ui.showProgress(true);
        ui.updateStatus('Processando arquivo...', 'info');
        
        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('method', processingMethod);
        formData.append('model', model);

        let result;
        if (processingMethod === 'chatgpt') {
            result = await processFileAPI(formData);
        } else {
            // Para OCR tradicional, usar endpoint específico
            result = await processOCRTraditional(formData);
        }

        if (result.success) {
            console.log('📊 Resultado do processamento:', result);
            setCurrentData(result);
            
            // Preencher campos automaticamente para ambos os métodos
            if (result.campos) {
                console.log('🎯 Campos encontrados no resultado:', result.campos);
                fillMatriculaFields(result.campos);
            } else {
                console.warn('⚠️ Nenhum campo encontrado no resultado');
            }
            
            const modelName = processingMethod === 'chatgpt' ? result.model : 'OCR Tradicional';
            ui.updateStatus(`Arquivo processado com sucesso usando ${modelName}!`, 'success');
            ui.showAlert(`Processamento concluído com sucesso usando ${modelName}!`, 'success');
        } else {
            throw new Error(result.error || 'Erro desconhecido no processamento');
        }
    } catch (error) {
        console.error('Erro no processamento:', error);
        ui.updateStatus('Erro no processamento do arquivo', 'danger');
        ui.showAlert(`Erro: ${error.message}`, 'danger');
    } finally {
        ui.showProgress(false);
    }
}

function fillMatriculaFields(campos) {
    console.log('🔍 Preenchendo campos com dados:', campos);
    
    // Verificar se campos existe e é um objeto
    if (!campos || typeof campos !== 'object') {
        console.error('❌ Dados de campos inválidos:', campos);
        return;
    }
    
    // Preencher campos da matrícula com os dados extraídos pela IA
    const fieldMappings = {
        'numero_matricula': 'matricula',
        'data_matricula': 'dataMatricula',
        'descricao_imovel': 'descricaoImovel',
        'endereco': 'endereco',
        'area_privativa': 'areaPrivativa',
        'area_total': 'areaTotal',
        'garagem_vagas': 'garagem',
        'proprietarios': 'proprietarios',
        'livro_anterior': 'livroAnterior',
        'folha_anterior': 'folhaAnterior',
        'matricula_anterior': 'matriculaAnterior',
        'tipo_titulo': 'tipoTitulo',
        'valor_titulo': 'valorTitulo',
        'comprador': 'comprador',
        'cpf_cnpj': 'cpfCnpj',
        'valor_itbi': 'valorITBI',
        'numero_dam': 'numeroDAM',
        'data_pagamento_itbi': 'dataPagamentoITBI'
    };

    let camposPreenchidos = 0;
    for (const [apiField, htmlField] of Object.entries(fieldMappings)) {
        const element = document.getElementById(htmlField);
        if (element) {
            if (campos[apiField] && campos[apiField].trim()) {
                element.value = campos[apiField];
                console.log(`✅ Campo ${apiField} preenchido: ${campos[apiField]}`);
                camposPreenchidos++;
            } else {
                element.value = '';
                console.log(`⚠️ Campo ${apiField} vazio ou não encontrado`);
            }
        } else {
            console.error(`❌ Elemento HTML não encontrado: ${htmlField}`);
        }
    }
    
    console.log(`📊 Total de campos preenchidos: ${camposPreenchidos}/${Object.keys(fieldMappings).length}`);
} 