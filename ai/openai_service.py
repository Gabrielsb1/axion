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
    elif service_type == 'validacao_juridica':
        expected_fields = [
            # Checklist 2024-ABR - Validação Jurídica Completa
            # PRENOTAÇÃO (MATRÍCULA) - 13 itens
            'item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7', 'item8', 'item9', 'item10', 'item11', 'item12', 'item13',
            
            # TÍTULO - 27 itens
            'itemT1', 'itemT2', 'itemT3', 'itemT4', 'itemT5', 'itemT6', 'itemT7', 'itemT8', 'itemT9', 'itemT10', 'itemT11', 'itemT12', 'itemT13',
            'itemT14', 'itemT15', 'itemT16', 'itemT17', 'itemT18', 'itemT19', 'itemT20', 'itemT21', 'itemT22', 'itemT23', 'itemT24', 'itemT25', 'itemT26', 'itemT27',
            
            # CONFERÊNCIA - 22 itens
            'itemC1', 'itemC2', 'itemC3', 'itemC4', 'itemC5', 'itemC6', 'itemC7', 'itemC8', 'itemC9', 'itemC10', 'itemC11', 'itemC12', 'itemC13',
            'itemC14', 'itemC15', 'itemC16', 'itemC17', 'itemC18', 'itemC19', 'itemC20', 'itemC21', 'itemC22',
            
            # REGISTRO - 12 itens
            'itemR1', 'itemR2', 'itemR3', 'itemR4', 'itemR5', 'itemR6', 'itemR7', 'itemR8', 'itemR9', 'itemR10', 'itemR11', 'itemR12',
            
            # Justificativas - Todos os itens
            'justificativa_item1', 'justificativa_item2', 'justificativa_item3', 'justificativa_item4', 'justificativa_item5',
            'justificativa_item6', 'justificativa_item7', 'justificativa_item8', 'justificativa_item9', 'justificativa_item10',
            'justificativa_item11', 'justificativa_item12', 'justificativa_item13',
            'justificativa_itemT1', 'justificativa_itemT2', 'justificativa_itemT3', 'justificativa_itemT4', 'justificativa_itemT5',
            'justificativa_itemT6', 'justificativa_itemT7', 'justificativa_itemT8', 'justificativa_itemT9', 'justificativa_itemT10',
            'justificativa_itemT11', 'justificativa_itemT12', 'justificativa_itemT13', 'justificativa_itemT14', 'justificativa_itemT15',
            'justificativa_itemT16', 'justificativa_itemT17', 'justificativa_itemT18', 'justificativa_itemT19', 'justificativa_itemT20',
            'justificativa_itemT21', 'justificativa_itemT22', 'justificativa_itemT23', 'justificativa_itemT24', 'justificativa_itemT25',
            'justificativa_itemT26', 'justificativa_itemT27',
            'justificativa_itemC1', 'justificativa_itemC2', 'justificativa_itemC3', 'justificativa_itemC4', 'justificativa_itemC5',
            'justificativa_itemC6', 'justificativa_itemC7', 'justificativa_itemC8', 'justificativa_itemC9', 'justificativa_itemC10',
            'justificativa_itemC11', 'justificativa_itemC12', 'justificativa_itemC13', 'justificativa_itemC14', 'justificativa_itemC15',
            'justificativa_itemC16', 'justificativa_itemC17', 'justificativa_itemC18', 'justificativa_itemC19', 'justificativa_itemC20',
            'justificativa_itemC21', 'justificativa_itemC22',
            'justificativa_itemR1', 'justificativa_itemR2', 'justificativa_itemR3', 'justificativa_itemR4', 'justificativa_itemR5',
            'justificativa_itemR6', 'justificativa_itemR7', 'justificativa_itemR8', 'justificativa_itemR9', 'justificativa_itemR10',
            'justificativa_itemR11', 'justificativa_itemR12',
            
            # Análise Final
            'analise_completa', 'observacoes_recomendacoes', 'status_validacao',
            'pontuacao_validacao', 'problemas_identificados', 'recomendacoes_especificas',
            'fundamento_legal'
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
        elif service_type == "certidao":
            prompt = (
                "Extraia os seguintes campos do texto de uma matrícula imobiliária abaixo. "
                "Responda APENAS em JSON válido, sem explicações ou texto adicional. "
                "Todos os valores devem ser strings. Se um campo não for encontrado, use string vazia (\"\").\n\n"
                "Campos a extrair:\n"
                "- cnm: Cadastro Nacional de Matrícula (número da matrícula)\n"
                "- descricao_imovel: Descrição completa do imóvel (endereço, área, confrontações, benfeitorias)\n"
                "- proprietarios: Nome(s) completo(s) do(s) proprietário(s) atual(is), com todos os dados disponíveis: CPF, RG, nacionalidade, estado civil, regime de bens e endereço. "
                "Analise toda a sequência da matrícula, considerando transmissões (compra e venda, doação, herança, etc.) para identificar corretamente quem é o PROPRIETÁRIO ATUAL do imóvel, mesmo que haja vários registros anteriores. "
                "Não inclua proprietários antigos ou substituídos. "
                "Se houver mais de um proprietário atual (ex: coproprietários ou cônjuges), liste todos no mesmo campo.\n"
                "- senhorio_enfiteuta: Nome do senhorio direto e enfiteuta (se aplicável)\n"
                "- inscricao_imobiliaria: Inscrição imobiliária (número de inscrição no cartório)\n"
                "- rip: RIP (Registro de Imóveis Públicos) se houver\n"
                "- onus_certidao_negativa: Ônus reais, restrições judiciais e administrativas, ou certidão negativa (transcreva o texto completo referente a esses itens)\n"
                "- nome_solicitante: Nome completo do solicitante da certidão\n\n"
                "Exemplo de formato esperado:\n"
                "{\"cnm\": \"123456\", \"descricao_imovel\": \"Casa residencial localizada na Rua X...\", "
                "\"proprietarios\": \"João da Silva, CPF: 123.456.789-00, casado, regime de comunhão parcial, residente em...\", "
                "... }\n\n"
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
        elif service_type == "validacao_juridica":
            prompt = (
                "Analise os documentos para validação jurídica. Responda APENAS em JSON válido, sem texto adicional.\n"
                "IMPORTANTE: Você deve retornar um objeto JSON com os campos do checklist, NÃO os nomes dos arquivos.\n"
                "Para cada item do checklist, responda Sim/Não/N/A e forneça justificativa.\n"
                "Para itens não aplicáveis ao tipo de documento, use 'N/A' com justificativa 'Não aplicável ao tipo de documento'.\n"
                "IMPORTANTE: Nas justificativas, sempre mencione de qual documento específico foi extraída a informação.\n"
                "Exemplo: 'Informação extraída do documento [nome_do_arquivo.pdf]: [detalhes da informação]'\n"
                "CRÍTICO: Use apenas aspas duplas (\") para strings, não aspas simples (').\n"
                "CRÍTICO: Não use quebras de linha dentro das strings JSON.\n"
                "CRÍTICO: Certifique-se de que todas as strings estão corretamente fechadas.\n"
                "FORMATO OBRIGATÓRIO: {\"item1\": \"Sim\", \"justificativa_item1\": \"Informação extraída do documento [arquivo.pdf]: [detalhes]\", \"item2\": \"N/A\", \"justificativa_item2\": \"Não aplicável ao tipo de documento\", ...}\n"
                "Campos obrigatórios (responda TODOS):\n"
                "PRENOTAÇÃO: item1,item2,item3,item4,item5,item6,item7,item8,item9,item10,item11,item12,item13\n"
                "TÍTULO: itemT1,itemT2,itemT3,itemT4,itemT5,itemT6,itemT7,itemT8,itemT9,itemT10,itemT11,itemT12,itemT13,itemT14,itemT15,itemT16,itemT17,itemT18,itemT19,itemT20,itemT21,itemT22,itemT23,itemT24,itemT25,itemT26,itemT27\n"
                "CONFERÊNCIA: itemC1,itemC2,itemC3,itemC4,itemC5,itemC6,itemC7,itemC8,itemC9,itemC10,itemC11,itemC12,itemC13,itemC14,itemC15,itemC16,itemC17,itemC18,itemC19,itemC20,itemC21,itemC22\n"
                "REGISTRO: itemR1,itemR2,itemR3,itemR4,itemR5,itemR6,itemR7,itemR8,itemR9,itemR10,itemR11,itemR12\n"
                "JUSTIFICATIVAS: justificativa_item1,justificativa_item2,justificativa_item3,justificativa_item4,justificativa_item5,justificativa_item6,justificativa_item7,justificativa_item8,justificativa_item9,justificativa_item10,justificativa_item11,justificativa_item12,justificativa_item13,justificativa_itemT1,justificativa_itemT2,justificativa_itemT3,justificativa_itemT4,justificativa_itemT5,justificativa_itemT6,justificativa_itemT7,justificativa_itemT8,justificativa_itemT9,justificativa_itemT10,justificativa_itemT11,justificativa_itemT12,justificativa_itemT13,justificativa_itemT14,justificativa_itemT15,justificativa_itemT16,justificativa_itemT17,justificativa_itemT18,justificativa_itemT19,justificativa_itemT20,justificativa_itemT21,justificativa_itemT22,justificativa_itemT23,justificativa_itemT24,justificativa_itemT25,justificativa_itemT26,justificativa_itemT27,justificativa_itemC1,justificativa_itemC2,justificativa_itemC3,justificativa_itemC4,justificativa_itemC5,justificativa_itemC6,justificativa_itemC7,justificativa_itemC8,justificativa_itemC9,justificativa_itemC10,justificativa_itemC11,justificativa_itemC12,justificativa_itemC13,justificativa_itemC14,justificativa_itemC15,justificativa_itemC16,justificativa_itemC17,justificativa_itemC18,justificativa_itemC19,justificativa_itemC20,justificativa_itemC21,justificativa_itemC22,justificativa_itemR1,justificativa_itemR2,justificativa_itemR3,justificativa_itemR4,justificativa_itemR5,justificativa_itemR6,justificativa_itemR7,justificativa_itemR8,justificativa_itemR9,justificativa_itemR10,justificativa_itemR11,justificativa_itemR12\n"
                "ANÁLISE: analise_completa,observacoes_recomendacoes,status_validacao,pontuacao_validacao,problemas_identificados,recomendacoes_especificas,fundamento_legal\n"
                "Documentos:\n" + text
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
            max_tokens=4000  # Limite adequado para o modelo
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
            print(f"📄 Conteúdo recebido: {content[:500]}...")
            return {"error": f"Erro ao interpretar resposta da OpenAI: {str(e)}", "raw": content}
            
    except Exception as e:
        print(f"❌ Erro geral na extração OpenAI: {str(e)}")
        return {"error": f"Erro na comunicação com OpenAI: {str(e)}", "raw": None} 
