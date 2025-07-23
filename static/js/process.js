// process.js - Processamento de arquivos

// Utilitários
const UTILS = {
    validateFile: function(file) {
        if (!file) {
            return { valid: false, error: 'Nenhum arquivo selecionado' };
        }
        
        const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
        const fileName = file.name.toLowerCase();
        const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
        
        if (!hasValidExtension) {
            return { valid: false, error: 'Tipo de arquivo não suportado. Use PDF, JPG, JPEG ou PNG.' };
        }
        
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return { valid: false, error: 'Arquivo muito grande. Tamanho máximo: 10MB' };
        }
        
        return { valid: true };
    }
};

export async function processFile(files, ui, setCurrentData) {
    if (!files || files.length === 0) {
        ui.showAlert('Nenhum arquivo selecionado!', 'warning');
        return;
    }

    // Validar arquivos
    for (let i = 0; i < files.length; i++) {
        const validation = UTILS.validateFile(files[i]);
        if (!validation.valid) {
            ui.showAlert(`Erro no arquivo ${files[i].name}: ${validation.error}`, 'danger');
            return;
        }
    }

    ui.showProgress(true);
    ui.updateStatus(`Processando ${files.length} arquivo(s)...`, 'info');

    try {
        // Processar todos os arquivos e combinar os resultados
        let combinedData = {};
        let processedCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            ui.updateStatus(`Processando arquivo ${i + 1} de ${files.length}: ${file.name}`, 'info');

            const formData = new FormData();
            formData.append('file', file);
            
            // Sempre usar gpt-4o como modelo
            formData.append('model', 'gpt-4o');
            formData.append('service', 'matricula');

            const response = await fetch('/api/process-file', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                let data;
                try {
                    data = await response.json();
                } catch (jsonError) {
                    // Se não conseguir fazer parse do JSON, tentar ler como texto
                    const textResponse = await response.text();
                    console.error('Erro ao fazer parse do JSON:', jsonError);
                    console.error('Resposta recebida:', textResponse);
                    ui.updateStatus(`Erro no processamento do arquivo ${file.name}: Resposta inválida do servidor`, 'danger');
                    ui.showAlert(`Erro no processamento do arquivo ${file.name}: Resposta inválida do servidor`, 'danger');
                    return;
                }
                
                // Combinar os dados extraídos
                if (data.campos) {
                    Object.assign(combinedData, data.campos);
                }
                
                processedCount++;
            } else {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    // Se não conseguir fazer parse do JSON de erro, tentar ler como texto
                    const textResponse = await response.text();
                    console.error('Erro ao fazer parse do JSON de erro:', jsonError);
                    console.error('Resposta de erro recebida:', textResponse);
                    ui.updateStatus(`Erro no arquivo ${file.name}: Erro no servidor`, 'danger');
                    ui.showAlert(`Erro no processamento do arquivo ${file.name}: Erro no servidor`, 'danger');
                    return;
                }
                ui.updateStatus(`Erro no arquivo ${file.name}: ${errorData.error}`, 'danger');
                ui.showAlert(`Erro no processamento do arquivo ${file.name}: ${errorData.error}`, 'danger');
                return;
            }
        }

        // Definir os dados combinados
        setCurrentData({ campos: combinedData });
        
        // Preencher os campos da interface com os dados extraídos
        fillMatriculaFields(combinedData);
        
        ui.updateStatus(`${processedCount} arquivo(s) processado(s) com sucesso!`, 'success');
        ui.showAlert('Processamento concluído!', 'success');
    } catch (error) {
        console.error('Erro no processamento:', error);
        ui.updateStatus('Erro inesperado no processamento', 'danger');
        ui.showAlert('Erro inesperado no processamento', 'danger');
    } finally {
        ui.showProgress(false);
    }
}

// Função para preencher os campos da matrícula
function fillMatriculaFields(campos) {
    console.log('🔍 Dados recebidos para preenchimento:', campos);
    
    // Mapeamento dos campos do backend para os IDs do frontend
    const fieldMapping = {
        // CADASTRO
        'inscricao_imobiliaria': 'inscricaoImobiliaria',
        'rip': 'rip',
        
        // DADOS DO IMÓVEL
        'tipo_imovel': 'tipoImovel',
        'tipo_logradouro': 'tipoLogradouro',
        'cep': 'cep',
        'nome_logradouro': 'nomeLogradouro',
        'numero_lote': 'numeroLote',
        'bloco': 'bloco',
        'pavimento': 'pavimento',
        'andar': 'andar',
        'loteamento': 'loteamento',
        'numero_loteamento': 'numeroLoteamento',
        'quadra': 'quadra',
        'bairro': 'bairro',
        'cidade': 'cidade',
        'dominialidade': 'dominialidade',
        'area_total': 'areaTotal',
        'area_construida': 'areaConstruida',
        'area_privativa': 'areaPrivativa',
        'area_uso_comum': 'areaUsoComum',
        'area_correspondente': 'areaCorrespondente',
        'fracao_ideal': 'fracaoIdeal',
        
        // DADOS PESSOAIS
        'cpf_cnpj': 'cpfCnpj',
        'nome_completo': 'nomeCompleto',
        'sexo': 'sexo',
        'nacionalidade': 'nacionalidade',
        'estado_civil': 'estadoCivil',
        'profissao': 'profissao',
        'rg': 'rg',
        'cnh': 'cnh',
        'endereco_completo': 'enderecoCompleto',
        'regime_casamento': 'regimeCasamento',
        'data_casamento': 'dataCasamento',
        'matricula_casamento': 'matriculaCasamento',
        'natureza_juridica': 'naturezaJuridica',
        'representante_legal': 'representanteLegal',
        
        // INFORMAÇÕES UTILIZADAS PARA OS ATOS
        'valor_transacao': 'valorTransacao',
        'valor_avaliacao': 'valorAvaliacao',
        'data_alienacao': 'dataAlienacao',
        'forma_alienacao': 'formaAlienacao',
        'valor_divida': 'valorDivida',
        'valor_alienacao_contrato': 'valorAlienacaoContrato',
        'tipo_onus': 'tipoOnus'
    };

    let preenchidos = 0;
    let naoEncontrados = 0;

    // Preencher cada campo
    Object.entries(fieldMapping).forEach(([backendField, frontendId]) => {
        const element = document.getElementById(frontendId);
        if (element) {
            const value = campos[backendField] || '';
            element.value = value;
            
            if (value) {
                console.log(`✅ ${backendField} → ${frontendId}: "${value}"`);
                preenchidos++;
            } else {
                console.log(`❌ ${backendField} → ${frontendId}: (vazio)`);
            }
        } else {
            console.log(`⚠️ Elemento não encontrado: ${frontendId}`);
            naoEncontrados++;
        }
    });

    // Verificar campos específicos que sabemos que têm dados
    const camposComDados = [
        'inscricao_imobiliaria', 'tipo_imovel', 'tipo_logradouro', 'nome_logradouro', 
        'numero_lote', 'pavimento', 'bairro', 'cidade', 'area_total', 'area_construida',
        'area_privativa', 'area_uso_comum', 'fracao_ideal', 'cpf_cnpj', 'nome_completo',
        'endereco_completo', 'natureza_juridica', 'valor_transacao', 'valor_avaliacao',
        'data_alienacao', 'forma_alienacao', 'valor_alienacao_contrato'
    ];
    
    console.log('🔍 Verificação específica dos campos com dados:');
    camposComDados.forEach(campo => {
        const valor = campos[campo];
        const elemento = document.getElementById(fieldMapping[campo]);
        if (valor && elemento) {
            console.log(`✅ ${campo}: "${valor}" → ${fieldMapping[campo]}`);
        } else if (valor && !elemento) {
            console.log(`❌ ${campo}: "${valor}" → ${fieldMapping[campo]} (elemento não encontrado)`);
        } else if (!valor) {
            console.log(`⚠️ ${campo}: (sem dados)`);
        }
    });

    console.log(`📊 Resumo: ${preenchidos} campos preenchidos, ${naoEncontrados} elementos não encontrados`);
    console.log('✅ Campos da matrícula preenchidos com sucesso');
} 