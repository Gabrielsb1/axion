"""
AxionDocs - Sistema OCR integrado com API OpenAI
Desenvolvido por João Gabriel Santos Barros (2025)

Licenciado sob MIT License - consulte LICENSE.txt

Este software é fornecido "no estado em que se encontra", sem garantias.

O uso da API OpenAI requer chave configurada via variável de ambiente: OPENAI_API_KEY.
Os custos gerados são responsabilidade do usuário da chave.

Projeto iniciado como parte do TCC no Cartório de Registro de Imóveis de São Luís.
"""
# pyright: reportAttributeAccessIssue=false
# Funções para integração com OpenAI/ChatGPT

# (O conteúdo será movido do app_ocr_melhor.py) 

import openai
import re
import json
from config import Config

def clean_and_validate_fields(fields_dict, service_type='matricula'):
    """Limpa e valida os campos extraídos pela OpenAI"""
    if service_type == 'matricula':
        expected_fields = [
            # CADASTRO
            'inscricao_imobiliaria', 'rip',
            
            # DADOS DO IMÓVEL
            'tipo_imovel', 'tipo_logradouro', 'cep', 'nome_logradouro', 'numero_lote',
            'bloco', 'pavimento', 'andar', 'loteamento', 'numero_loteamento', 'quadra',
            'bairro', 'cidade', 'dominialidade', 'area_total', 'area_construida',
            'area_privativa', 'area_uso_comum', 'area_correspondente', 'fracao_ideal',
            
            # DADOS PESSOAIS
            'cpf_cnpj', 'nome_completo', 'sexo', 'nacionalidade', 'estado_civil',
            'profissao', 'rg', 'cnh', 'endereco_completo', 'regime_casamento',
            'data_casamento', 'matricula_casamento', 'natureza_juridica', 'representante_legal',
            
            # INFORMAÇÕES UTILIZADAS PARA OS ATOS
            'valor_transacao', 'valor_avaliacao', 'data_alienacao', 'forma_alienacao',
            'valor_divida', 'valor_alienacao_contrato', 'tipo_onus'
        ]
    elif service_type == 'minuta':
        expected_fields = [
            'descricao_imovel_completa', 'proprietario_atual', 'tipo_onus_ativo', 'descricao_onus_completa',
            'numero_matricula', 'possiveis_erros'
        ]
    elif service_type == 'contratos':
        expected_fields = [
            # 1. Qualificação das Partes - Parte 1
            'nome_parte1', 'nacionalidade_parte1', 'estado_civil_parte1', 'profissao_parte1', 'cpf_parte1', 'rg_parte1', 'endereco_parte1', 'conjuge_parte1',
            # 1. Qualificação das Partes - Parte 2
            'nome_parte2', 'nacionalidade_parte2', 'estado_civil_parte2', 'profissao_parte2', 'cpf_parte2', 'rg_parte2', 'endereco_parte2', 'conjuge_parte2',
            # 1. Qualificação das Partes - Pessoas Jurídicas
            'razao_social', 'cnpj', 'endereco_pj', 'representante_legal', 'instrumento_representacao',
            # 2. Identificação do Imóvel
            'endereco_imovel', 'numero_matricula_imovel', 'cartorio_registro', 'tipo_imovel', 'descricao_completa_imovel', 'origem_propriedade',
            # 3. Natureza do Negócio Jurídico
            'tipo_contrato', 'finalidade_transacao', 'valor_negocio', 'forma_pagamento', 'condicoes_clausulas',
            # 4. Informações Tributárias e Encargos
            'valor_itbi', 'itbi_pago', 'base_calculo', 'declaracao_isencao', 'itr_ccir', 'debitos_fiscais', 'certidoes_negativas',
            # 5. Ônus e Gravames
            'hipoteca', 'alienacao_fiduciaria', 'usufruto', 'penhora', 'clausulas_inalienabilidade', 'acoes_judiciais',
            # 6. Documentos Complementares
            'procuracoes', 'escrituras_anteriores', 'contratos_preliminares', 'certidoes',
            # 7. Informações para a Minuta
            'titulo_minuta', 'identificacao_outorgantes', 'clausulas_contratuais', 'declaracoes_legais', 'responsabilidade_tributos', 'reconhecimento_firma'
        ]
    elif service_type == 'escrituras':
        expected_fields = [
            # 1. Identificação do Ato
            'tipo_escritura', 'numero_livro', 'numero_folha', 'data_lavratura', 'nome_tabeliao', 'termo_eletronico',
            # 2. Qualificação das Partes - Parte 1
            'nome_parte1_escritura', 'nacionalidade_parte1_escritura', 'estado_civil_parte1_escritura', 'profissao_parte1_escritura', 'cpf_parte1_escritura', 'rg_parte1_escritura', 'endereco_parte1_escritura', 'regime_bens_parte1',
            # 2. Qualificação das Partes - Parte 2
            'nome_parte2_escritura', 'nacionalidade_parte2_escritura', 'estado_civil_parte2_escritura', 'profissao_parte2_escritura', 'cpf_parte2_escritura', 'rg_parte2_escritura', 'endereco_parte2_escritura', 'regime_bens_parte2',
            # 2. Qualificação das Partes - Pessoas Jurídicas
            'razao_social_escritura', 'cnpj_escritura', 'endereco_pj_escritura', 'representante_legal_escritura', 'instrumento_representacao_escritura',
            # 3. Identificação do Imóvel
            'endereco_imovel_escritura', 'matricula_escritura', 'cartorio_registro_escritura', 'area_total_escritura', 'confrontacoes_escritura', 'benfeitorias_escritura', 'inscricao_cadastral', 'origem_propriedade_escritura',
            # 4. Informações do Negócio Jurídico
            'valor_imovel_escritura', 'forma_pagamento_escritura', 'condicoes_suspensivas', 'participacao_terceiros', 'clausulas_especiais',
            # 5. Tributos e Documentos
            'valor_itbi_escritura', 'declaracao_isencao_escritura', 'numero_guia', 'data_guia', 'certidoes_negativas', 'certidao_estado_civil', 'certidao_matricula', 'comprovantes_residencia',
            # 6. Procurações
            'outorgante_procura', 'outorgado_procura', 'livro_procura', 'folha_procura', 'data_lavratura_procura', 'poderes_concedidos', 'validade_procura', 'procura_especifica',
            # 7. Ônus e Gravames
            'existe_onus', 'tipo_onus_escritura', 'clausulas_impeditivas',
            # 8. Cláusulas e Declarações Importantes
            'declaracao_tributos', 'responsabilidade_registro', 'declaracao_quitacao', 'imovel_livre_desembaracado', 'fe_publica_tabeliao', 'assinaturas'
        ]
    elif service_type == 'certidao':
        expected_fields = [
            'cnm',
            'descricao_imovel',
            'proprietarios',
            'senhorio_enfiteuta',
            'inscricao_imobiliaria',
            'rip',
            'onus_certidao_negativa',
            'nome_solicitante'
        ]
    elif service_type == 'qualificacao':
        expected_fields = [
            # Documentos Obrigatórios
            'contrato_presente', 'matricula_presente', 'certidao_itbi_presente', 
            'procuracao_presente', 'cnd_presente',
            # Documentos Complementares
            'certidao_simplificada_presente', 'declaracao_primeira_aquisicao_presente',
            'aforamento_cat_presente', 'boletim_cadastro_presente', 'outros_documentos_presente',
            # Análise da IA
            'analise_completa', 'observacoes_recomendacoes', 'status_qualificacao',
            'pontuacao_qualificacao', 'documentos_faltantes', 'documentos_complementares_faltantes',
            'problemas_identificados', 'recomendacoes_especificas'
        ]
    else:
        expected_fields = []
    
    cleaned_fields = {}
    
    for field in expected_fields:
        value = fields_dict.get(field, '')
        
        # Converter para string e limpar
        if value is None:
            value = ''
        elif isinstance(value, (dict, list)):
            # Se for objeto ou lista, converter para string
            value = str(value)
        else:
            value = str(value).strip()
        
        cleaned_fields[field] = value
    
    print(f"🧹 Campos limpos: {len(cleaned_fields)} campos processados")
    
    # Mostrar dados extraídos no terminal
    print("\n" + "="*60)
    print(f"📋 DADOS EXTRAÍDOS PELA IA ({service_type.upper()}):")
    print("="*60)
    for field, value in cleaned_fields.items():
        if value and value.strip():
            print(f"✅ {field}: {value}")
        else:
            print(f"❌ {field}: (vazio)")
    print("="*60)
    
    return cleaned_fields

def extract_fields_with_openai(text, model="gpt-3.5-turbo", service_type="matricula"):
    """Envia o texto para a OpenAI API e retorna os campos extraídos em JSON"""
    try:
        print(f"🔍 Iniciando extração com OpenAI - Modelo: {model} - Serviço: {service_type}")
        print(f"📝 Tamanho do texto: {len(text)} caracteres")
        
        if service_type == "matricula":
            prompt = (
                "Extraia os seguintes campos do texto da matrícula de imóvel abaixo. "
                "Responda APENAS em JSON válido, sem explicações ou texto adicional. "
                "Todos os valores devem ser strings. Se um campo não for encontrado, use string vazia (\"\").\n"
                "Campos a extrair:\n"
                "CADASTRO:\n"
                "- inscricao_imobiliaria: Inscrição imobiliária\n"
                "- rip: RIP\n"
                "DADOS DO IMÓVEL:\n"
                "- tipo_imovel: Tipo de imóvel (terreno, unidade autônoma, lote etc.)\n"
                "- tipo_logradouro: Tipo de logradouro (rua, avenida, estrada etc.)\n"
                "- cep: CEP\n"
                "- nome_logradouro: Nome do logradouro\n"
                "- numero_lote: Número do lote/unidade autônoma\n"
                "- bloco: Bloco (para unidades autônomas)\n"
                "- pavimento: Pavimento (para unidades autônomas)\n"
                "- andar: Andar (para unidades autônomas)\n"
                "- loteamento: Loteamento\n"
                "- numero_loteamento: Número do lote\n"
                "- quadra: Quadra\n"
                "- bairro: Bairro\n"
                "- cidade: Cidade\n"
                "- dominialidade: Dominialidade\n"
                "- area_total: Área total\n"
                "- area_construida: Área construída\n"
                "- area_privativa: Área privativa (para unidades autônomas)\n"
                "- area_uso_comum: Área de uso comum (para unidades autônomas)\n"
                "- area_correspondente: Área correspondente (para unidades autônomas)\n"
                "- fracao_ideal: Fração ideal (para unidades autônomas)\n"
                "DADOS PESSOAIS:\n"
                "- cpf_cnpj: CPF/CNPJ\n"
                "- nome_completo: Nome completo\n"
                "- sexo: Sexo\n"
                "- nacionalidade: Nacionalidade\n"
                "- estado_civil: Estado civil\n"
                "- profissao: Profissão\n"
                "- rg: RG\n"
                "- cnh: CNH\n"
                "- endereco_completo: Endereço completo (logradouro, número, complemento, bairro, cidade)\n"
                "- regime_casamento: Regime de casamento\n"
                "- data_casamento: Data do casamento\n"
                "- matricula_casamento: Matrícula/termo da certidão de casamento\n"
                "- natureza_juridica: Natureza jurídica da empresa (se pessoa jurídica)\n"
                "- representante_legal: Nome completo do representante legal (se pessoa jurídica)\n"
                "INFORMAÇÕES UTILIZADAS PARA OS ATOS:\n"
                "- valor_transacao: Valor da transação\n"
                "- valor_avaliacao: Valor de avaliação\n"
                "- data_alienacao: Data da alienação\n"
                "- forma_alienacao: Forma de alienação\n"
                "- valor_divida: Valor da dívida\n"
                "- valor_alienacao_contrato: Valor da alienação constante do contrato\n"
                "- tipo_onus: Tipo de ônus\n"
                "Exemplo de formato esperado: {\"inscricao_imobiliaria\": \"123\", \"tipo_imovel\": \"terreno\", ...}\n"
                "Texto da matrícula:\n" + text
            )
        elif service_type == "minuta":
            prompt = (
                "Extraia os seguintes campos do texto da minuta abaixo. "
                "Responda APENAS em JSON válido, sem explicações ou texto adicional. "
                "Todos os valores devem ser strings. Se um campo não for encontrado, use string vazia (\"\").\n"
                "Campos a extrair:\n"
                "- descricao_imovel_completa: Texto completo referente à descrição do imóvel (procure por 'IMOVEL:' ou similar)\n"
                "- proprietario_atual: Nome completo do proprietário atual do imóvel\n"
                "- tipo_onus_ativo: Tipo de ônus que está ativo na matrícula (ex: Hipoteca, Penhora, Usufruto, etc.)\n"
                "- descricao_onus_completa: Descrição completa do ônus ativo (texto completo extraído referente ao ônus)\n"
                "- numero_matricula: Número da matrícula\n"
                "- possiveis_erros: Lista de possíveis erros ou inconsistências encontradas durante a extração (se houver)\n"
                "Exemplo de formato esperado: {\"descricao_imovel_completa\": \"texto completo...\", \"proprietario_atual\": \"nome...\", ...}\n"
                "Texto da minuta:\n" + text
            )
        elif service_type == "contratos":
            prompt = (
                "Extraia os seguintes campos do texto do contrato abaixo. "
                "Responda APENAS em JSON válido, sem explicações ou texto adicional. "
                "Todos os valores devem ser strings. Se um campo não for encontrado, use string vazia (\"\").\n"
                "Campos a extrair:\n"
                "1. QUALIFICAÇÃO DAS PARTES:\n"
                "- nome_parte1: Nome completo da Parte 1 (vendedor/outorgante)\n"
                "- nacionalidade_parte1: Nacionalidade da Parte 1\n"
                "- estado_civil_parte1: Estado civil da Parte 1 (e regime de bens, se casado)\n"
                "- profissao_parte1: Profissão da Parte 1\n"
                "- cpf_parte1: CPF da Parte 1\n"
                "- rg_parte1: RG da Parte 1 (com órgão emissor e data)\n"
                "- endereco_parte1: Endereço completo da Parte 1\n"
                "- conjuge_parte1: Cônjuge da Parte 1 (nome completo, CPF, regime de bens, necessidade de anuência)\n"
                "- nome_parte2: Nome completo da Parte 2 (comprador/outorgado)\n"
                "- nacionalidade_parte2: Nacionalidade da Parte 2\n"
                "- estado_civil_parte2: Estado civil da Parte 2 (e regime de bens, se casado)\n"
                "- profissao_parte2: Profissão da Parte 2\n"
                "- cpf_parte2: CPF da Parte 2\n"
                "- rg_parte2: RG da Parte 2 (com órgão emissor e data)\n"
                "- endereco_parte2: Endereço completo da Parte 2\n"
                "- conjuge_parte2: Cônjuge da Parte 2 (nome completo, CPF, regime de bens, necessidade de anuência)\n"
                "- razao_social: Razão social (se pessoa jurídica)\n"
                "- cnpj: CNPJ (se pessoa jurídica)\n"
                "- endereco_pj: Endereço da pessoa jurídica\n"
                "- representante_legal: Representante legal (nome, CPF, RG, cargo)\n"
                "- instrumento_representacao: Instrumento de representação (contrato social, ata, procuração)\n"
                "2. IDENTIFICAÇÃO DO IMÓVEL:\n"
                "- endereco_imovel: Endereço completo do imóvel\n"
                "- numero_matricula_imovel: Número da matrícula do imóvel\n"
                "- cartorio_registro: Cartório de Registro de Imóveis competente (1º, 2º, etc.)\n"
                "- tipo_imovel: Tipo do imóvel (urbano ou rural)\n"
                "- descricao_completa_imovel: Descrição completa do imóvel (área, confrontações, benfeitorias, inscrição municipal, área construída)\n"
                "- origem_propriedade: Origem da propriedade (transcrição anterior, matrícula, escritura anterior)\n"
                "3. NATUREZA DO NEGÓCIO JURÍDICO:\n"
                "- tipo_contrato: Tipo de contrato (compra e venda, doação, permuta, cessão, financiamento, dação, adjudicação, etc.)\n"
                "- finalidade_transacao: Finalidade da transação (ex: regularização, transmissão, garantia)\n"
                "- valor_negocio: Valor do negócio\n"
                "- forma_pagamento: Forma de pagamento (à vista, financiado, parcelado, FGTS, etc.)\n"
                "- condicoes_clausulas: Existência de condições, cláusulas resolutivas, prazos, obrigações acessórias\n"
                "4. INFORMAÇÕES TRIBUTÁRIAS E ENCARGOS:\n"
                "- valor_itbi: Valor do ITBI\n"
                "- itbi_pago: Se o ITBI foi pago (Sim/Não)\n"
                "- base_calculo: Base de cálculo\n"
                "- declaracao_isencao: Declaração de isenção, se aplicável\n"
                "- itr_ccir: ITR ou CCIR (em imóveis rurais)\n"
                "- debitos_fiscais: Existência de débitos fiscais ou ônus\n"
                "- certidoes_negativas: Certidões negativas ou positivas com efeitos de negativa\n"
                "5. ÔNUS E GRAVAMES:\n"
                "- hipoteca: Hipoteca\n"
                "- alienacao_fiduciaria: Alienação fiduciária\n"
                "- usufruto: Usufruto\n"
                "- penhora: Penhora\n"
                "- clausulas_inalienabilidade: Cláusulas de inalienabilidade ou impenhorabilidade\n"
                "- acoes_judiciais: Ações judiciais (averbações)\n"
                "6. DOCUMENTOS COMPLEMENTARES:\n"
                "- procuracoes: Procurações (com poderes específicos, validade, dados do outorgante/outorgado)\n"
                "- escrituras_anteriores: Escrituras anteriores\n"
                "- contratos_preliminares: Contratos preliminares\n"
                "- certidoes: Certidões (estado civil, negativa de débitos, etc.)\n"
                "7. INFORMAÇÕES PARA A MINUTA:\n"
                "- titulo_minuta: Título da minuta (ex: 'Escritura Pública de Compra e Venda')\n"
                "- identificacao_outorgantes: Identificação completa dos outorgantes e outorgados\n"
                "- clausulas_contratuais: Cláusulas contratuais relevantes\n"
                "- declaracoes_legais: Declarações legais obrigatórias (ex: que o imóvel está livre de ônus, que os impostos foram pagos)\n"
                "- responsabilidade_tributos: Responsabilidade pelo pagamento de tributos e taxas\n"
                "- reconhecimento_firma: Reconhecimento de firma e data\n"
                "Exemplo de formato esperado: {\"nome_parte1\": \"João Silva\", \"nacionalidade_parte1\": \"Brasileiro\", ...}\n"
                "Texto do contrato:\n" + text
            )
        elif service_type == "escrituras":
            prompt = (
                "Extraia os seguintes campos do texto da escritura pública abaixo. "
                "Responda APENAS em JSON válido, sem explicações ou texto adicional. "
                "Todos os valores devem ser strings. Se um campo não for encontrado, use string vazia (\"\").\n"
                "Campos a extrair:\n"
                "1. IDENTIFICAÇÃO DO ATO:\n"
                "- tipo_escritura: Tipo de escritura (compra e venda, doação, permuta, cessão de direitos hereditários, instituição de usufruto, inventário e partilha, escritura declaratória, dação em pagamento, constituição de garantia real, etc.)\n"
                "- numero_livro: Número do livro\n"
                "- numero_folha: Número da folha (ou termo eletrônico)\n"
                "- data_lavratura: Data da lavratura\n"
                "- nome_tabeliao: Nome do tabelião responsável\n"
                "- termo_eletronico: Termo eletrônico (se aplicável)\n"
                "2. QUALIFICAÇÃO DAS PARTES:\n"
                "- nome_parte1_escritura: Nome completo da Parte 1 (outorgante)\n"
                "- nacionalidade_parte1_escritura: Nacionalidade da Parte 1\n"
                "- estado_civil_parte1_escritura: Estado civil da Parte 1 (com regime de bens e nome do cônjuge)\n"
                "- profissao_parte1_escritura: Profissão da Parte 1\n"
                "- cpf_parte1_escritura: CPF da Parte 1\n"
                "- rg_parte1_escritura: RG da Parte 1 (com órgão emissor e UF)\n"
                "- endereco_parte1_escritura: Endereço da Parte 1\n"
                "- regime_bens_parte1: Regime de bens (se casado: comunhão, separação, etc.)\n"
                "- nome_parte2_escritura: Nome completo da Parte 2 (outorgado)\n"
                "- nacionalidade_parte2_escritura: Nacionalidade da Parte 2\n"
                "- estado_civil_parte2_escritura: Estado civil da Parte 2 (com regime de bens e nome do cônjuge)\n"
                "- profissao_parte2_escritura: Profissão da Parte 2\n"
                "- cpf_parte2_escritura: CPF da Parte 2\n"
                "- rg_parte2_escritura: RG da Parte 2 (com órgão emissor e UF)\n"
                "- endereco_parte2_escritura: Endereço da Parte 2\n"
                "- regime_bens_parte2: Regime de bens (se casado: comunhão, separação, etc.)\n"
                "- razao_social_escritura: Razão social (se pessoa jurídica)\n"
                "- cnpj_escritura: CNPJ (se pessoa jurídica)\n"
                "- endereco_pj_escritura: Endereço da pessoa jurídica\n"
                "- representante_legal_escritura: Representante legal (qualificação completa)\n"
                "- instrumento_representacao_escritura: Instrumento de representação (contrato social, estatuto, procuração)\n"
                "3. IDENTIFICAÇÃO DO IMÓVEL:\n"
                "- endereco_imovel_escritura: Endereço completo do imóvel\n"
                "- matricula_escritura: Matrícula do imóvel\n"
                "- cartorio_registro_escritura: Cartório de Registro de Imóveis\n"
                "- area_total_escritura: Área total do imóvel\n"
                "- confrontacoes_escritura: Confrontações do imóvel\n"
                "- benfeitorias_escritura: Benfeitorias do imóvel\n"
                "- inscricao_cadastral: Inscrição no cadastro municipal (IPTU) ou rural (CCIR, ITR)\n"
                "- origem_propriedade_escritura: Origem da propriedade (averbação anterior ou escritura anterior)\n"
                "4. INFORMAÇÕES DO NEGÓCIO JURÍDICO:\n"
                "- valor_imovel_escritura: Valor do imóvel\n"
                "- forma_pagamento_escritura: Forma de pagamento (à vista, parcelado, FGTS, financiamento, permuta)\n"
                "- condicoes_suspensivas: Existência de condições suspensivas ou resolutivas\n"
                "- participacao_terceiros: Participação de terceiros (financiadoras, cessionários)\n"
                "- clausulas_especiais: Cláusulas especiais (inalienabilidade, impenhorabilidade, usufruto, reversão, direito de preferência)\n"
                "5. TRIBUTOS E DOCUMENTOS:\n"
                "- valor_itbi_escritura: Valor do ITBI\n"
                "- declaracao_isencao_escritura: Declaração de isenção (se aplicável)\n"
                "- numero_guia: Número da guia paga\n"
                "- data_guia: Data da guia paga\n"
                "- certidoes_negativas: Certidões negativas de débitos\n"
                "- certidao_estado_civil: Certidão de casamento/divórcio/óbito\n"
                "- certidao_matricula: Certidão da matrícula atualizada\n"
                "- comprovantes_residencia: Comprovantes de residência\n"
                "6. PROCURAÇÕES:\n"
                "- outorgante_procura: Dados do outorgante da procuração\n"
                "- outorgado_procura: Dados do outorgado da procuração\n"
                "- livro_procura: Livro da procuração\n"
                "- folha_procura: Folha da procuração\n"
                "- data_lavratura_procura: Data de lavratura da procuração\n"
                "- poderes_concedidos: Poderes concedidos na procuração\n"
                "- validade_procura: Validade da procuração\n"
                "- procura_especifica: Se a procuração é específica para o ato (Sim/Não)\n"
                "7. ÔNUS E GRAVAMES:\n"
                "- existe_onus: Se há ou não ônus sobre o imóvel (Sim/Não)\n"
                "- tipo_onus_escritura: Tipo de ônus (hipoteca, penhora, alienação fiduciária, usufruto, etc.)\n"
                "- clausulas_impeditivas: Cláusulas impeditivas de alienação\n"
                "8. CLÁUSULAS E DECLARAÇÕES IMPORTANTES:\n"
                "- declaracao_tributos: Declaração de ciência dos tributos e encargos\n"
                "- responsabilidade_registro: Assunção de responsabilidade pelo registro\n"
                "- declaracao_quitacao: Declaração de quitação\n"
                "- imovel_livre_desembaracado: Declaração de que o imóvel está livre e desembaraçado\n"
                "- fe_publica_tabeliao: Fé pública do tabelião\n"
                "- assinaturas: Assinaturas (ou menção à fé pública do tabelião)\n"
                "Exemplo de formato esperado: {\"tipo_escritura\": \"Compra e Venda\", \"numero_livro\": \"123\", ...}\n"
                "Texto da escritura:\n" + text
            )
        elif service_type == "certidao":
            prompt = (
                "Extraia os seguintes campos do texto de uma matrícula imobiliária abaixo. "
                "Responda APENAS em JSON válido, sem explicações ou texto adicional. "
                "Todos os valores devem ser strings. Se um campo não for encontrado, use string vazia (\"\").\n"
                "Campos a extrair:\n"
                "- cnm: Cadastro Nacional de Matrícula (número da matrícula)\n"
                "- descricao_imovel: Descrição completa do imóvel (endereço, área, confrontações, benfeitorias)\n"
                "- proprietarios: Nome(s) completo(s) dos proprietários atuais e seus dados (CPF, RG, endereço, estado civil)\n"
                "- senhorio_enfiteuta: Nome do senhorio direto e enfiteuta (se aplicável)\n"
                "- inscricao_imobiliaria: Inscrição imobiliária (número de inscrição no cartório)\n"
                "- rip: RIP (Registro de Imóveis Públicos) se houver\n"
                "- onus_certidao_negativa: Ônus reais, restrições judiciais e administrativas, ou certidão negativa (transcreva o texto completo referente a esses itens)\n"
                "- nome_solicitante: Nome completo do solicitante da certidão\n"
                "Exemplo de formato esperado: {\"cnm\": \"123456\", \"descricao_imovel\": \"Casa residencial...\", \"proprietarios\": \"João Silva, CPF: 123.456.789-00...\", ...}\n"
                "Texto da matrícula:\n" + text
            )
        elif service_type == "qualificacao":
            prompt = (
                "Analise os documentos enviados para qualificação de registro de contrato. "
                "Responda APENAS em JSON válido, sem explicações ou texto adicional. "
                "Todos os valores devem ser strings. Se um campo não for encontrado, use string vazia (\"\").\n"
                "Campos a extrair:\n"
                "DOCUMENTOS OBRIGATÓRIOS:\n"
                "- contrato_presente: Se o contrato principal está presente (Sim/Não)\n"
                "- matricula_presente: Se a matrícula do imóvel está presente (Sim/Não)\n"
                "- certidao_itbi_presente: Se a certidão de ITBI está presente (Sim/Não)\n"
                "- procuracao_presente: Se a procuração está presente (Sim/Não)\n"
                "- cnd_presente: Se a CND está presente (Sim/Não)\n"
                "DOCUMENTOS COMPLEMENTARES:\n"
                "- certidao_simplificada_presente: Se a certidão simplificada está presente (Sim/Não)\n"
                "- declaracao_primeira_aquisicao_presente: Se a declaração de primeira aquisição está presente (Sim/Não)\n"
                "- aforamento_cat_presente: Se o aforamento ou CAT está presente (Sim/Não)\n"
                "- boletim_cadastro_presente: Se o boletim de cadastro está presente (Sim/Não)\n"
                "- outros_documentos_presente: Se outros documentos relevantes estão presentes (Sim/Não)\n"
                "ANÁLISE DA IA:\n"
                "- analise_completa: Análise completa dos documentos enviados, identificando cada tipo de documento e sua relevância\n"
                "- observacoes_recomendacoes: Observações sobre documentos faltantes, problemas identificados e recomendações\n"
                "- status_qualificacao: Status da qualificação (aprovado/pendente/reprovado)\n"
                "- pontuacao_qualificacao: Pontuação de 0 a 100 baseada na completude dos documentos\n"
                "- documentos_faltantes: Lista de documentos obrigatórios que estão faltando\n"
                "- documentos_complementares_faltantes: Lista de documentos complementares que poderiam melhorar a qualificação\n"
                "- problemas_identificados: Problemas ou inconsistências identificadas nos documentos\n"
                "- recomendacoes_especificas: Recomendações específicas para completar a qualificação\n"
                "Exemplo de formato esperado: {\"contrato_presente\": \"Sim\", \"matricula_presente\": \"Sim\", \"analise_completa\": \"Análise completa...\", ...}\n"
                "Documentos analisados:\n" + text
            )
        else:
            return {"error": f"Tipo de serviço não suportado: {service_type}"}
        
        if not Config.OPENAI_API_KEY:
            raise ValueError("A variável de ambiente OPENAI_API_KEY não está definida! Por favor, configure antes de usar a API da OpenAI.")
        api_key_preview = Config.OPENAI_API_KEY[:20]
        print(f"🔑 Usando chave API: {api_key_preview}...")

        print("📡 Enviando requisição para OpenAI...")
        client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
            max_tokens=1024
        )
        content = response.choices[0].message.content
        print(f"✅ Resposta recebida da OpenAI - Tamanho: {len(content) if content else 0}")
        
        if content is None:
            print("❌ Resposta vazia da OpenAI")
            return {"error": "Resposta vazia da OpenAI", "raw": None}
        
        try:
            # Limpeza do conteúdo para remover blocos markdown
            def clean_json_response(response_text):
                response_text = re.sub(r'^```json\s*|```$', '', response_text.strip(), flags=re.MULTILINE)
                response_text = re.sub(r'^```\s*|```$', '', response_text.strip(), flags=re.MULTILINE)
                return response_text.strip()

            cleaned_content = clean_json_response(content)
            match = re.search(r'\{[\s\S]+\}', cleaned_content)
            if match:
                result = json.loads(match.group(0))
                print("✅ JSON extraído com sucesso")
                print(f"📊 Campos extraídos: {list(result.keys())}")
                return clean_and_validate_fields(result, service_type)
            result = json.loads(cleaned_content)
            print("✅ JSON direto processado com sucesso")
            print(f"📊 Campos extraídos: {list(result.keys())}")
            return clean_and_validate_fields(result, service_type)
        except Exception as e:
            print(f"❌ Erro ao processar JSON: {str(e)}")
            print(f"📄 Conteúdo recebido: {content[:200]}...")
            return {"error": f"Erro ao interpretar resposta da OpenAI: {str(e)}", "raw": content}
            
    except Exception as e:
        print(f"❌ Erro geral na extração OpenAI: {str(e)}")
        return {"error": f"Erro na comunicação com OpenAI: {str(e)}", "raw": None} 