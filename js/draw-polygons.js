/* =============================================
   DESENHO, SELEÇÃO E EDIÇÃO DE POLÍGONOS
   ============================================= */

// Ativa/desativa modo de desenho de polígonos
function ativarDesenhoPoligono() {
    const btn = document.getElementById('btnDesenharPoligono') || document.querySelector('.tool-btn.draw');

    if (polygonDrawer && polygonDrawer._enabled) {
        polygonDrawer.disable();
        polygonDrawer = null;
        if (btn) {
            btn.innerHTML = '<i class="fas fa-draw-polygon"></i> Desenhar Polígono';
            btn.classList.remove('active');
        }
        return;
    }

    polygonDrawer = new L.Draw.Polygon(mapa, defaultPolygonDrawOptions);
    polygonDrawer.enable();

    if (btn) {
        btn.innerHTML = '<i class="fas fa-times"></i> Cancelar Desenho';
        btn.classList.add('active');
    }
}

// Configura clique em um polígono para seleção
function configurarCliquePoligono(layer) {
    layer.on('click', function () {
        selecionarPoligono(layer.polygonId);
    });
}

// Alterna a seleção de um polígono
function selecionarPoligono(polygonId) {
    const polygon = polygons.find(p => p.id === polygonId);
    if (!polygon) return;

    const index = selectedPolygonIds.indexOf(polygonId);

    if (index === -1) {
        selectedPolygonIds.push(polygonId);

        polygon.layer.setStyle({
            fillColor: 'black',
            fillOpacity: 0.25,
            color: 'transparent',
            weight: 0
        });

        const labelsAssociados = polygonLabels.filter(label => label.polygonId === polygonId);
        labelsAssociados.forEach(labelData => {
            labelData.layer.getElement().classList.add('visible');
        });
    } else {
        selectedPolygonIds.splice(index, 1);

        if (polygon.type === 'imported') {
            polygon.layer.setStyle({
                fillColor: 'transparent',
                fillOpacity: 0,
                color: 'transparent',
                weight: 0
            });
        } else {
            polygon.layer.setStyle({
                fillColor: '#808070',
                fillOpacity: 0.25,
                color: '#808070',
                weight: 2
            });
        }

        const labelsAssociados = polygonLabels.filter(label => label.polygonId === polygonId);
        labelsAssociados.forEach(labelData => {
            labelData.layer.getElement().classList.remove('visible');
        });
    }

    atualizarControlesPoligonos();
    atualizarTransparenciaRotulos();
}

// Remove um polígono individualmente
function removerPoligonoIndividual(polygonId) {
    const polygonIndex = polygons.findIndex(p => p.id === polygonId);
    if (polygonIndex === -1) return;

    const polygon = polygons[polygonIndex];

    mapa.removeLayer(polygon.layer);

    const labelsParaRemover = polygonLabels.filter(label => label.polygonId === polygonId);
    labelsParaRemover.forEach(labelData => {
        mapa.removeLayer(labelData.layer);
    });

    polygonLabels = polygonLabels.filter(label => label.polygonId !== polygonId);
    polygons.splice(polygonIndex, 1);
    selectedPolygonIds = selectedPolygonIds.filter(id => id !== polygonId);

    atualizarListaPoligonos();
    atualizarControlesPoligonos();
    atualizarTransparenciaRotulos();

    alert('Polígono removido: ' + polygon.name);
}