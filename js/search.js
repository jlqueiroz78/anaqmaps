/* =============================================
   BUSCA DE ENDEREÇO (Nominatim / OSM)
   ============================================= */

function buscarEndereco() {
    const endereco = document.getElementById('endereco').value;
    if (!endereco) {
        alert('Por favor, insira um endereço.');
        return;
    }

    const button = event.target.closest('button');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
    button.disabled = true;

    fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&limit=1`,
        { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' } }
    )
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);

                if (marcadorBusca) mapa.removeLayer(marcadorBusca);

                if (circulo && circuloAtivo) {
                    mapa.removeLayer(circulo);
                    circulo = null;
                    circuloAtivo = false;
                    atualizarBotaoCirculo();
                }

                marcadorBusca = L.marker([lat, lon], { draggable: true }).addTo(mapa);
                configurarPopupMarcador(marcadorBusca, true);

                mapa.setView([lat, lon], 17);

                marcadorBusca.on('drag', function () {
                    if (circulo && circuloAtivo) {
                        circulo.setLatLng(marcadorBusca.getLatLng());
                    }
                });

                alert(
                    'Endereço encontrado! O marcador pode ser arrastado e possui opções para remover e ativar círculo.'
                );
            } else {
                alert('Endereço não encontrado.');
            }

            button.innerHTML = originalText;
            button.disabled = false;
        })
        .catch(error => {
            console.error('Erro ao buscar endereço:', error);
            alert('Erro ao buscar endereço. Tente novamente.');
            button.innerHTML = originalText;
            button.disabled = false;
        });
}