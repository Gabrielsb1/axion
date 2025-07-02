// api.js - Funções de comunicação com o backend

export async function processFileAPI(formData) {
    const response = await fetch(`${window.CONFIG.API_BASE_URL}/api/process-file`, {
        method: 'POST',
        body: formData
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
    }
    return response.json();
}

export async function processOCRTraditional(formData) {
    const response = await fetch(`${window.CONFIG.API_BASE_URL}/api/ocr-traditional`, {
        method: 'POST',
        body: formData
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
    }
    return response.json();
}

export async function processOCRTesseract(formData) {
    const response = await fetch(`${window.CONFIG.API_BASE_URL}/api/ocr-tesseract`, {
        method: 'POST',
        body: formData
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
    }
    return response.json();
}

export async function downloadTextAPI(params) {
    const response = await fetch(`${window.CONFIG.API_BASE_URL}/api/download-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
    }
    return response.json();
}

export async function generateDocumentsAPI(params) {
    const response = await fetch(`${window.CONFIG.API_BASE_URL}/api/generate-documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    });
    if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
    }
    return response.json();
} 