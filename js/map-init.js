/* =============================================
   INICIALIZAÇÃO DO MAPA E CONTROLES
   ============================================= */

// Mapa base
const mapa = L.map('map').setView([-23.5664559, -46.5776674], 17);

async function inicializarCamadaBase() {     
   
        L.tileLayer(
            `https://maps.geoapify.com/v1/tile/osm-bright-grey/{z}/{x}/{y}.png?apiKey=ab3f94f3df1c44b88c3777a7a6b2f98a`,
            {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ' +
                    'contributors &copy; <a href="https://www.geoapify.com/">Geoapify</a> | &copy; AnaqMaps',
                subdomains: 'abcd',
                maxZoom: 20,
                minZoom: 0
            }
        ).addTo(mapa);
    } 

inicializarCamadaBase();

// Grupo de features desenhadas
drawnItems = new L.FeatureGroup();
mapa.addLayer(drawnItems);

// Controle de desenho
configurarIdiomaLeafletDraw();

drawControl = new L.Control.Draw({
    position: 'topleft',
    draw: {
        polygon: defaultPolygonDrawOptions,
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false
    },
    edit: {
        featureGroup: drawnItems,
        remove: true
    }
});
mapa.addControl(drawControl);

// Controle de escala
L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(mapa);

/* =============================================
   EVENTOS DO LEAFLET DRAW
   ============================================= */

// Polígono criado
mapa.on(L.Draw.Event.CREATED, function (e) {
    const layer = e.layer;
    drawnItems.addLayer(layer);

    const polygonId = 'polygon_' + Date.now();
    layer.polygonId = polygonId;

    const polygonData = {
        id: polygonId,
        layer: layer,
        name: 'Polígono ' + (polygons.length + 1),
        type: 'drawn',
        visible: true
    };

    polygons.push(polygonData);

    configurarCliquePoligono(layer);

    if (isDraggingEnabled) {
        configurarArrastePoligono(layer);
    }

    layer.bindPopup(`
        <div style="text-align: center;">
            <b>${polygonData.name}</b><br>
            <small style="color: #666;">Polígono Desenhado</small><br><br>
            <button onclick="adicionarRotuloParaPoligono('${polygonId}')">Adicionar/Editar Rótulo</button>
            <button onclick="removerPoligonoIndividual('${polygonId}')">Remover Polígono</button>
        </div>
    `);

    // Resetar botão
    polygonDrawer = null;
    const btn = document.getElementById('btnDesenharPoligono') || document.querySelector('.tool-btn.draw');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-draw-polygon"></i> Desenhar Polígono';
        btn.classList.remove('active');
    }

    atualizarListaPoligonos();
    atualizarControlesPoligonos();
    atualizarContadorPoligonos();

    const select = document.getElementById('poligonoSelecionado');
    if (select) select.value = polygonId;
});

// Desenho interrompido/cancelado
mapa.on(L.Draw.Event.DRAWSTOP, function () {
    polygonDrawer = null;
    const btn = document.getElementById('btnDesenharPoligono') || document.querySelector('.tool-btn.draw');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-draw-polygon"></i> Desenhar Polígono';
        btn.classList.remove('active');
    }
});

// Polígonos removidos via ferramenta de edição
mapa.on(L.Draw.Event.DELETED, function (e) {
    const layers = e.layers;
    layers.eachLayer(function (layer) {
        if (layer.polygonId) {
            const polygonId = layer.polygonId;
            polygons = polygons.filter(p => p.id !== polygonId);
            selectedPolygonIds = selectedPolygonIds.filter(id => id !== polygonId);

            const labelsParaRemover = polygonLabels.filter(label => label.polygonId === polygonId);
            labelsParaRemover.forEach(labelData => {
                mapa.removeLayer(labelData.layer);
            });
            polygonLabels = polygonLabels.filter(label => label.polygonId !== polygonId);
        }
    });
    atualizarListaPoligonos();
    atualizarControlesPoligonos();
    atualizarContadorPoligonos();
    atualizarTransparenciaRotulos();
});

// Polígonos editados
mapa.on(L.Draw.Event.EDITED, function (e) {
    const layers = e.layers;
    layers.eachLayer(function (layer) {
        if (layer.polygonId) {
            atualizarRotuloPoligono(layer.polygonId);
        }
    });
});