/* =============================================
   GERENCIADOR DE POLÍGONOS (LISTA / CONTADOR)
   ============================================= */

function togglePolygonManager() {
    const content = document.getElementById('polygonManagerContent');
    const headerIcon = document.querySelector('.polygon-manager-header .fa-chevron-down');

    if (polygonManagerExpanded) {
        content.classList.add('collapsed');
        headerIcon.style.transform = 'rotate(0deg)';
        polygonManagerExpanded = false;
    } else {
        content.classList.remove('collapsed');
        headerIcon.style.transform = 'rotate(180deg)';
        polygonManagerExpanded = true;
    }
}

function atualizarContadorPoligonos() {
    const polygonCount = document.getElementById('polygonCount');
    polygonCount.textContent = polygons.length;
    polygonCount.style.display = polygons.length === 0 ? 'none' : 'flex';
}

function atualizarListaPoligonos() {
    const select = document.getElementById('poligonoSelecionado');
    select.innerHTML = '<option value="">-- Selecione um polígono --</option>';

    polygons.forEach(polygon => {
        const option = document.createElement('option');
        option.value = polygon.id;
        option.textContent =
            polygon.name + (polygon.type === 'imported' ? ' (Importado)' : ' (Desenhado)');
        select.appendChild(option);
    });
}

function atualizarControlesPoligonos() {
    const polygonControls = document.getElementById('polygon-controls');
    polygonControls.innerHTML = '';

    if (polygons.length === 0) {
        polygonControls.innerHTML =
            '<p style="color:#666;font-style:italic;text-align:center;padding:10px;">Nenhum polígono adicionado</p>';
    } else {
        polygons.forEach(polygon => {
            const controlDiv = document.createElement('div');
            controlDiv.className = 'polygon-control';
            controlDiv.id = `polygon-control-${polygon.id}`;

            if (selectedPolygonIds.includes(polygon.id)) {
                controlDiv.classList.add('selected');
            }

            const toggleText = polygon.visible ? 'Visível' : 'Oculto';
            const toggleClass = polygon.visible ? '' : 'hidden';

            controlDiv.innerHTML = `
                <span class="polygon-name" onclick="selecionarPoligono('${polygon.id}')">${polygon.name}</span>
                <button class="polygon-toggle ${toggleClass}" onclick="togglePoligono('${polygon.id}')">${toggleText}</button>
                <button class="polygon-remove" onclick="removerPoligonoIndividual('${polygon.id}')">×</button>
            `;

            polygonControls.appendChild(controlDiv);
        });
    }

    atualizarContadorPoligonos();
}

function togglePoligono(polygonId) {
    const polygonIndex = polygons.findIndex(p => p.id === polygonId);
    if (polygonIndex === -1) return;

    const polygon = polygons[polygonIndex];
    const button = document.querySelector(`#polygon-control-${polygonId} .polygon-toggle`);

    if (polygon.visible) {
        mapa.removeLayer(polygon.layer);
        button.textContent = 'Oculto';
        button.classList.add('hidden');
        polygon.visible = false;

        polygonLabels
            .filter(label => label.polygonId === polygonId)
            .forEach(labelData => mapa.removeLayer(labelData.layer));
    } else {
        mapa.addLayer(polygon.layer);
        button.textContent = 'Visível';
        button.classList.remove('hidden');
        polygon.visible = true;

        polygonLabels
            .filter(label => label.polygonId === polygonId)
            .forEach(labelData => mapa.addLayer(labelData.layer));

        if (selectedPolygonIds.includes(polygonId)) {
            polygon.layer.setStyle({
                fillColor: 'black',
                fillOpacity: 0.25,
                color: 'transparent',
                weight: 0
            });
        } else if (polygon.type === 'imported') {
            polygon.layer.setStyle({
                fillColor: 'transparent',
                fillOpacity: 0,
                color: 'transparent',
                weight: 0
            });
        }
    }
}

function centralizarNoPoligono(polygonId) {
    const polygon = polygons.find(p => p.id === polygonId);
    if (polygon && polygon.visible) {
        mapa.fitBounds(polygon.layer.getBounds());
    }
}