/* =============================================
   SINCRONIZAÇÃO DE TÍTULOS (MAPA ↔ IMPRESSÃO)
   ============================================= */

function sincronizarTitulo() {
    const tituloMapa = document.getElementById('map-title').value;
    const tituloImpressao = document.getElementById('tituloImpressao');
    const printTitle = document.getElementById('print-title');

    tituloImpressao.value = tituloMapa;
    printTitle.textContent = tituloMapa || 'Mapa AnaqMaps';
}

function sincronizarTituloParaMapa() {
    const tituloImpressao = document.getElementById('tituloImpressao').value;
    const tituloMapa = document.getElementById('map-title');
    const printTitle = document.getElementById('print-title');

    tituloMapa.value = tituloImpressao;
    printTitle.textContent = tituloImpressao || 'Mapa AnaqMaps';
}