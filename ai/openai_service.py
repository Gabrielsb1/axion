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

def identify_document_type_from_filename(filename):
    """Identifica o tipo do documento baseado no nome do arquivo"""
    if not filename:
        return "DESCONHECIDO"
    
    # Converter para minúsculas para comparação
    filename_lower = filename.lower()
    
    # Padrões de identificação por nome de arquivo
    patterns = {
        'MATRÍCULA': [
            'matricula', 'matrícula', 'matric', 'matricul', 'registro', 'registro_imovel',
            'mat_', 'mat_', 'matricula_', 'matricul_', 'reg_', 'registro_'
        ],
        'CONTRATO': [
            'contrato', 'contract', 'compra', 'venda', 'compra_venda', 'compraevenda',
            'escritura', 'escritura_publica', 'publica', 'contr_', 'contrat_'
        ],
        'ITBI': [
            'itbi', 'imposto', 'transmissao', 'transmissão', 'guia_itbi', 'guia_imposto',
            'certidao_itbi', 'certidão_itbi', 'itbi_', 'imposto_'
        ],
        'CERTIDÃO': [
            'certidao', 'certidão', 'certificate', 'cert_', 'certidao_', 'certidão_',
            'situacao', 'situação', 'onus', 'ônus', 'negativa', 'inteiro_teor'
        ],
        'PROCURAÇÃO': [
            'procuração', 'procura', 'procuracao', 'mandato', 'representacao', 'representação',
            'proc_', 'procur_', 'mandat_', 'represent_'
        ]
    }
    
    # Verificar cada tipo de documento
    for document_type, pattern_list in patterns.items():
        for pattern in pattern_list:
            if pattern in filename_lower:
                print(f"✅ Tipo identificado pelo nome: {document_type} (padrão: {pattern})")
                return document_type
    
    # Se não encontrou padrão específico, retornar DESCONHECIDO
    print(f"⚠️ Nenhum padrão encontrado no nome: {filename}")
    return "DESCONHECIDO"

def classify_document_type(text_content, filename="", model="gpt-3.5-turbo"):
    """Etapa 1: Classifica o tipo do documento usando modelo selecionado com contexto rigoroso"""
    try:
        print(f"🔍 Classificando tipo do documento com {model}")
        
        # PRIMEIRA ETAPA: Identificação pelo nome do arquivo
        document_type_from_filename = identify_document_type_from_filename(filename)
        print(f"📁 Tipo identificado pelo nome do arquivo: {document_type_from_filename}")
        
        # SEGUNDA ETAPA: Validação e refinamento pela IA
        prompt_classificacao = f"""
📌 CONTEXTO:
Você é um Registrador Imobiliário com conhecimento profundo da Lei nº 6.015/1973 (Lei de Registros Públicos), do Código de Normas do Estado do Maranhão (CNCGJ/MA) e das práticas cartorárias nacionais.

Sua tarefa é **VALIDAR** o tipo do documento identificado pelo nome do arquivo e confirmar se está correto.

---

📁 INFORMAÇÕES DISPONÍVEIS:

- Nome do Arquivo: {filename}
- Tipo Identificado pelo Nome: {document_type_from_filename}
- Conteúdo Extraído do Documento: {text_content}

---

🧠 VALIDAÇÃO DO TIPO DO DOCUMENTO:

⚠️ **CRITÉRIOS FUNDAMENTAIS**:
O nome do arquivo indica que este documento é do tipo: **{document_type_from_filename}**

Sua tarefa é:
1. **CONFIRMAR** se o tipo identificado pelo nome está correto
2. **VALIDAR** se o conteúdo do documento corresponde ao tipo esperado
3. **CORRIGIR** apenas se houver erro evidente na identificação

---

🔍 REGRAS DE VALIDAÇÃO DETALHADAS:

1. **MATRÍCULA**: 
   - ESTRUTURA: Documento que contém a descrição completa do imóvel, proprietários, ônus, histórico de transmissões
   - FUNÇÃO: Registro oficial da propriedade imobiliária
   - CARACTERÍSTICAS: Contém número de matrícula, inscrição imobiliária, histórico completo
   - ⚠️ **CRÍTICO**: Mesmo que mencione contratos registrados, certidões ou outros documentos, o documento PRINCIPAL é a matrícula
   - ⚠️ **CRÍTICO**: Se o documento contém histórico de transmissões, descrição do imóvel e proprietários → É MATRÍCULA
   - ⚠️ **CRÍTICO**: Se o nome do arquivo contém "matricula" → PROVAVELMENTE É MATRÍCULA

2. **CONTRATO**: 
   - ESTRUTURA: Documento que é PRINCIPALMENTE um instrumento contratual
   - FUNÇÃO: Estabelecer acordo entre partes (compra e venda, cessão, financiamento, etc.)
   - CARACTERÍSTICAS: Contém cláusulas contratuais, valores, qualificação das partes
   - ⚠️ **CRÍTICO**: Não confundir com contratos mencionados dentro de matrículas ou certidões
   - ⚠️ **CRÍTICO**: Se o documento é principalmente um instrumento de acordo entre partes → É CONTRATO
   - ⚠️ **CRÍTICO**: Se o nome do arquivo contém "contrato" → PROVAVELMENTE É CONTRATO

3. **ITBI**: 
   - ESTRUTURA: Documento que é PRINCIPALMENTE uma guia ou certidão de ITBI
   - FUNÇÃO: Comprovar pagamento do imposto de transmissão
   - CARACTERÍSTICAS: Contém valores, descrição do imóvel, dados das partes
   - ⚠️ Focar na função fiscal/tributária do documento

4. **CERTIDÃO**: 
   - ESTRUTURA: Documento que é PRINCIPALMENTE uma certidão de situação jurídica, ônus, etc.
   - FUNÇÃO: Atestar situação jurídica ou ausência de ônus
   - CARACTERÍSTICAS: Contém data de emissão, prazo de validade, atestado oficial
   - ⚠️ Mesmo que mencione outros documentos, a função é atestar situação

5. **PROCURAÇÃO**: 
   - ESTRUTURA: Documento que é PRINCIPALMENTE um instrumento de mandato
   - FUNÇÃO: Conceder poderes de representação
   - CARACTERÍSTICAS: Contém outorgante, outorgado, poderes específicos
   - ⚠️ Focar na função de representação legal

---

⚠️ **ANÁLISE ESTRUTURAL OBRIGATÓRIA**:

1. **PRIMEIRO**: Confirme se o tipo identificado pelo nome está correto
2. **SEGUNDO**: Valide se o conteúdo corresponde ao tipo esperado
3. **TERCEIRO**: Corrija apenas se houver erro evidente
4. **QUARTO**: Baseie-se na natureza jurídica do documento, não em palavras-chave isoladas
5. **QUINTO**: Considere o nome do arquivo como indicador importante

---

🔍 **EXEMPLOS DE VALIDAÇÃO CORRETA**:

- Documento chamado "matricula.pdf" que contém histórico de transmissões → CONFIRMAR MATRÍCULA
- Documento chamado "contrato.pdf" que contém cláusulas contratuais → CONFIRMAR CONTRATO
- Documento chamado "matricula.pdf" mas é claramente um contrato → CORRIGIR PARA CONTRATO
- Documento chamado "contrato.pdf" mas é claramente uma matrícula → CORRIGIR PARA MATRÍCULA

---

⚠️ **ANÁLISE ESTRUTURAL AVANÇADA**:

**Para MATRÍCULA**:
- Contém número de matrícula e inscrição imobiliária
- Contém descrição completa do imóvel
- Contém histórico de transmissões (compra e venda, doação, herança, etc.)
- Contém dados dos proprietários atuais
- Contém ônus reais e restrições
- **MESMO QUE** mencione contratos registrados → É MATRÍCULA
- **MESMO QUE** mencione certidões → É MATRÍCULA
- **MESMO QUE** mencione ITBIs → É MATRÍCULA

**Para CONTRATO**:
- É PRINCIPALMENTE um instrumento de acordo
- Contém cláusulas contratuais
- Contém valores e qualificação das partes
- Contém data e local de assinatura
- **NÃO É** um documento que apenas menciona contratos
- **NÃO É** uma matrícula que menciona contratos registrados

---

📌 ORIENTAÇÃO FINAL:

Você está atuando em um ambiente de produção de um cartório de registro de imóveis. Sua classificação será usada para tomada de decisões jurídicas com efeitos reais.

**CONFIRME O TIPO IDENTIFICADO PELO NOME DO ARQUIVO, CORRIGINDO APENAS SE NECESSÁRIO.**

**IMPORTANTE**: Se o nome do arquivo contém "matricula", o documento é PROVAVELMENTE uma matrícula, mesmo que mencione outros tipos de documentos.

Sua resposta deve ser:
- Confiável;
- Baseada na ESTRUTURA e FUNÇÃO PRINCIPAL do documento;
- Redigida com precisão técnica e clareza cartorária.

Responda apenas com o tipo do documento, sem explicações.
"""
        
        if not Config.OPENAI_API_KEY:
            raise ValueError("A variável de ambiente OPENAI_API_KEY não está definida!")
        
        client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt_classificacao}],
            temperature=0.0,
            max_tokens=50
        )
        
        content = response.choices[0].message.content
        if content is None:
            return document_type_from_filename
        
        validated_type = content.strip().upper()
        
        # Se a IA confirmou o tipo do nome do arquivo, usar ele
        if validated_type == document_type_from_filename:
            print(f"✅ Tipo confirmado pela IA: {validated_type}")
            return validated_type
        # Se a IA corrigiu o tipo, usar a correção
        else:
            print(f"🔄 Tipo corrigido pela IA: {document_type_from_filename} → {validated_type}")
            return validated_type
        
    except Exception as e:
        print(f"❌ Erro na classificação do documento: {str(e)}")
        return "DESCONHECIDO"

def get_checklist_for_document_type(document_type):
    """Retorna o checklist aplicável ao tipo de documento com contexto técnico"""
    
    # Checklist para MATRÍCULA
    checklist_matricula = """
📋 CHECKLIST - MATRÍCULA:

1. O título foi apresentado juntamente com as certidões de inteiro teor e de situação jurídica ou de ônus reais e de ações reipersecutórias (dentro do prazo de validade de 30 dias), comprobatórias do registro anterior?

2. A nova matrícula preenche os requisitos do Art. 176, § 1º, inciso II, da Lei n.º 6.015/1973 – Lei de Registros Públicos? (REQUISITOS ESSENCIAIS PARA ABERTURA)

3. Verificar dominialidade do imóvel. (terrenos foreiros à União ou ao Município, bem como terrenos de Marinha)?

4. Em caso de abertura de matrícula, o imóvel for foreiro à União, tem RIP?

5. Incide sobre o imóvel algum ônus?

6. Para o caso de existir ônus, foi apresentado termo de autorização para o cancelamento de ônus ou constou no contrato cláusula que autorize esse cancelamento?

7. Constou a qualificação completa dos proprietários?

8. Em matrícula pertencente a esta Serventia, consta a inscrição imobiliária do imóvel/número de RIP?

9. A inscrição imobiliária que consta na matrícula do imóvel é a mesma da certidão de ITBI apresentada? (COMPARAÇÃO ENTRE DOCUMENTOS)
"""
    
    # Checklist para CONTRATO
    checklist_contrato = """
📋 CHECKLIST - CONTRATO:

1. Todas as vias estão iguais?

2. Todas as vias estão assinadas/possuem data e local de emissão do contrato?

3. O contrato contém a descrição completa do imóvel e o número da matrícula?

4. A certidão de ITBI contém a mesma descrição do imóvel conforme o contrato e matrícula do imóvel? (COMPARAÇÃO ENTRE DOCUMENTOS)

5. O valor base para ITBI é igual ou maior que o valor da transação do imóvel? (COMPARAÇÃO ENTRE DOCUMENTOS)

6. As partes indicadas no ITBI são as mesmas do contrato? OBS: Observar os nomes e CPF. (COMPARAÇÃO ENTRE DOCUMENTOS)

7. O termo de quitação ou contrato foram devidamente assinados pelo(a) representante legal do(a) credor fiduciário(a)/interveniente quitante?

8. Os transmitentes estão qualificados no título conforme art. 648, V, do CNCGJ/MA?

9. Em caso de apresentação de declaração de 1ª aquisição, foi assinada pelo(s) comprador(es) com firma devidamente reconhecida?

10. Os transmitentes ou adquirentes são casados sob regime diverso do legal?

11. Se o(s) adquirente (s) e/ou transmitente(s) estiver(em) representado(s) por procurador, constar os dados da representação no texto do registro.

12. Nos casos em que a Pessoa Jurídica for representada por sócio/gerente/administrador ou outro representante legal, deve constar no título os Atos Constitutivos da empresa que justifiquem a representação.

13. Sempre que o transmitente for Pessoa Jurídica verificar se consta CND (Certidão Negativa de Débitos), ou há menção sobre a dispensa da referida certidão.

14. Foi apresentada a CND do(a) devedor(a) em caso de contrato de mútuo ou CCB?

15. Se tratando de Pessoa Jurídica, imprimir Certidão Simplificada ou consulta da empresa na respectiva Junta Comercial.

16. Quando tratar-se de firma individual exigir os documentos de pessoa física.

17. Em caso de terreno foreiro à União, foi apresentada a CAT onerosa com a descrição correta do imóvel e nome e CPF ou CNPJ do outorgante vendedor.

18. Em caso de terreno foreiro ao município, foi apresentado o Termo de Transferência de Aforamento ou Escritura Pública de Resgate de Aforamento?

19. O contrato indica a matrícula, descrição e inscrição imobiliária do imóvel (verificar se houve atualização de inscrição imobiliária)?

20. Existe procuração para o(a) representante legal do(a) credor(a) fiduciário(a)?

21. Consta no título requerimento genérico em que as partes autorizem a proceder todos os atos que se fizerem necessários?

22. Deve ser efetuada alguma averbação precedente ou subsequente ao registro referente à qualificação dos proprietários?

23. Em caso de consolidação de propriedade de credor fiduciário, foram averbados os leilões negativos e a quitação da dívida?
"""
    
    # Checklist para ITBI
    checklist_itbi = """
📋 CHECKLIST - ITBI:

1. A certidão de ITBI contém a mesma descrição do imóvel conforme o contrato e matrícula do imóvel? (COMPARAÇÃO ENTRE DOCUMENTOS)

2. O valor base para ITBI é igual ou maior que o valor da transação do imóvel? (COMPARAÇÃO ENTRE DOCUMENTOS)

3. As partes indicadas no ITBI são as mesmas do contrato? (COMPARAÇÃO ENTRE DOCUMENTOS)

4. Todos os dados referentes ao ITBI foram conferidos?
"""
    
    # Checklist para CERTIDÃO
    checklist_certidao = """
📋 CHECKLIST - CERTIDÃO:

1. A certidão está dentro do prazo de validade de 30 dias?

2. A certidão contém a descrição completa do imóvel?

3. A certidão menciona ônus reais ou restrições judiciais?

4. A certidão identifica corretamente os proprietários atuais?

5. A descrição do imóvel na certidão é compatível com outros documentos apresentados? (COMPARAÇÃO ENTRE DOCUMENTOS)
"""
    
    # Checklist para PROCURAÇÃO
    checklist_procuracao = """
📋 CHECKLIST - PROCURAÇÃO:

1. A procuração está válida e dentro do prazo?

2. A procuração indica os poderes específicos necessários?

3. A procuração foi devidamente reconhecida em firma?

4. O procurador está qualificado conforme art. 648, V, do CNCGJ/MA?

5. Os dados do outorgante na procuração são compatíveis com outros documentos apresentados? (COMPARAÇÃO ENTRE DOCUMENTOS)
"""
    
    checklists = {
        'MATRÍCULA': checklist_matricula,
        'CONTRATO': checklist_contrato,
        'ITBI': checklist_itbi,
        'CERTIDÃO': checklist_certidao,
        'PROCURAÇÃO': checklist_procuracao
    }
    
    return checklists.get(document_type, """
📋 CHECKLIST - DOCUMENTO GENÉRICO:

1. O documento está completo e legível?

2. O documento contém as informações necessárias?

3. O documento está dentro do prazo de validade (se aplicável)?

4. O documento foi devidamente assinado e reconhecido (se aplicável)?

5. As informações do documento são compatíveis com outros documentos apresentados? (COMPARAÇÃO ENTRE DOCUMENTOS)
""")

def extract_document_specific_data(text_content, document_type, filename="", model="gpt-3.5-turbo"):
    """Extrai TODOS os dados de cada documento, independentemente do tipo"""
    try:
        print(f"🔍 Extraindo TODOS os dados de {document_type} - {filename}")
        
        # Prompt unificado para extrair TODOS os dados de qualquer tipo de documento
        prompt = f"""
📌 CONTEXTO:
Você é um Registrador Imobiliário analisando um documento para qualificação de registro.

Sua tarefa é extrair **TODOS OS DADOS RELEVANTES** do documento, independentemente do tipo identificado.

---

📁 DOCUMENTO ANALISADO:
- Nome do Arquivo: {filename}
- Tipo Identificado: {document_type}
- Conteúdo: {text_content}

---

📋 DADOS A EXTRAIR (TODOS OS TIPOS DE DOCUMENTO):

**DADOS BÁSICOS DO DOCUMENTO:**
- tipo_documento: Tipo do documento (matrícula, contrato, ITBI, certidão, procuração)
- numero_documento: Número do documento (matrícula, contrato, ITBI, etc.)
- data_documento: Data do documento
- local_documento: Local de emissão/assinatura

**DADOS DO IMÓVEL:**
- descricao_imovel: Descrição completa do imóvel
- inscricao_imobiliaria: Inscrição imobiliária
- rip: RIP (se houver)
- endereco_completo: Endereço completo do imóvel
- area_imovel: Área do imóvel
- tipo_imovel: Tipo de imóvel (terreno, casa, apartamento, etc.)

**DADOS DAS PARTES:**
- proprietarios_atuais: Nome(s) do(s) proprietário(s) atual(is)
- compradores: Nome(s) do(s) comprador(es) (se aplicável)
- vendedores: Nome(s) do(s) vendedor(es) (se aplicável)
- transmitentes: Nome(s) do(s) transmitente(s) (se aplicável)
- adquirentes: Nome(s) do(s) adquirente(s) (se aplicável)
- outorgantes: Nome(s) do(s) outorgante(s) (se aplicável)
- outorgados: Nome(s) do(s) outorgado(s) (se aplicável)

**DADOS PESSOAIS:**
- cpfs_cnpjs: CPFs/CNPJs das partes envolvidas
- rgs: RGs das partes envolvidas
- enderecos_partes: Endereços das partes envolvidas
- estados_civis: Estados civis das partes
- profissoes: Profissões das partes
- nacionalidades: Nacionalidades das partes

**DADOS FINANCEIROS:**
- valor_transacao: Valor da transação
- valor_contrato: Valor do contrato
- valor_itbi: Valor do ITBI
- forma_pagamento: Forma de pagamento
- valor_avaliacao: Valor de avaliação

**ÔNUS E RESTRIÇÕES:**
- onus_ativos: Lista de ônus ativos
- restricoes_judiciais: Restrições judiciais
- hipotecas: Hipotecas mencionadas
- penhoras: Penhoras mencionadas
- usufrutos: Usufrutos mencionados

**CERTIDÕES E DOCUMENTOS:**
- certidoes_presentes: Lista de certidões mencionadas
- prazos_certidoes: Prazos de validade das certidões
- documentos_anexos: Documentos anexos mencionados
- procuracoes: Procurações mencionadas

**HISTÓRICO E TRANSMISSÕES:**
- historico_transmissoes: Histórico de transmissões
- data_ultima_transmissao: Data da última transmissão
- valor_ultima_transmissao: Valor da última transmissão

**CLÁUSULAS E CONDIÇÕES:**
- clausulas_especiais: Cláusulas especiais do contrato
- condicoes_especiais: Condições especiais
- garantias: Garantias oferecidas

**DOMINIALIDADE:**
- tipo_dominialidade: Tipo de dominialidade
- senhorio_direto: Senhorio direto (se foreira)
- enfiteuta: Enfiteuta (se foreira)

**DADOS FISCAIS (ITBI):**
- numero_itbi: Número do ITBI
- aliquota_aplicada: Alíquota aplicada
- base_calculo: Base de cálculo
- valor_imposto: Valor do imposto
- isencao_aplicada: Isenção aplicada

**DADOS DE REPRESENTAÇÃO:**
- representante_legal: Representante legal
- poderes_especificos: Poderes específicos (procuração)
- data_procuracao: Data da procuração
- validade_procuracao: Validade da procuração

**OBSERVAÇÕES E PROBLEMAS:**
- observacoes: Observações importantes
- problemas_identificados: Problemas identificados
- inconsistencias: Inconsistências encontradas

🧷 **FORMATO OBRIGATÓRIO DA RESPOSTA (JSON VÁLIDO)**:
{{
    "tipo_documento": "{document_type}",
    "numero_documento": "123456",
    "data_documento": "15/12/2020",
    "local_documento": "São Luís/MA",
    "descricao_imovel": "Casa residencial localizada na Rua X...",
    "inscricao_imobiliaria": "II-123456",
    "rip": "RIP-123456",
    "endereco_completo": "Rua A, 123, Centro, São Luís/MA",
    "area_imovel": "150m²",
    "tipo_imovel": "Casa residencial",
    "proprietarios_atuais": "João da Silva, Maria da Silva",
    "compradores": "João da Silva",
    "vendedores": "Maria da Silva",
    "transmitentes": "Maria da Silva",
    "adquirentes": "João da Silva",
    "outorgantes": "",
    "outorgados": "",
    "cpfs_cnpjs": "123.456.789-00, 987.654.321-00",
    "rgs": "1234567 SSP/MA, 7654321 SSP/MA",
    "enderecos_partes": "Rua A, 123, Centro, São Luís/MA",
    "estados_civis": "Casado, Casada",
    "profissoes": "Advogado, Médica",
    "nacionalidades": "Brasileira, Brasileira",
    "valor_transacao": "R$ 150.000,00",
    "valor_contrato": "R$ 150.000,00",
    "valor_itbi": "R$ 3.000,00",
    "forma_pagamento": "À vista",
    "valor_avaliacao": "R$ 150.000,00",
    "onus_ativos": ["Hipoteca em favor do Banco X"],
    "restricoes_judiciais": [],
    "hipotecas": ["Hipoteca em favor do Banco X"],
    "penhoras": [],
    "usufrutos": [],
    "certidoes_presentes": ["Certidão de inteiro teor", "Certidão de situação jurídica"],
    "prazos_certidoes": ["30 dias", "30 dias"],
    "documentos_anexos": ["Certidão de casamento", "Certidão de óbito"],
    "procuracoes": [],
    "historico_transmissoes": ["Compra e venda em 2020", "Doação em 2015"],
    "data_ultima_transmissao": "15/12/2020",
    "valor_ultima_transmissao": "R$ 150.000,00",
    "clausulas_especiais": ["Cláusula de arras", "Cláusula de garantia"],
    "condicoes_especiais": "Entrega em 30 dias",
    "garantias": "Garantia de evicção",
    "tipo_dominialidade": "Propriedade plena",
    "senhorio_direto": "",
    "enfiteuta": "",
    "numero_itbi": "ITBI-123456",
    "aliquota_aplicada": "2%",
    "base_calculo": "R$ 150.000,00",
    "valor_imposto": "R$ 3.000,00",
    "isencao_aplicada": "",
    "representante_legal": "",
    "poderes_especificos": "",
    "data_procuracao": "",
    "validade_procuracao": "",
    "observacoes": "Documento em bom estado",
    "problemas_identificados": [],
    "inconsistencias": []
}}

⚠️ **IMPORTANTE**: 
- Extraia **TODOS OS DADOS RELEVANTES** do documento
- **NÃO IGNORE** nenhuma informação importante
- **CONSIDERE** todas as menções a outros documentos, valores, datas, etc.
- Se um dado não estiver presente, use string vazia ("")
- Responda APENAS em JSON válido

**EXEMPLOS DO QUE EXTRAIR:**
- Números de documentos → EXTRAIR
- Nomes de pessoas → EXTRAIR
- Valores → EXTRAIR
- Datas → EXTRAIR
- Endereços → EXTRAIR
- Ônus → EXTRAIR
- Certidões → EXTRAIR
- Cláusulas → EXTRAIR
- Observações → EXTRAIR

**RESPONDA APENAS O JSON, SEM TEXTO ADICIONAL.**
"""
        

        
        if not Config.OPENAI_API_KEY:
            raise ValueError("A variável de ambiente OPENAI_API_KEY não está definida!")
        
        client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
            max_tokens=2000
        )
        
        content = response.choices[0].message.content
        
        if not content:
            print("❌ Resposta vazia da OpenAI")
            return {"error": "Resposta vazia da OpenAI"}
        
        # Limpar e processar JSON com tratamento de erro melhorado
        def clean_json_response(response_text):
            # Remover blocos markdown
            response_text = re.sub(r'^```json\s*|```$', '', response_text.strip(), flags=re.MULTILINE)
            response_text = re.sub(r'^```\s*|```$', '', response_text.strip(), flags=re.MULTILINE)
            
            # Tentar encontrar JSON válido
            match = re.search(r'\{[\s\S]+\}', response_text)
            if match:
                return match.group(0)
            return response_text.strip()

        try:
            cleaned_content = clean_json_response(content)
            print(f"🔍 Conteúdo limpo (primeiros 500 chars): {cleaned_content[:500]}")
            
            # Tentar parsear JSON
            try:
                result = json.loads(cleaned_content)
                print(f"✅ JSON parseado com sucesso para {document_type}")
                return result
            except json.JSONDecodeError as json_error:
                print(f"❌ Erro no parse JSON: {json_error}")
                print(f"🔍 Tentando corrigir JSON...")
                
                # Tentar corrigir problemas comuns
                fixed_content = cleaned_content
                
                # Corrigir vírgulas finais
                fixed_content = re.sub(r',\s*}', '}', fixed_content)
                fixed_content = re.sub(r',\s*]', ']', fixed_content)
                
                # Corrigir aspas não fechadas
                fixed_content = re.sub(r'"([^"]*)$', r'"\1"', fixed_content)
                
                # Tentar parsear novamente
                try:
                    result = json.loads(fixed_content)
                    print(f"✅ JSON corrigido e parseado com sucesso")
                    return result
                except json.JSONDecodeError as json_error2:
                    print(f"❌ Erro persistente no JSON: {json_error2}")
                    print(f"🔍 Conteúdo problemático: {fixed_content}")
                    
                    # Retornar estrutura básica em caso de erro
                    return {
                        "error": "Erro no processamento da resposta da IA",
                        "raw_content": content[:200],
                        "json_error": str(json_error2)
                    }
                    
        except Exception as parse_error:
            print(f"❌ Erro geral no processamento: {parse_error}")
            return {"error": f"Erro no processamento: {str(parse_error)}"}
        
    except Exception as e:
        print(f"❌ Erro na extração de dados do documento: {str(e)}")
        return {"error": f"Erro na extração: {str(e)}"}

def analyze_checklist_with_document_data(all_results, model="gpt-3.5-turbo"):
    """Analisa o checklist com base em TODOS os dados extraídos de TODOS os documentos"""
    try:
        print(f"🔍 Analisando checklist com TODOS os dados de {len(all_results)} documentos")
        
        # Preparar contexto completo com TODOS os dados de TODOS os documentos
        documents_context = ""
        document_summary = []
        all_document_data = {}
        
        for result in all_results:
            doc_data = result.get('document_data', {})
            if not doc_data.get('error'):
                # Resumo do documento
                doc_summary = f"Documento: {result['filename']} ({result['document_type']})"
                document_summary.append(doc_summary)
                
                # Armazenar todos os dados do documento
                all_document_data[result['filename']] = {
                    'type': result['document_type'],
                    'data': doc_data
                }
                
                # Dados detalhados do documento
                documents_context += f"\n--- DOCUMENTO: {result['filename']} ({result['document_type']}) ---\n"
                for key, value in doc_data.items():
                    if value and str(value).strip():
                        documents_context += f"{key}: {value}\n"
        
        # Obter checklist completo
        checklist = get_checklist_for_document_type("GENERAL")
        
        # Criar resumo dos documentos disponíveis
        documents_available = "\n".join(document_summary)
        
        prompt = f"""
📌 CONTEXTO:
Você é um Registrador Imobiliário analisando documentos para qualificação de registro.

Sua tarefa é responder **CADA PERGUNTA ESPECÍFICA** do checklist com base nos dados extraídos dos documentos.

---

📁 DOCUMENTOS DISPONÍVEIS PARA ANÁLISE:
{documents_available}

📋 DADOS COMPLETOS DE TODOS OS DOCUMENTOS:
{documents_context}

---

📋 CHECKLIST DE QUALIFICAÇÃO:

⚠️ **INSTRUÇÕES CRÍTICAS**:
1. **ANALISE CADA PERGUNTA INDIVIDUALMENTE**: Cada pergunta tem um contexto específico
2. **BUSQUE DADOS RELEVANTES**: Procure nos documentos dados que respondam à pergunta específica
3. **RELACIONE CORRETAMENTE**: Conecte a pergunta com os dados corretos dos documentos
4. **JUSTIFIQUE PRECISAMENTE**: Baseie a resposta nos dados encontrados

**EXEMPLOS DE ANÁLISE CORRETA**:

**Pergunta 1**: "O título foi apresentado juntamente com as certidões de inteiro teor e de situação jurídica?"
- ✅ **Buscar nos dados**: certidoes_presentes, prazos_certidoes, tipo_documento
- ✅ **Resposta correta**: "SIM - Documento contém certidão de situação jurídica válida por 30 dias. [Doc: certidao.pdf]"

**Pergunta 2**: "A nova matrícula preenche os requisitos do Art. 176?"
- ✅ **Buscar nos dados**: numero_matricula, inscricao_imobiliaria, proprietarios_atuais, descricao_imovel
- ✅ **Resposta correta**: "SIM - Matrícula contém número, inscrição imobiliária e descrição completa do imóvel. [Doc: matricula.pdf]"

**Pergunta 3**: "Verificar dominialidade do imóvel?"
- ✅ **Buscar nos dados**: tipo_dominialidade, senhorio_direto, enfiteuta
- ✅ **Resposta correta**: "NÃO - Não há menção a terreno foreiro nos documentos. [Doc: matricula.pdf]"

Para cada item do checklist:
- **ANALISE A PERGUNTA ESPECÍFICA**
- **BUSQUE DADOS RELEVANTES** nos documentos
- **RESPONDA**: `SIM`, `NÃO` ou `N.A.`
- **JUSTIFIQUE** com dados específicos encontrados
- **INDIQUE** quais documentos foram utilizados

🧷 **FORMATO OBRIGATÓRIO DA RESPOSTA (JSON VÁLIDO)**:
{{
    "item1": {{
        "resposta": "SIM",
        "justificativa": "Certidão de situação jurídica presente com prazo de validade de 30 dias. [Documentos utilizados: certidao.pdf]"
    }},
    "item2": {{
        "resposta": "SIM", 
        "justificativa": "Matrícula contém número, inscrição imobiliária e descrição completa do imóvel conforme Art. 176. [Documentos utilizados: matricula.pdf]"
    }},
    "item3": {{
        "resposta": "NÃO",
        "justificativa": "Não há menção a terreno foreiro à União ou Município nos documentos analisados. [Documentos utilizados: matricula.pdf]"
    }}
}}

CHECKLIST A SER RESPONDIDO:
{checklist}

⚠️ **IMPORTANTE**: 
- **ANALISE CADA PERGUNTA ESPECIFICAMENTE**
- **BUSQUE DADOS RELEVANTES** para cada pergunta
- **NÃO DÊ RESPOSTAS GENÉRICAS**
- **BASEIE-SE NOS DADOS ENCONTRADOS**
- **JUSTIFIQUE COM DADOS ESPECÍFICOS**
- Se não houver dados suficientes, marque como `N.A.`
- Sempre indique quais documentos foram utilizados
- Responda APENAS em JSON válido

**DADOS IMPORTANTES PARA BUSCAR**:
- **Certidões**: certidoes_presentes, prazos_certidoes, tipo_certidao
- **Matrícula**: numero_matricula, inscricao_imobiliaria, proprietarios_atuais, descricao_imovel
- **Dominialidade**: tipo_dominialidade, senhorio_direto, enfiteuta, rip
- **Ônus**: onus_ativos, restricoes_judiciais, hipotecas, penhoras
- **Valores**: valor_transacao, valor_contrato, valor_itbi, valor_avaliacao
- **Partes**: compradores, vendedores, transmitentes, adquirentes, cpfs_cnpjs
- **Datas**: data_documento, data_ultima_transmissao, data_contrato
- **Assinaturas**: representante_legal, poderes_especificos, rgs, enderecos_partes
- **Qualificação**: estados_civis, profissoes, nacionalidades
- **Documentos**: documentos_anexos, procuracoes, clausulas_especiais

**RESPONDA APENAS O JSON, SEM TEXTO ADICIONAL.**
"""
        
        if not Config.OPENAI_API_KEY:
            raise ValueError("A variável de ambiente OPENAI_API_KEY não está definida!")
        
        client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
            max_tokens=4000
        )
        
        content = response.choices[0].message.content
        
        if not content:
            print("❌ Resposta vazia da OpenAI")
            return {"error": "Resposta vazia da OpenAI"}
        
        # Limpar e processar JSON
        def clean_json_response(response_text):
            response_text = re.sub(r'^```json\s*|```$', '', response_text.strip(), flags=re.MULTILINE)
            response_text = re.sub(r'^```\s*|```$', '', response_text.strip(), flags=re.MULTILINE)
            match = re.search(r'\{[\s\S]+\}', response_text)
            if match:
                return match.group(0)
            return response_text.strip()

        try:
            cleaned_content = clean_json_response(content)
            result = json.loads(cleaned_content)
            print(f"✅ Análise do checklist concluída")
            return result
            
        except Exception as e:
            print(f"❌ Erro no processamento do checklist: {str(e)}")
            return {"error": f"Erro no processamento do checklist: {str(e)}"}
        
    except Exception as e:
        print(f"❌ Erro na análise do checklist: {str(e)}")
        return {"error": f"Erro na análise do checklist: {str(e)}"}

def analyze_document_with_checklist(text_content, document_type, filename="", model="gpt-3.5-turbo", all_documents=None, all_filenames=None):
    """Função mantida para compatibilidade - agora usa a nova lógica"""
    return extract_document_specific_data(text_content, document_type, filename, model)

def analyze_qualification_documents(documents_texts, filenames=None, model="gpt-3.5-turbo"):
    """Analisa múltiplos documentos para qualificação - cada documento individualmente"""
    try:
        print(f"🔍 Iniciando análise de qualificação com {model}")
        
        if filenames is None:
            filenames = [f"documento_{i+1}.pdf" for i in range(len(documents_texts))]
        
        all_results = []
        
        # Primeira etapa: Analisar cada documento individualmente
        for i, (doc_text, filename) in enumerate(zip(documents_texts, filenames)):
            print(f"📄 Analisando documento {i+1}/{len(documents_texts)}: {filename}")
            
            # Etapa 1: Classificar tipo do documento
            document_type = classify_document_type(doc_text, filename, model)
            print(f"✅ Documento {i+1} classificado como: {document_type}")
            
            # Etapa 2: Extrair dados específicos do documento
            document_data = extract_document_specific_data(doc_text, document_type, filename, model)
            
            all_results.append({
                'document_index': i+1,
                'filename': filename,
                'document_type': document_type,
                'document_data': document_data
            })
        
        # Segunda etapa: Analisar checklist com base nos dados extraídos
        checklist_analysis = analyze_checklist_with_document_data(all_results, model)
        
        # Consolidar resultados
        consolidated_result = {
            'total_documents': len(documents_texts),
            'documents_analyzed': all_results,
            'checklist_analysis': checklist_analysis,
            'summary': {
                'matriculas': len([r for r in all_results if r['document_type'] == 'MATRÍCULA']),
                'contratos': len([r for r in all_results if r['document_type'] == 'CONTRATO']),
                'itbis': len([r for r in all_results if r['document_type'] == 'ITBI']),
                'certidoes': len([r for r in all_results if r['document_type'] == 'CERTIDÃO']),
                'procuracoes': len([r for r in all_results if r['document_type'] == 'PROCURAÇÃO']),
                'desconhecidos': len([r for r in all_results if r['document_type'] == 'DESCONHECIDO'])
            }
        }
        
        print(f"✅ Análise de qualificação concluída: {len(documents_texts)} documentos processados")
        return consolidated_result
        
    except Exception as e:
        print(f"❌ Erro na análise de qualificação: {str(e)}")
        return {"error": f"Erro na análise de qualificação: {str(e)}"}

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
    elif service_type == 'qualificacao_avancada':
        # Para análise avançada, retornar o resultado diretamente sem validação específica
        return fields_dict
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
        print(f"🎯 Modelo que será usado na API OpenAI: {model}")
        
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
                "⚠️ **CRÍTICO**: Analise toda a sequência da matrícula, considerando transmissões (compra e venda, doação, herança, etc.) para identificar corretamente quem é o PROPRIETÁRIO ATUAL do imóvel, mesmo que haja vários registros anteriores. "
                "⚠️ **CRÍTICO**: Se o proprietário for casado, INCLUA O CÔNJUGE com todos os dados (nome, CPF, RG, nacionalidade, estado civil, regime de bens, endereço). "
                "⚠️ **CRÍTICO**: Se houver mais de um proprietário (coproprietários), liste TODOS com seus respectivos dados. "
                "⚠️ **CRÍTICO**: Não inclua proprietários antigos ou substituídos. "
                "⚠️ **CRÍTICO**: Para casais, use formato: 'João da Silva, CPF: 123.456.789-00, casado, regime de comunhão parcial, residente em... E Maria da Silva, CPF: 987.654.321-00, casada, regime de comunhão parcial, residente em...'\n"
                "- senhorio_enfiteuta: Nome do senhorio direto e enfiteuta (se aplicável)\n"
                "- inscricao_imobiliaria: Inscrição imobiliária (número de inscrição no cartório)\n"
                "- rip: RIP (Registro de Imóveis Públicos) se houver\n"
                "- onus_certidao_negativa: Ônus reais, restrições judiciais e administrativas, ou certidão negativa (transcreva o texto completo referente a esses itens)\n"
                "- nome_solicitante: Nome completo do solicitante da certidão\n\n"
                "⚠️ **EXEMPLOS DE FORMATAÇÃO CORRETA**:\n"
                "1. Proprietário solteiro: 'João da Silva, CPF: 123.456.789-00, solteiro, brasileiro, residente em...'\n"
                "2. Casal: 'João da Silva, CPF: 123.456.789-00, casado, regime de comunhão parcial, residente em... E Maria da Silva, CPF: 987.654.321-00, casada, regime de comunhão parcial, residente em...'\n"
                "3. Múltiplos proprietários: 'João da Silva, CPF: 123.456.789-00, casado, residente em... E Maria da Silva, CPF: 987.654.321-00, casada, residente em... E Pedro Santos, CPF: 111.222.333-00, solteiro, residente em...'\n\n"
                "Exemplo de formato esperado:\n"
                "{\"cnm\": \"123456\", \"descricao_imovel\": \"Casa residencial localizada na Rua X...\", "
                "\"proprietarios\": \"João da Silva, CPF: 123.456.789-00, casado, regime de comunhão parcial, residente em... E Maria da Silva, CPF: 987.654.321-00, casada, regime de comunhão parcial, residente em...\", "
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
        elif service_type == "qualificacao_avancada":
            # Usar a nova lógica de análise avançada
            try:
                # Dividir o texto em documentos individuais (cada documento está separado por "=== DOCUMENTO:")
                documents = text.split("=== DOCUMENTO:")
                documents = [doc.strip() for doc in documents if doc.strip()]
                
                print(f"🔍 Documentos encontrados: {len(documents)}")
                for i, doc in enumerate(documents):
                    print(f"📄 Documento {i+1}: {doc[:100]}...")
                
                if not documents:
                    return {"error": "Nenhum documento encontrado para análise"}
                
                # Extrair nomes dos arquivos do texto (se disponível)
                filenames = []
                for doc in documents:
                    # Tentar extrair nome do arquivo da primeira linha
                    lines = doc.split('\n')
                    if lines and lines[0].strip():
                        # O nome do arquivo está na primeira linha após "DOCUMENTO:"
                        filename = lines[0].strip()
                        filenames.append(filename)
                    else:
                        filenames.append(f"documento_{len(filenames)+1}.pdf")
                
                # Usar a nova função de análise avançada
                result = analyze_qualification_documents(documents, filenames, model)
                return result
                
            except Exception as e:
                print(f"❌ Erro na análise avançada: {str(e)}")
                return {"error": f"Erro na análise avançada: {str(e)}"}
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
