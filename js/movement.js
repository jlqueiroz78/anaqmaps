/* =============================================
   MOVIMENTO DE POLÍGONOS E RÓTULOS
   ============================================= */

function configurarArrastePoligono(layer) {
    layer.options.interactive = true;

    let isDragging = false;
    let startLatLng;

    layer.on('mousedown', function (e) {
        isDragging = true;
        startLatLng = e.latlng;
        mapa.dragging.disable();
    });

    layer.on('mousemove', function (e) {
        if (!isDragging) return;

        const deltaLat = e.latlng.lat - startLatLng.lat;
        const deltaLng = e.latlng.lng - startLatLng.lng;

        const newLatLngs = layer.getLatLngs()[0].map(latlng =>
            L.latLng(latlng.lat + deltaLat, latlng.lng + deltaLng)
        );

        layer.setLatLngs([newLatLngs]);
        startLatLng = e.latlng;

        if (layer.polygonId) {
            atualizarRotuloPoligono(layer.polygonId);
        }
    });

    layer.on('mouseup', function () {
        isDragging = false;
        mapa.dragging.enable();
    });

    layer.getElement().style.cursor = 'move';
}

function atualizarRotuloPoligono(polygonId) {
    const labelsAssociados = polygonLabels.filter(label => label.polygonId === polygonId);
    if (labelsAssociados.length === 0) return;

    const polygon = polygons.find(p => p.id === polygonId);
    if (!polygon) return;

    const center = polygon.layer.getBounds().getCenter();
    labelsAssociados.forEach(labelData => {
        labelData.layer.setLatLng(center);
    });
}

function toggleArrastePoligonos() {
    const botao = document.getElementById('btnToggleArraste');
    isDraggingEnabled = !isDraggingEnabled;

    if (isDraggingEnabled) {
        polygons.forEach(polygon => {
            if (polygon.visible) configurarArrastePoligono(polygon.layer);
        });
        botao.innerHTML = '<i class="fas fa-times"></i> Desativar Movimento de Polígonos';
        botao.setAttribute('data-arrastando', 'true');
        alert('Movimento dos polígonos ativado. Clique e arraste os polígonos para mover.');
    } else {
        polygons.forEach(polygon => {
            polygon.layer.off('mousedown');
            polygon.layer.off('mousemove');
            polygon.layer.off('mouseup');
            if (polygon.layer.getElement()) polygon.layer.getElement().style.cursor = '';
        });
        botao.innerHTML = '<i class="fas fa-arrows-alt"></i> Ativar Movimento de Polígonos';
        botao.setAttribute('data-arrastando', 'false');
        alert('Movimento dos polígonos desativado.');
    }
}

function toggleArrasteRotulos() {
    const botao = document.getElementById('btnToggleRotulo');
    isLabelDraggingEnabled = !isLabelDraggingEnabled;

    if (isLabelDraggingEnabled) {
        polygonLabels.forEach(labelData => {
            const polygon = polygons.find(p => p.id === labelData.polygonId);
            if (polygon && polygon.visible) labelData.layer.dragging.enable();
        });

        fileLabels.forEach(fileLabel => {
            fileLabel.layer.dragging.enable();
        });

        botao.innerHTML = '<i class="fas fa-times"></i> Desativar Movimento de Rótulos';
        botao.setAttribute('data-arrastando', 'true');
        alert('Movimento dos rótulos ativado. Agora você pode arrastar todos os rótulos livremente!');
    } else {
        polygonLabels.forEach(labelData => {
            labelData.layer.dragging.disable();
        });

        fileLabels.forEach(fileLabel => {
            fileLabel.layer.dragging.disable();
        });

        botao.innerHTML = '<i class="fas fa-text-width"></i> Ativar Movimento de Rótulos';
        botao.setAttribute('data-arrastando', 'false');
        alert('Movimento dos rótulos desativado.');
    }
}