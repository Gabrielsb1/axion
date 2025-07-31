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

def classify_document_type(text_content, filename="", model="gpt-4o"):
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

def extract_document_specific_data(text_content, document_type, filename="", model="gpt-4o"):
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

def analyze_checklist_with_document_data(all_results, model="gpt-4o"):
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

def analyze_document_with_checklist(text_content, document_type, filename="", model="gpt-4o", all_documents=None, all_filenames=None):
    """Função mantida para compatibilidade - agora usa a nova lógica"""
    return extract_document_specific_data(text_content, document_type, filename, model)

# def analyze_qualification_documents(documents_texts, filenames=None, model="gpt-4o"):
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

def clean_and_validate_fields(fields_dict, service_type='certidao'):
    """Limpa e valida os campos extraídos pela OpenAI"""
    if service_type == 'certidao':
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

def extract_fields_with_openai(text, model="gpt-4o", service_type="certidao"):
    """Envia o texto para a OpenAI API e retorna os campos extraídos em JSON"""
    try:
        print(f"🔍 Iniciando extração com OpenAI - Modelo: {model} - Serviço: {service_type}")
        print(f"📝 Tamanho do texto: {len(text)} caracteres")
        print(f"🎯 Modelo que será usado na API OpenAI: {model}")
        
        if service_type == "certidao":
            prompt = (
                "Extraia os seguintes campos do texto de uma matrícula imobiliária abaixo. "
                "Responda APENAS em JSON válido, sem explicações ou texto adicional. "
                "Todos os valores devem ser strings. Se um campo não for encontrado, use string vazia (\"\").\n\n"
                "Campos a extrair:\n"
                "- cnm: Cadastro Nacional de Matrícula (número da matrícula)\n"
                "- descricao_imovel: Descrição completa do imóvel (endereço, área, confrontações, benfeitorias)\n"
                "- proprietarios: Nome(s) completo(s) do(s) proprietário(s) atual(is), com todos os dados disponíveis: CPF, RG, nacionalidade, estado civil, regime de bens e endereço. **IMPORTANTE:** Se o proprietário for casado, INCLUA O CÔNJUGE com todos os dados (nome, CPF, RG, nacionalidade, estado civil, regime de bens, endereço). Analise toda a sequência da matrícula, considerando transmissões (compra e venda, doação, herança, etc.) para identificar corretamente quem é o PROPRIETÁRIO ATUAL do imóvel, mesmo que haja vários registros anteriores. Se houver mais de um proprietário (coproprietários), liste TODOS com seus respectivos dados. ex: Para casais, use formato: 'João da Silva, CPF: 123.456.789-00, casado, regime de comunhão parcial, residente em... E Maria da Silva, CPF: 987.654.321-00, casada, regime de comunhão parcial, residente em..."
                "- senhorio_enfiteuta: Nome do senhorio direto e enfiteuta (se aplicável)\n"
                "- inscricao_imobiliaria: Inscrição imobiliária (número de inscrição no cartório)\n"
                "- rip: RIP (Registro de Imóveis Públicos) se houver\n"
                "- onus_certidao_negativa: Ônus reais, restrições judiciais e administrativas, ou certidão negativa (transcreva o texto completo referente a esses itens). Tipos de ÔNUS: Hipoteca, Alienação, Promessa de Compra e Venda, Penhora, Indisponibilidade, Usufruto, Clásula Restritiva, Averbação Premonitória, Bloqueio, Arresto, Execução, Cédula de Crédito Comercial, Cédula de Crédito Imobiliário E OUTROS. **IMPORTANTE:** NÃO inclua ônus, restrições ou gravames que já tenham sido cancelados, extintos ou baixados no documento. Considere apenas ônus ATIVOS. Se houver menção de cancelamento, desconsidere esse ônus.\n"
                "- nome_solicitante: Nome completo do solicitante da certidão\n\n"
                "**EXEMPLOS DE FORMATAÇÃO CORRETA**:\n"
                "1. Proprietário solteiro: 'João da Silva, CPF: 123.456.789-00, solteiro, brasileiro, residente em...'\n"
                "2. Casal: 'João da Silva, CPF: 123.456.789-00, casado, regime de comunhão parcial, residente em... E Maria da Silva, CPF: 987.654.321-00, casada, regime de comunhão parcial, residente em...'\n"
                "3. Múltiplos proprietários: 'João da Silva, CPF: 123.456.789-00, casado, residente em... E Maria da Silva, CPF: 987.654.321-00, casada, residente em... E Pedro Santos, CPF: 111.222.333-00, solteiro, residente em...'\n\n"
                "Exemplo de formato esperado:\n"
                "{\"cnm\": \"123456\", \"descricao_imovel\": \"Casa residencial localizada na Rua X...\", "
                "\"proprietarios\": \"João da Silva, CPF: 123.456.789-00, casado, regime de comunhão parcial, residente em... E Maria da Silva, CPF: 987.654.321-00, casada, regime de comunhão parcial, residente em...\", "
                "... }\n\n"
                "Texto da matrícula:\n" + text
            )
        else:
            return {"error": f"Tipo de serviço não suportado: {service_type}"}
        
        # Verificar se a chave da API está configurada
        if not Config.OPENAI_API_KEY:
            raise ValueError("A variável de ambiente OPENAI_API_KEY não está definida!")
        
        # Fazer a chamada para a API OpenAI
        print("📡 Enviando requisição para OpenAI...")
        client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
            max_tokens=4000
        )
        
        content = response.choices[0].message.content
        print(f"✅ Resposta recebida da OpenAI - Tamanho: {len(content) if content else 0}")
        
        if content is None:
            return {"error": "Resposta vazia da OpenAI"}
        
        # Processar resposta JSON
        try:
            # Limpar a resposta de possíveis blocos markdown
            cleaned_content = re.sub(r'^```json\s*|```$', '', content.strip(), flags=re.MULTILINE)
            cleaned_content = re.sub(r'^```\s*|```$', '', cleaned_content.strip(), flags=re.MULTILINE)
            
            # Tentar encontrar JSON válido na resposta
            match = re.search(r'\{[\s\S]+\}', cleaned_content)
            if match:
                result = json.loads(match.group(0))
            else:
                result = json.loads(cleaned_content)
            
            print("✅ Campos extraídos com sucesso")
            print(f"📊 Campos encontrados: {list(result.keys())}")
            
            return result
            
        except Exception as e:
            print(f"❌ Erro ao processar JSON da resposta: {str(e)}")
            return {"error": f"Erro ao interpretar resposta: {str(e)}", "raw": content}
            
    except Exception as e:
        print(f"❌ Erro geral na extração OpenAI: {str(e)}")
        return {"error": f"Erro na comunicação com OpenAI: {str(e)}", "raw": None}


def extract_relevant_sections(document_text, doc_type):
    """Extrai apenas seções relevantes do documento para economizar tokens"""
    if not document_text or not doc_type:
        return document_text
    
    # Mapear palavras-chave por tipo de documento
    keywords_by_type = {
        'contrato': ['contrato', 'compra', 'venda', 'comprador', 'vendedor', 'preço', 'valor', 'pagamento'],
        'matricula': ['matrícula', 'registro', 'imóvel', 'proprietário', 'área', 'confrontações'],
        'certidao': ['certidão', 'débitos', 'ônus', 'gravames', 'hipoteca', 'penhora'],
        'procuracao': ['procuração', 'outorgante', 'outorgado', 'poderes', 'representação'],
        'rg': ['identidade', 'rg', 'nome', 'filiação', 'nascimento'],
        'cpf': ['cpf', 'receita federal', 'situação cadastral'],
        'comprovante_residencia': ['endereço', 'residência', 'domicílio', 'correspondência'],
        'estado_civil': ['estado civil', 'casamento', 'solteiro', 'casado', 'divorciado', 'viúvo'],
        'itbi': ['itbi', 'imposto', 'transmissão', 'bens imóveis'],
        'iptu': ['iptu', 'predial', 'territorial', 'urbano']
    }
    
    # Obter palavras-chave para o tipo de documento
    keywords = keywords_by_type.get(doc_type, [])
    
    if not keywords:
        return document_text  # Se não há palavras-chave específicas, retorna o texto completo
    
    # Dividir o texto em parágrafos
    paragraphs = document_text.split('\n')
    relevant_paragraphs = []
    
    for paragraph in paragraphs:
        paragraph_lower = paragraph.lower()
        # Verificar se o parágrafo contém alguma palavra-chave relevante
        if any(keyword in paragraph_lower for keyword in keywords):
            relevant_paragraphs.append(paragraph)
    
    # Se encontrou parágrafos relevantes, retorna apenas eles
    if relevant_paragraphs:
        return '\n'.join(relevant_paragraphs)
    
    # Se não encontrou nada relevante, retorna o texto completo (fallback)
    return document_text


# def analyze_qualification_documents(documents, filenames, model="gpt-4o"):
    """Análise avançada de qualificação usando OpenAI com verificação rigorosa de documentos"""
    try:
        print(f"🔍 Iniciando análise de qualificação avançada com {len(documents)} documentos")
        print(f"📁 Arquivos: {filenames}")
        
        # Classificar documentos por tipo baseado no nome do arquivo
        document_types = classify_documents_by_filename(filenames)
        
        # Criar prompt específico para análise de qualificação
        prompt = create_qualification_analysis_prompt(documents, document_types, filenames)
        
        if not Config.OPENAI_API_KEY:
            raise ValueError("A variável de ambiente OPENAI_API_KEY não está definida!")
        
        print("📡 Enviando requisição para OpenAI (Análise de Qualificação)...")
        client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
            max_tokens=4000
        )
        
        content = response.choices[0].message.content
        print(f"✅ Resposta recebida da OpenAI - Tamanho: {len(content) if content else 0}")
        
        if content is None:
            return {"error": "Resposta vazia da OpenAI"}
        
        # Processar resposta JSON
        try:
            cleaned_content = re.sub(r'^```json\s*|```$', '', content.strip(), flags=re.MULTILINE)
            cleaned_content = re.sub(r'^```\s*|```$', '', cleaned_content.strip(), flags=re.MULTILINE)
            
            match = re.search(r'\{[\s\S]+\}', cleaned_content)
            if match:
                result = json.loads(match.group(0))
            else:
                result = json.loads(cleaned_content)
            
            print("✅ Análise de qualificação processada com sucesso")
            print(f"📊 Itens analisados: {len([k for k in result.keys() if k.startswith('item')])}")
            
            # Adicionar metadados da análise
            result['documents_analyzed'] = [
                {'filename': fname, 'type': doc_type} 
                for fname, doc_type in zip(filenames, document_types)
            ]
            result['analysis_method'] = 'advanced_qualification'
            result['total_documents'] = len(documents)
            
            return result
            
        except Exception as e:
            print(f"❌ Erro ao processar JSON da qualificação: {str(e)}")
            return {"error": f"Erro ao interpretar resposta: {str(e)}", "raw": content}
            
    except Exception as e:
        print(f"❌ Erro na análise de qualificação: {str(e)}")
        return {"error": f"Erro na análise: {str(e)}"}


def classify_documents_by_filename(filenames):
    """Classifica documentos por tipo baseado no nome real do arquivo (sugestão do usuário)"""
    document_types = []
    
    # Mapeamento direto baseado no nome do arquivo (mais confiável)
    type_mapping = {
        # Documentos principais
        'contrato': ['contrato', 'compra', 'venda', 'escritura'],
        'matricula': ['matricula', 'matrícula', '3ri', 'registro', 'imovel', 'imóvel'],
        
        # Certidões específicas
        'certidao_inteiro_teor': ['inteiro_teor', 'inteiro', 'teor', 'certidao_inteiro'],
        'certidao_situacao_juridica': ['situacao_juridica', 'situação_jurídica', 'situacao', 'juridica'],
        'certidao_onus_reais': ['onus_reais', 'ônus_reais', 'onus', 'ônus'],
        'certidao_acoes_reipersecutorias': ['acoes_reipersecutorias', 'ações_reipersecutoria', 'acoes', 'ações', 'reipersecutoria'],
        'certidao_itbi': ['itbi', 'certidao_itbi'],
        'certidao_rip': ['rip', 'certidao_rip'],
        'certidao_junta_comercial': ['junta_comercial', 'junta', 'comercial'],
        
        # Documentos de apoio
        'procuracao': ['procuracao', 'procuração'],
        'cnd': ['cnd', 'negativa', 'debitos', 'débitos'],
        'termo_quitacao': ['quitacao', 'quitação', 'termo_quitacao'],
        'termo_autorizacao': ['autorizacao', 'autorização', 'termo_autorizacao'],
        'atos_constitutivos': ['atos_constitutivos', 'social', 'ata', 'constitutivo'],
        'declaracao_primeira_aquisicao': ['declaracao', 'declaração', 'primeira_aquisicao', 'aquisicao', 'aquisição'],
        'pacto_antenupcial': ['pacto_antenupcial', 'pacto', 'antenupcial'],
        
        # Documentos especiais
        'cat_spu': ['cat_spu', 'spu', 'cat'],
        'termo_aforamento': ['aforamento', 'termo_aforamento'],
        'boletim_cadastro_imobiliario': ['boletim', 'cadastro', 'imobiliario', 'imobiliário'],
        'leilao': ['leilao', 'leilão'],
        'escritura': ['escritura'],
        'documento_identidade': ['rg', 'cpf', 'identidade', 'documento']
    }
    
    for filename in filenames:
        filename_lower = filename.lower().replace('_', ' ').replace('-', ' ')
        doc_type = 'documento_generico'  # Padrão
        
        # Procurar correspondência mais específica primeiro
        for type_name, keywords in type_mapping.items():
            if any(keyword in filename_lower for keyword in keywords):
                doc_type = type_name
                break
        
        document_types.append(doc_type)
        print(f"📝 Arquivo '{filename}' classificado como: {doc_type}")
    
    return document_types


def create_qualification_analysis_prompt(documents, document_types, filenames):
    """Cria prompt específico para análise de qualificação com mapeamento de arquivos"""
    
    prompt = """
Você é um especialista em análise de documentos imobiliários para qualificação registral.
Analise os documentos fornecidos e responda ao checklist de qualificação, considerando que cada item deve ser analisado com base nos arquivos específicos relacionados.

RESPONDA APENAS EM JSON VÁLIDO, sem explicações adicionais.

MAPEAMENTO DE ITENS DO CHECKLIST POR ARQUIVO:

🔹 BLOCO 1 – MATRÍCULA E CERTIDÕES (Itens 1 a 9):
- item1: Certidões (inteiro teor, situação jurídica, ônus reais, ações reipersecutórias) + Contrato
- item2: Nova Matrícula (requisitos Art. 176, § 1º, II da Lei 6.015/1973)
- item3: Matrícula + Certidões SPU/Município (dominialidade)
- item4: Certidão RIP + Matrícula (terrenos foreiros à União)
- item5: Matrícula + Certidão de Ônus Reais (ônus sobre imóvel)
- item6: Contrato + Termo de Autorização (cancelamento de ônus)
- item7: Contrato + Matrícula (qualificação proprietários)
- item8: Matrícula (inscrição imobiliária/RIP)
- item9: Matrícula + Certidão ITBI (inscrição imobiliária)

🔹 BLOCO 2 – TÍTULO E DOCUMENTAÇÃO (Itens T1 a T23):
- itemT1: Contrato (vias iguais)
- itemT2: Contrato (assinaturas, data, local)
- itemT3: Contrato + Matrícula (descrição e matrícula)
- itemT4: Certidão ITBI + Contrato + Matrícula (descrição)
- itemT5: Certidão ITBI + Contrato (valores)
- itemT6: Certidão ITBI + Contrato (partes)
- itemT7: Termo quitação + Contrato + Procuração (assinaturas)
- itemT8: Contrato + Matrícula (qualificação transmitentes)
- itemT9: Declaração 1ª Aquisição (firma reconhecida)
- itemT10: Pacto antenupcial + Matrícula (regime casamento)
- itemT11: Procuração + Contrato (representação)
- itemT12: Atos Constitutivos + Contrato (PJ representação)
- itemT13: CND + Contrato (PJ débitos)
- itemT14: CND específica + Contrato (devedor CCB/mútuo)
- itemT15: Certidão Junta + Contrato (PJ simplificada)
- itemT16: RG + CPF + Contrato (firma individual)
- itemT17: CAT SPU + Contrato (terreno foreiro União)
- itemT18: Termo aforamento + Escritura (foreiro município)
- itemT19: Contrato + Matrícula + Boletim (descrição atualizada)
- itemT20: Procuração (credor fiduciário)
- itemT21: Contrato (requerimento genérico)
- itemT22: Matrícula + Certidões (averbações necessárias)
- itemT23: Matrícula + Leilão + Quitação (consolidação propriedade)

🚨 REGRAS CRÍTICAS DE ANÁLISE:

1. **VERIFICAÇÃO OBRIGATÓRIA DE DOCUMENTOS:**
   - ANTES de analisar qualquer item, verifique se TODOS os documentos mapeados para aquele item estão disponíveis
   - Se faltar QUALQUER documento obrigatório, responda "N/A" com justificativa explicando a ausência
   - NUNCA responda "Sim" se não tiver todos os documentos necessários

2. **CRITÉRIOS DE RESPOSTA:**
   - "Sim": APENAS se o requisito está atendido E todos os documentos necessários estão presentes
   - "Não": Se todos os documentos estão presentes mas o requisito não está atendido
   - "N/A": Se falta algum documento obrigatório OU não se aplica

3. **JUSTIFICATIVAS OBRIGATÓRIAS:**
   - Mencione TODOS os documentos que deveriam estar presentes para o item
   - Se faltar documento, liste especificamente quais estão faltando
   - Se responder "Sim", confirme que todos os documentos necessários foram analisados

**EXEMPLO DE ANÁLISE CORRETA:**
- Item que requer "Contrato + Matrícula" mas só tem "Matrícula":
  → Resposta: "N/A"
  → Justificativa: "Documento 'Contrato' não fornecido. Para análise completa deste item são necessários: Contrato + Matrícula. Disponível apenas: Matrícula."

FORMATO DE RESPOSTA OBRIGATÓRIO:
{
  "item1": "Sim/Não/N/A",
  "justificativa_item1": "Justificativa detalhada mencionando arquivos analisados",
  "item2": "Sim/Não/N/A",
  "justificativa_item2": "Justificativa detalhada mencionando arquivos analisados",
  ...
  "itemT1": "Sim/Não/N/A",
  "justificativa_itemT1": "Justificativa detalhada mencionando arquivos analisados",
  ...
  "itemT23": "Sim/Não/N/A",
  "justificativa_itemT23": "Justificativa detalhada mencionando arquivos analisados",
  "status_qualificacao": "aprovado/pendente/reprovado",
  "pontuacao_qualificacao": "0-100",
  "observacoes_gerais": "Observações sobre a análise",
  "documentos_faltantes": "Lista de documentos que faltam",
  "problemas_identificados": "Principais problemas encontrados",
  "recomendacoes_especificas": "Recomendações específicas"
}

DOCUMENTOS PARA ANÁLISE:
"""
    
    # OTIMIZAÇÃO DE TOKENS: Adicionar apenas seções relevantes de cada documento
    for i, (doc, doc_type, filename) in enumerate(zip(documents, document_types, filenames)):
        prompt += f"\n=== DOCUMENTO {i+1}: {filename} (TIPO: {doc_type.upper()}) ===\n"
        
        # Extrair apenas seções relevantes baseadas no tipo do documento (ECONOMIA DE TOKENS)
        relevant_content = extract_relevant_sections(doc, doc_type)
        prompt += relevant_content
        prompt += "\n"
    
    # Adicionar verificação prévia de documentos disponíveis
    available_doc_types = set(document_types)
    prompt += f"\n\n🔍 DOCUMENTOS DISPONÍVEIS PARA ANÁLISE: {', '.join(available_doc_types)}\n"
    
    # Adicionar mapeamento específico de quais itens podem ser analisados
    prompt += "\n🚨 ITENS QUE PODEM SER ANALISADOS (baseado nos documentos disponíveis):\n"
    
    # Mapeamento CORRIGIDO de documentos necessários por item (baseado na descrição real de cada item)
    item_requirements = {
        # BLOCO 1 - MATRÍCULA E CERTIDÕES (Itens 1-9)
        'item1': ['certidao_inteiro_teor', 'certidao_situacao_juridica', 'certidao_onus_reais', 'certidao_acoes_reipersecutorias', 'contrato'],
        'item2': ['matricula'],  # Nova matrícula
        'item3': ['contrato', 'matricula'],  # CORRIGIDO: "O contrato contém a descrição completa do imóvel e o número da matrícula?"
        'item4': ['certidao_rip', 'matricula'],
        'item5': ['matricula', 'certidao_onus_reais'],
        'item6': ['contrato', 'termo_autorizacao'],
        'item7': ['contrato', 'matricula'],
        'item8': ['matricula'],  # Matrícula - inscrição imobiliária
        'item9': ['matricula', 'certidao_itbi'],
        
        # BLOCO 2 - TÍTULO E DOCUMENTAÇÃO (Itens T1-T23)
        'itemT1': ['contrato'],  # Contrato em vias iguais
        'itemT2': ['contrato'],  # Assinaturas, data, local no contrato
        'itemT3': ['contrato', 'matricula'],  # CORRIGIDO: "O contrato contém a descrição completa..."
        'itemT4': ['certidao_itbi', 'contrato', 'matricula'],
        'itemT5': ['certidao_itbi', 'contrato'],
        'itemT6': ['certidao_itbi', 'contrato'],
        'itemT7': ['termo_quitacao', 'contrato', 'procuracao'],
        'itemT8': ['contrato', 'matricula'],  # CORRIGIDO: "Os transmitentes estão qualificados no título..."
        'itemT9': ['declaracao_primeira_aquisicao'],
        'itemT10': ['pacto_antenupcial', 'matricula'],
        'itemT11': ['procuracao', 'contrato'],
        'itemT12': ['atos_constitutivos', 'contrato'],
        'itemT13': ['cnd', 'contrato'],
        'itemT14': ['cnd', 'contrato'],
        'itemT15': ['certidao_junta_comercial', 'contrato'],
        'itemT16': ['documento_identidade', 'contrato'],
        'itemT17': ['cat_spu', 'contrato'],
        'itemT18': ['termo_aforamento', 'escritura'],
        'itemT19': ['contrato', 'matricula', 'boletim_cadastro_imobiliario'],  # CORRIGIDO: "O contrato indica a matrícula..."
        'itemT20': ['procuracao'],
        'itemT21': ['contrato'],
        'itemT22': ['matricula'],  # CORRIGIDO: Averbações na matrícula
        'itemT23': ['matricula', 'leilao', 'termo_quitacao']
    }
    
    # Verificar quais itens podem ser analisados
    analyzable_items = []
    non_analyzable_items = []
    
    for item, required_docs in item_requirements.items():
        # Verificar se todos os documentos necessários estão disponíveis
        has_all_docs = all(any(req_doc in doc_type for doc_type in available_doc_types) for req_doc in required_docs)
        
        if has_all_docs:
            analyzable_items.append(item)
        else:
            missing_docs = [doc for doc in required_docs if not any(doc in dt for dt in available_doc_types)]
            non_analyzable_items.append(f"{item} (faltam: {', '.join(missing_docs)})")
    
    prompt += f"\n✅ ITENS ANALISÁVEIS: {', '.join(analyzable_items) if analyzable_items else 'NENHUM'}\n"
    prompt += f"\n❌ ITENS NÃO ANALISÁVEIS: {', '.join(non_analyzable_items) if non_analyzable_items else 'NENHUM'}\n"
    
    prompt += "\n🚨 INSTRUÇÃO FINAL OBRIGATÓRIA:\n"
    prompt += "- Para itens NÃO ANALISÁVEIS: responda OBRIGATORIAMENTE 'N/A' com justificativa explicando quais documentos faltam\n"
    prompt += "- Para itens ANALISÁVEIS: analise normalmente e responda Sim/Não conforme o caso\n"
    prompt += "\nAnalise cada item do checklist considerando APENAS os arquivos relacionados conforme o mapeamento acima."
    
    return prompt 
