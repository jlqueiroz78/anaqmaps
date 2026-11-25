/* =============================================
   INICIALIZAÇÃO GERAL E EVENT LISTENERS
   ============================================= */

document.addEventListener('DOMContentLoaded', function () {
    // Atualiza contador inicial
    atualizarContadorPoligonos();

    // Sincronização inicial de títulos
    const initialTitle = document.getElementById('map-title').value;
    const printTitle = document.getElementById('print-title');
    const tituloImpressao = document.getElementById('tituloImpressao');

    if (initialTitle) {
        printTitle.textContent = initialTitle;
        tituloImpressao.value = initialTitle;
    } else {
        printTitle.textContent = 'Título Mapa ...';
        tituloImpressao.value = 'Título Mapa ...';
    }

    // Orientação padrão
    const selectOrientacao = document.getElementById('orientacao');
    if (selectOrientacao) {
        selectOrientacao.value = 'landscape';
        selectOrientacao.addEventListener('change', function (e) {
            sincronizarOrientacaoMoldura(e.target.value);
        });
    }

    // Carregamento inicial das camadas predefinidas (modo silencioso)
    if (typeof carregarCamadasPredefinidas === 'function') {
        carregarCamadasPredefinidas(true);
    }

    // Busca com Enter
    document.getElementById('endereco').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') buscarEndereco();
    });

    // Sincronização em tempo real do título
    document.getElementById('map-title').addEventListener('input', sincronizarTitulo);
    document.getElementById('tituloImpressao').addEventListener('input', sincronizarTituloParaMapa);

    console.log('Aplicação AnaqMaps inicializada com sucesso!');
    console.log('Provedor de tiles: CARTO Positron');
    console.log('Orientação padrão: Paisagem');
    console.log('Sincronização de título ativada');
});