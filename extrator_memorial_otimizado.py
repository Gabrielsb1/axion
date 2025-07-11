import re
import pandas as pd
import sys
import os
from docx import Document
from io import BytesIO
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed, ProcessPoolExecutor
import time

# Regex compilados uma única vez para melhor performance
REGEX_TORRE = re.compile(
    r"Apartamento\s+(\d+),\s+tipo\s+([A-Z]),\s+da\s+Torre\s+(\d+).*?"
    r"área privativa principal de ([\d,]+)m².*?"
    r"(?:área privativa acessória de [\d,]+m².*?)?"
    r"área privativa total de ([\d,]+)m².*?"
    r"área de uso comum de ([\d,]+)m².*?"
    r"área real total de ([\d,]+)m².*?"
    r"fração ideal.*?de ([\d,]+).*?ou ([\d,]+)m²",
    re.DOTALL | re.IGNORECASE
)

REGEX_BLOCO1 = re.compile(
    r"APARTAMENTO\s+(\d+)\s*[-–]\s*BLOCO\s+(\d+):?", re.IGNORECASE
)

REGEX_BLOCO2 = re.compile(
    r"Apartamento\s+(\d+),\s*TIPO\s*([A-Z]),\s*do\s*Bloco\s+(\d+),", re.IGNORECASE
)

REGEX_AREAS_BLOCO2 = re.compile(
    r"Áreas:\s*área privativa principal de ([\d,.]+)m².*?"
    r"área privativa total de ([\d,.]+)m².*?"
    r"área de uso comum de ([\d,.]+)m².*?"
    r"área real total de ([\d,.]+)m².*?"
    r"fração ideal de solo de ([\d,.]+).*?ou ([\d,.]+)m²",
    re.DOTALL | re.IGNORECASE
)

REGEX_AREAS_BLOCO1 = re.compile(
    r"áreas:\s*privativa real de ([\d,]+)m²,\s*"
    r"área de uso comum real de ([\d,]+)m²,\s*"
    r"perfazendo uma área total real de ([\d,]+)m².*?"
    r"área equivalente de construção igual a ([\d,]+)m².*?"
    r"fração ideal.*?([0-9,.]+)%",
    re.DOTALL | re.IGNORECASE
)

# Regex para casas
REGEX_CASA_SPLIT = re.compile(r"(?:^|\n)(?:CASA|Casa)[ \n]?[Nn]?[°º]?[ ]?(\d{2})")
REGEX_AREA_TERRENO = re.compile(r"configuração.*?área total de *(\d+,\d+)")
REGEX_AREA_CONSTRUIDA = re.compile(r"área total construída da casa de *(\d+,\d+)")
REGEX_AREA_COMUM = re.compile(r"área de uso comum real de *(\d+,\d+)")
REGEX_AREA_TOTAL_REAL = re.compile(r"área total real de *(\d+,\d+)")
REGEX_FRACAO_IDEAL = re.compile(r"fração ideal do terreno correspondente a *(\d+,\d+)\s?%")

# Regex para identificação de tipo
REGEX_TORRE_PATTERN = re.compile(r"Apartamento\s+\d+,\s+tipo\s+[A-Z],\s+da\s+Torre", re.IGNORECASE)
REGEX_BLOCO_PATTERN = re.compile(r"Apartamento\s+\d+\s*[-–]\s*Bloco\s+\d+", re.IGNORECASE)
REGEX_CASA_PATTERN = re.compile(r"(?:CASA|Casa)[ \n]?[Nn]?[°º]?[ ]?\d{2}")

def identificar_tipo_documento_otimizado(texto):
    """Versão otimizada da identificação de tipo"""
    if "Apartamento" in texto and "Torre" in texto:
        return "torre"
    elif "Bloco" in texto:
        return "bloco"
    elif "Casa" in texto:
        return "casa"
    return "desconhecido"

def extrair_torre_otimizado(doc):
    """Versão otimizada da extração de torre"""
    dados = []
    
    for p in doc.paragraphs:
        texto = p.text.strip()
        if not texto:
            continue
            
        match = REGEX_TORRE.search(texto)
        if match:
            numero, tipo, torre, privativa, total, comum, real, fracao, terreno = match.groups()
            
            # Extrair descrição de forma otimizada
            idx_localizado = texto.lower().find('localizado')
            idx_ultimo_ponto = texto.rfind('.')
            descricao = ""
            if idx_localizado != -1 and idx_ultimo_ponto != -1 and idx_ultimo_ponto > idx_localizado:
                descricao = texto[idx_localizado:idx_ultimo_ponto+1].replace('\n', ' ').strip()
            
            dados.append({
                "Formato": "Torre",
                "Apartamento": numero,
                "Tipo": tipo,
                "Torre/Bloco": torre,
                "Área Privativa (m²)": privativa.replace(",", "."),
                "Área Comum (m²)": comum.replace(",", "."),
                "Área Total (m²)": real.replace(",", "."),
                "Fração Ideal (%)": fracao.replace(",", "."),
                "Área Terreno (m²)": terreno.replace(",", "."),
                "Descrição": descricao
            })
    
    return pd.DataFrame(dados)

def extrair_bloco_otimizado(doc):
    """Versão otimizada da extração de bloco"""
    dados = []
    
    for p in doc.paragraphs:
        texto = p.text.strip()
        if not texto:
            continue
            
        # Tenta padrão 2 primeiro (mais específico)
        match2 = REGEX_BLOCO2.search(texto)
        if match2:
            numero, tipo, bloco = match2.groups()
            
            # Extrair descrição
            idx_localizado = texto.lower().find('localizado')
            idx_assim_descrito = texto.lower().find('assim descrito:')
            idx_inicio = idx_localizado if idx_localizado != -1 else idx_assim_descrito
            idx_ultimo_ponto = texto.rfind('.')
            descricao = ""
            if idx_inicio != -1 and idx_ultimo_ponto != -1 and idx_ultimo_ponto > idx_inicio:
                descricao = texto[idx_inicio:idx_ultimo_ponto+1].replace('\n', ' ').strip()
            
            # Extrair áreas
            match_areas2 = REGEX_AREAS_BLOCO2.search(texto)
            if match_areas2:
                privativa, total, comum, real, fracao, terreno = match_areas2.groups()
                dados.append({
                    "Formato": "Bloco",
                    "Apartamento": numero,
                    "Tipo": tipo,
                    "Torre/Bloco": bloco,
                    "Área Privativa (m²)": privativa.replace(",", "."),
                    "Área Comum (m²)": comum.replace(",", "."),
                    "Área Total (m²)": real.replace(",", "."),
                    "Fração Ideal (%)": fracao.replace(",", "."),
                    "Área Terreno (m²)": terreno.replace(",", "."),
                    "Descrição": descricao
                })
            continue
            
        # Tenta padrão 1
        match1 = REGEX_BLOCO1.search(texto)
        if match1:
            numero, bloco = match1.groups()
            tipo = ""
            
            # Extrair descrição
            idx_localizado = texto.lower().find('localizado')
            idx_ultimo_ponto = texto.rfind('.')
            descricao = ""
            if idx_localizado != -1 and idx_ultimo_ponto != -1 and idx_ultimo_ponto > idx_localizado:
                descricao = texto[idx_localizado:idx_ultimo_ponto+1].replace('\n', ' ').strip()
            
            # Extrair áreas
            match_areas1 = REGEX_AREAS_BLOCO1.search(texto)
            if match_areas1:
                privativa, comum, total, equivalente, fracao = match_areas1.groups()
                dados.append({
                    "Formato": "Bloco",
                    "Apartamento": numero,
                    "Tipo": tipo,
                    "Torre/Bloco": bloco,
                    "Área Privativa (m²)": privativa.replace(",", "."),
                    "Área Comum (m²)": comum.replace(",", "."),
                    "Área Total (m²)": total.replace(",", "."),
                    "Fração Ideal (%)": fracao.replace(",", "."),
                    "Área Terreno (m²)": equivalente.replace(",", "."),
                    "Descrição": descricao
                })
    
    return pd.DataFrame(dados)

def extrair_casas_otimizado(doc):
    """Versão otimizada da extração de casas"""
    texto = "\n".join([p.text.strip() for p in doc.paragraphs if p.text.strip()])
    blocos = REGEX_CASA_SPLIT.split(texto)
    casas = [(blocos[i], blocos[i + 1]) for i in range(1, len(blocos), 2)]

    dados = []
    for numero, conteudo in casas:
        area_terreno = REGEX_AREA_TERRENO.search(conteudo)
        area_construida = REGEX_AREA_CONSTRUIDA.search(conteudo)
        area_comum = REGEX_AREA_COMUM.search(conteudo)
        area_total = REGEX_AREA_TOTAL_REAL.search(conteudo)
        fracao = REGEX_FRACAO_IDEAL.search(conteudo)
        
        # Extrair descrição
        idx_frente = conteudo.lower().find('frente')
        idx_ultimo_ponto = conteudo.rfind('.')
        descricao = ""
        if idx_frente != -1 and idx_ultimo_ponto != -1 and idx_ultimo_ponto > idx_frente:
            descricao = conteudo[idx_frente:idx_ultimo_ponto+1].replace('\n', ' ').strip()
        
        dados.append({
            "Número da Casa": numero,
            "Área do Terreno (m²)": area_terreno.group(1) if area_terreno else "",
            "Área Construída (m²)": area_construida.group(1) if area_construida else "",
            "Área Comum Real (m²)": area_comum.group(1) if area_comum else "",
            "Área Total Real (m²)": area_total.group(1) if area_total else "",
            "Fração Ideal": (fracao.group(1) + " %") if fracao else "",
            "Descrição": descricao
        })

    return pd.DataFrame(dados)

def processar_arquivo_otimizado(path):
    """Versão otimizada do processamento de arquivo"""
    try:
        doc = Document(path)
        texto_completo = "\n".join(p.text for p in doc.paragraphs)
        
        tipo = identificar_tipo_documento_otimizado(texto_completo)
        
        if tipo == "torre":
            df = extrair_torre_otimizado(doc)
        elif tipo == "bloco":
            df = extrair_bloco_otimizado(doc)
        elif tipo == "casa":
            df = extrair_casas_otimizado(doc)
        else:
            return None
        
        if df is not None and not df.empty:
            df["Formato"] = tipo
            if "Tipo Documento" in df.columns:
                df = df.drop(columns=["Tipo Documento"])
            return df
        else:
            return None
    except Exception:
        return None

def processar_arquivos_paralelo(arquivos, max_workers=None):
    """Processa múltiplos arquivos em paralelo, otimizando uso de memória."""
    todos_dfs = []
    documentos_processados = []
    if max_workers is None:
        try:
            import multiprocessing
            max_workers = min(4, multiprocessing.cpu_count())
        except Exception:
            max_workers = 2
    with ProcessPoolExecutor(max_workers=max_workers) as executor:
        future_to_arquivo = {executor.submit(processar_arquivo_otimizado, arq): arq for arq in arquivos}
        for future in as_completed(future_to_arquivo):
            arquivo = future_to_arquivo[future]
            try:
                df = future.result()
                if df is not None and not df.empty:
                    todos_dfs.append(df)
                    documentos_processados.append({
                        'filename': os.path.basename(arquivo),
                        'rows_extracted': len(df),
                        'tipo_documento': df['Formato'].iloc[0] if 'Formato' in df.columns else 'desconhecido'
                    })
                else:
                    documentos_processados.append({
                        'filename': os.path.basename(arquivo),
                        'rows_extracted': 0,
                        'error': 'Nenhum dado extraído'
                    })
            except Exception as e:
                documentos_processados.append({
                    'filename': os.path.basename(arquivo),
                    'rows_extracted': 0,
                    'error': str(e)
                })
    if todos_dfs:
        resultado = pd.concat(todos_dfs, ignore_index=True)
        return resultado, documentos_processados
    else:
        return pd.DataFrame(), documentos_processados

def main():
    parser = argparse.ArgumentParser(description="Extrai dados de memorial de incorporação de vários arquivos DOCX (versão otimizada).")
    parser.add_argument('arquivos', nargs='+', help='Caminhos dos arquivos .docx ou diretório contendo arquivos .docx')
    parser.add_argument('-o', '--output', default='dados_memorial_otimizado.xlsx', help='Nome do arquivo Excel de saída')
    parser.add_argument('-w', '--workers', type=int, default=4, help='Número de workers para processamento paralelo')
    args = parser.parse_args()

    # Coletar arquivos
    arquivos = []
    for entrada in args.arquivos:
        if os.path.isdir(entrada):
            arquivos.extend([os.path.join(entrada, f) for f in os.listdir(entrada) if f.lower().endswith('.docx')])
        else:
            arquivos.append(entrada)
    
    if not arquivos:
        print("Nenhum arquivo .docx encontrado.")
        sys.exit(1)

    print(f"🚀 Processando {len(arquivos)} arquivos com {args.workers} workers...")
    start_time = time.time()
    
    # Processar arquivos em paralelo
    resultado, documentos_processados = processar_arquivos_paralelo(arquivos, args.workers)
    
    if not resultado.empty:
        resultado.to_excel(args.output, index=False)
    else:
        print("Nenhum dado extraído dos arquivos informados.")
        sys.exit(1)
    
    end_time = time.time()
    processing_time = end_time - start_time
    
    print(f"\n✅ Extração concluída em {processing_time:.2f}s!")
    print(f"📊 Total de registros: {len(resultado)}")
    print(f"📁 Dados salvos em: {args.output}")

if __name__ == "__main__":
    main() 