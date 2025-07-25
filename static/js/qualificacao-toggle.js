// Função para controlar expansão/contração das justificativas detalhadas
function toggleJustificativa(itemId) {
    const resumidaElement = document.getElementById(`resumida_${itemId}`);
    const detalhadaElement = document.getElementById(`detalhada_${itemId}`);
    
    if (!resumidaElement || !detalhadaElement) {
        console.error(`Elementos de justificativa não encontrados para item: ${itemId}`);
        return;
    }
    
    // Alternar visibilidade
    const isExpanded = !detalhadaElement.classList.contains('d-none');
    
    if (isExpanded) {
        // Contrair - mostrar resumida, esconder detalhada
        resumidaElement.classList.remove('d-none');
        detalhadaElement.classList.add('d-none');
    } else {
        // Expandir - esconder resumida, mostrar detalhada
        resumidaElement.classList.add('d-none');
        detalhadaElement.classList.remove('d-none');
    }
    
    console.log(`📖 Justificativa ${itemId} ${isExpanded ? 'contraída' : 'expandida'}`);
}

// Tornar função global
window.toggleJustificativa = toggleJustificativa;
