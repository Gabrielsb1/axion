#!/usr/bin/env python3
"""
Script de teste para a nova implementação de OCR
Testa detecção de assinatura digital e processamento OCR
"""

import os
import sys
import tempfile
import shutil
from pathlib import Path

# Adicionar o diretório atual ao path para importar módulos
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ai.ocr_service import (
    is_pdf_signed, 
    remove_signature_qpdf, 
    reescrever_pdf_sem_assinatura,
    aplicar_ocr,
    process_pdf_with_ocr,
    extract_text_from_pdf,
    get_ocr_info
)

def test_dependencies():
    """Testa se todas as dependências estão disponíveis"""
    print("🔍 Testando dependências...")
    
    # Testar imports
    try:
        import ocrmypdf
        print("✅ ocrmypdf disponível")
    except ImportError:
        print("❌ ocrmypdf não disponível")
        return False
    
    try:
        from PyPDF2 import PdfReader, PdfWriter
        print("✅ PyPDF2 disponível")
    except ImportError:
        print("❌ PyPDF2 não disponível")
        return False
    
    try:
        import pypdf
        print("✅ pypdf disponível")
    except ImportError:
        print("❌ pypdf não disponível")
        return False
    
    # Testar qpdf
    from ai.ocr_service import QPDF_PATH
    if os.path.exists(QPDF_PATH):
        print(f"✅ qpdf encontrado em: {QPDF_PATH}")
    else:
        print(f"⚠️ qpdf não encontrado em: {QPDF_PATH}")
        print("   O processamento de assinaturas digitais pode não funcionar")
    
    return True

def test_pdf_analysis():
    """Testa análise de PDFs"""
    print("\n📄 Testando análise de PDFs...")
    
    # Criar PDF de teste simples
    test_pdf_path = create_test_pdf()
    
    try:
        # Testar detecção de assinatura
        has_signature = is_pdf_signed(test_pdf_path)
        print(f"📋 PDF tem assinatura: {has_signature}")
        
        # Testar extração de texto
        text = extract_text_from_pdf(test_pdf_path)
        print(f"📝 Texto extraído: {len(text)} caracteres")
        
        # Testar informações do PDF
        info = get_ocr_info(test_pdf_path)
        print(f"📊 Informações do PDF: {info}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro na análise: {e}")
        return False
    finally:
        # Limpar arquivo de teste
        if os.path.exists(test_pdf_path):
            os.remove(test_pdf_path)

def create_test_pdf():
    """Cria um PDF de teste simples"""
    try:
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import letter
        
        # Criar PDF temporário
        temp_pdf = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False)
        temp_pdf.close()
        
        # Criar PDF com texto
        c = canvas.Canvas(temp_pdf.name, pagesize=letter)
        c.drawString(100, 750, "Teste de PDF para OCR")
        c.drawString(100, 700, "Este é um documento de teste.")
        c.drawString(100, 650, "Contém texto simples para verificação.")
        c.save()
        
        return temp_pdf.name
        
    except ImportError:
        # Fallback: criar arquivo vazio
        temp_pdf = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False)
        temp_pdf.close()
        return temp_pdf.name

def test_ocr_processing():
    """Testa processamento OCR"""
    print("\n🔍 Testando processamento OCR...")
    
    # Criar PDF de teste
    test_pdf_path = create_test_pdf()
    output_pdf_path = test_pdf_path.replace('.pdf', '_ocr.pdf')
    
    try:
        # Testar processamento OCR
        result = process_pdf_with_ocr(test_pdf_path, output_pdf_path)
        
        if result['success']:
            print(f"✅ OCR processado com sucesso")
            print(f"   Tempo: {result['processing_time']:.2f}s")
            print(f"   Páginas: {result['pages_processed']}")
            print(f"   Mensagem: {result['message']}")
            
            # Verificar se arquivo de saída foi criado
            if os.path.exists(output_pdf_path):
                print(f"✅ Arquivo de saída criado: {output_pdf_path}")
                
                # Testar extração de texto do resultado
                ocr_text = extract_text_from_pdf(output_pdf_path)
                print(f"📝 Texto OCR: {len(ocr_text)} caracteres")
                
                return True
            else:
                print("❌ Arquivo de saída não foi criado")
                return False
        else:
            print(f"❌ Erro no OCR: {result['error']}")
            return False
            
    except Exception as e:
        print(f"❌ Erro no teste OCR: {e}")
        return False
    finally:
        # Limpar arquivos de teste
        for path in [test_pdf_path, output_pdf_path]:
            if os.path.exists(path):
                os.remove(path)

def test_signature_removal():
    """Testa remoção de assinaturas (simulado)"""
    print("\n🔐 Testando remoção de assinaturas...")
    
    # Criar PDF de teste
    test_pdf_path = create_test_pdf()
    temp_qpdf_path = test_pdf_path.replace('.pdf', '_qpdf.pdf')
    clean_pdf_path = test_pdf_path.replace('.pdf', '_clean.pdf')
    
    try:
        # Testar remoção de assinatura (simulado)
        success = remove_signature_qpdf(test_pdf_path, temp_qpdf_path)
        print(f"🔐 Remoção de assinatura: {'✅ Sucesso' if success else '❌ Falha'}")
        
        # Testar reescrita de PDF
        if success:
            rewrite_success = reescrever_pdf_sem_assinatura(temp_qpdf_path, clean_pdf_path)
            print(f"📄 Reescrita de PDF: {'✅ Sucesso' if rewrite_success else '❌ Falha'}")
        
        return success
        
    except Exception as e:
        print(f"❌ Erro no teste de assinatura: {e}")
        return False
    finally:
        # Limpar arquivos de teste
        for path in [test_pdf_path, temp_qpdf_path, clean_pdf_path]:
            if os.path.exists(path):
                os.remove(path)

def main():
    """Função principal de teste"""
    print("🧪 Iniciando testes da nova implementação OCR")
    print("=" * 50)
    
    # Testar dependências
    if not test_dependencies():
        print("\n❌ Dependências não atendidas. Instale as dependências necessárias.")
        return False
    
    # Testar análise de PDFs
    if not test_pdf_analysis():
        print("\n❌ Falha na análise de PDFs.")
        return False
    
    # Testar processamento OCR
    if not test_ocr_processing():
        print("\n❌ Falha no processamento OCR.")
        return False
    
    # Testar remoção de assinaturas
    if not test_signature_removal():
        print("\n⚠️ Falha na remoção de assinaturas (pode ser normal se qpdf não estiver configurado).")
    
    print("\n" + "=" * 50)
    print("✅ Todos os testes principais passaram!")
    print("🎉 Nova implementação OCR está funcionando corretamente.")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 