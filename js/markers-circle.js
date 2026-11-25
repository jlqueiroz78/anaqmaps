/* =============================================
   MARCADORES E CÍRCULO DE 150m
   ============================================= */

function adicionarMarcador() {
    if (marcador) {
        mapa.removeLayer(marcador);
        if (circulo && circuloAtivo) {
            mapa.removeLayer(circulo);
        }
    }

    alert('Clique no mapa para adicionar um marcador. Pressione ESC para cancelar.');

    const clickHandler = function (e) {
        marcador = L.marker(e.latlng, { draggable: true }).addTo(mapa);
        configurarPopupMarcador(marcador);

        if (circulo && circuloAtivo) {
            circulo.setLatLng(e.latlng);
        }

        mapa.off('click', clickHandler);

        marcador.on('drag', function () {
            if (circulo && circuloAtivo) {
                circulo.setLatLng(marcador.getLatLng());
            }
        });
    };

    mapa.on('click', clickHandler);

    const escHandler = function (e) {
        if (e.key === 'Escape') {
            mapa.off('click', clickHandler);
            document.removeEventListener('keydown', escHandler);
            alert('Modo de adição de marcador cancelado.');
        }
    };

    document.addEventListener('keydown', escHandler);
}

function configurarPopupMarcador(marker, isSearchMarker = false) {
    const popupContent = `
        <div class="marker-popup">
            <b>${isSearchMarker ? 'Marcador de Busca' : 'Marcador'}</b><br>
            <button class="btn-remover" onclick="removerMarcador(${isSearchMarker})">
                <i class="fas fa-trash"></i> Remover Marcador
            </button>
            <button class="btn-circulo" onclick="toggleCirculo()">
                <i class="fas fa-circle"></i> ${circuloAtivo ? 'Desativar' : 'Ativar'} Círculo (250m)
            </button>
            <button class="btn-arrastar" onclick="alternarArrasteMarcador(${isSearchMarker})">
                <i class="fas fa-arrows-alt"></i> ${marker.dragging.enabled() ? 'Desativar' : 'Ativar'} Arraste
            </button>
        </div>
    `;
    marker.bindPopup(popupContent);
}

function removerMarcador(isSearchMarker = false) {
    if (isSearchMarker && marcadorBusca) {
        mapa.removeLayer(marcadorBusca);
        marcadorBusca = null;
    } else if (!isSearchMarker && marcador) {
        mapa.removeLayer(marcador);
        marcador = null;
    }

    if (circulo && circuloAtivo) {
        mapa.removeLayer(circulo);
        circulo = null;
        circuloAtivo = false;
        atualizarBotaoCirculo();
    }
}

function alternarArrasteMarcador(isSearchMarker = false) {
    const marker = isSearchMarker ? marcadorBusca : marcador;
    if (!marker) return;

    if (marker.dragging.enabled()) {
        marker.dragging.disable();
        marker.closePopup();
        marker.bindPopup(`
            <div class="marker-popup">
                <b>${isSearchMarker ? 'Marcador de Busca' : 'Marcador'}</b><br>
                <button class="btn-arrastar" onclick="alternarArrasteMarcador(${isSearchMarker})">
                    <i class="fas fa-arrows-alt"></i> Ativar Arraste
                </button>
            </div>
        `);
        marker.openPopup();
        alert('Arraste do marcador desativado.');
    } else {
        marker.dragging.enable();
        marker.closePopup();
        marker.bindPopup(`
            <div class="marker-popup">
                <b>${isSearchMarker ? 'Marcador de Busca' : 'Marcador'}</b><br>
                <button class="btn-arrastar" onclick="alternarArrasteMarcador(${isSearchMarker})">
                    <i class="fas fa-arrows-alt"></i> Desativar Arraste
                </button>
            </div>
        `);
        marker.openPopup();
        alert('Arraste do marcador ativado. Agora você pode arrastar o marcador.');
    }
}

function toggleCirculo() {
    const currentMarker = marcadorBusca || marcador;
    if (!currentMarker) {
        alert('Adicione um marcador primeiro!');
        return;
    }

    if (!circuloAtivo) {
        const posicao = currentMarker.getLatLng();
        circulo = L.circle(posicao, {
            radius: 150,
            className: 'circle-radius'
        }).addTo(mapa);

        circuloAtivo = true;
        atualizarBotaoCirculo();

        currentMarker.on('drag', function () {
            if (circulo) circulo.setLatLng(currentMarker.getLatLng());
        });
    } else {
        if (circulo) {
            mapa.removeLayer(circulo);
            circulo = null;
        }
        circuloAtivo = false;
        atualizarBotaoCirculo();
    }
}

function atualizarBotaoCirculo() {
    const botao = document.getElementById('btnCirculo');
    if (!botao) return;

    if (circuloAtivo) {
        botao.innerHTML = '<i class="fas fa-times-circle"></i> Desativar Círculo (150m)';
        botao.classList.add('active');
        botao.style.background = '#1a68d1';
    } else {
        botao.innerHTML = '<i class="fas fa-circle"></i> Ativar Círculo (150m)';
        botao.classList.remove('active');
        botao.style.background = '#2F80ED';
    }
}