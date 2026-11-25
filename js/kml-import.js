/* =============================================
   IMPORTAÇÃO KML E GERENCIAMENTO DE CAMADAS
   ============================================= */

function importarKML() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.kml';

    input.onchange = (e) => {
        const arquivo = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const nomeArquivo = arquivo.name;
            const nomeSemExtensao = nomeArquivo.replace('.kml', '');
            const kml = omnivore.kml.parse(event.target.result);

            const layerId = 'kml_' + Date.now();
            kml._kmlLayerId = layerId;

            kml.eachLayer((layer) => {
                let nomeElemento = 'Polígono KML';
                let coordenadas;

                if (layer.feature && layer.feature.properties && layer.feature.properties.name) {
                    nomeElemento = layer.feature.properties.name;
                }

                if (layer.getLatLng) {
                    coordenadas = layer.getLatLng();
                } else if (layer.getBounds) {
                    coordenadas = layer.getBounds().getCenter();
                }

                if (layer instanceof L.Polygon) {
                    const polygonId =
                        layerId + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

                    layer.setStyle({
                        fillColor: 'transparent',
                        fillOpacity: 0,
                        color: 'transparent',
                        weight: 0
                    });

                    layer.polygonId = polygonId;
                    layer._kmlLayerId = layerId;

                    const polygonData = {
                        id: polygonId,
                        layer: layer,
                        name: nomeElemento,
                        type: 'imported',
                        visible: true
                    };

                    polygons.push(polygonData);
                    drawnItems.addLayer(layer);

                    configurarCliquePoligono(layer);

                    importedKmlLayers.push({
                        polygonId: polygonId,
                        layer: layer,
                        name: nomeElemento
                    });

                    if (coordenadas) {
                        const label = criarRotuloCustomizado(coordenadas, nomeElemento, polygonId, true);
                        polygonLabels.push({
                            polygonId: polygonId,
                            layer: label,
                            isKml: true
                        });
                    }

                    layer.bindPopup(`
                        <b>${nomeElemento}</b><br>
                        <em>Polígono KML Importado</em><br>
                        <button onclick="editarRotuloPoligono('${polygonId}')">Editar Rótulo</button>
                        <button onclick="removerPoligonoIndividual('${polygonId}')">Remover Polígono</button>
                    `);

                    if (isDraggingEnabled) {
                        configurarArrastePoligono(layer);
                    }
                }
            });

            mapa.addLayer(kml);

            adicionarControleCamada(layerId, nomeSemExtensao, kml);

            const center = mapa.getBounds().getCenter();
            criarRotuloArquivo(center, nomeSemExtensao, nomeArquivo, false);

            atualizarListaPoligonos();
            atualizarControlesPoligonos();

            alert(
                'Arquivo KML importado com sucesso: ' + nomeSemExtensao +
                '\n\nOs polígonos KML foram importados transparentes. ' +
                'Clique neles para selecionar e visualizar.'
            );
        };

        reader.readAsText(arquivo);
    };

    input.click();
}

function adicionarControleCamada(layerId, nomeCamada, layer, visivel = true) {
    const layerControls = document.getElementById('layer-controls');

    const controlDiv = document.createElement('div');
    controlDiv.className = 'layer-control';
    controlDiv.id = `layer-control-${layerId}`;

    const toggleText = visivel ? 'Visível' : 'Oculta';
    const toggleClass = visivel ? '' : 'hidden';

    controlDiv.innerHTML = `
        <span class="layer-name">${nomeCamada}</span>
        <button class="layer-toggle ${toggleClass}" onclick="toggleCamada('${layerId}')">${toggleText}</button>
        <button class="layer-remove" onclick="removerCamada('${layerId}')">×</button>
    `;

    layerControls.appendChild(controlDiv);

    kmlLayers.push({
        id: layerId,
        name: nomeCamada,
        layer: layer,
        visible: visivel
    });
}

function toggleCamada(layerId) {
    const layerIndex = kmlLayers.findIndex(l => l.id === layerId);
    if (layerIndex === -1) return;

    const layerData = kmlLayers[layerIndex];
    const button = document.querySelector(`#layer-control-${layerId} .layer-toggle`);

    if (layerData.visible) {
        mapa.removeLayer(layerData.layer);
        button.textContent = 'Oculta';
        button.classList.add('hidden');
        layerData.visible = false;

        polygons.forEach(polygon => {
            if (polygon.type === 'imported' && polygon.layer._kmlLayerId === layerId) {
                polygon.visible = false;
                mapa.removeLayer(polygon.layer);

                polygonLabels
                    .filter(label => label.polygonId === polygon.id)
                    .forEach(labelData => mapa.removeLayer(labelData.layer));
            }
        });
    } else {
        mapa.addLayer(layerData.layer);
        button.textContent = 'Visível';
        button.classList.remove('hidden');
        layerData.visible = true;

        polygons.forEach(polygon => {
            if (polygon.type === 'imported' && polygon.layer._kmlLayerId === layerId) {
                polygon.visible = true;
                mapa.addLayer(polygon.layer);

                polygonLabels
                    .filter(label => label.polygonId === polygon.id)
                    .forEach(labelData => mapa.addLayer(labelData.layer));

                if (selectedPolygonIds.includes(polygon.id)) {
                    polygon.layer.setStyle({
                        fillColor: 'black',
                        fillOpacity: 0.25,
                        color: 'transparent',
                        weight: 0
                    });
                } else {
                    polygon.layer.setStyle({
                        fillColor: 'transparent',
                        fillOpacity: 0,
                        color: 'transparent',
                        weight: 0
                    });
                }
            }
        });
    }

    atualizarControlesPoligonos();
}

function removerCamada(layerId) {
    const layerIndex = kmlLayers.findIndex(l => l.id === layerId);
    if (layerIndex === -1) return;

    const layerData = kmlLayers[layerIndex];
    mapa.removeLayer(layerData.layer);

    const polygonsToRemove = polygons.filter(
        p => p.type === 'imported' && p.layer._kmlLayerId === layerId
    );

    polygonsToRemove.forEach(polygon => {
        const labelsParaRemover = polygonLabels.filter(label => label.polygonId === polygon.id);
        labelsParaRemover.forEach(labelData => mapa.removeLayer(labelData.layer));

        polygonLabels = polygonLabels.filter(label => label.polygonId !== polygon.id);
        polygons = polygons.filter(p => p.id !== polygon.id);
        selectedPolygonIds = selectedPolygonIds.filter(id => id !== polygon.id);
    });

    kmlLayers.splice(layerIndex, 1);

    const controlDiv = document.getElementById(`layer-control-${layerId}`);
    if (controlDiv) controlDiv.remove();

    atualizarListaPoligonos();
    atualizarControlesPoligonos();

    alert(`Camada "${layerData.name}" removida com sucesso!`);
}

/* =============================================
   CAMADAS PREDEFINIDAS
   ============================================= */

/**
 * Carrega as camadas KML predefinidas configuradas em CAMADAS_PREDEFINIDAS
 * @param {boolean} silencioso - Se true, não exibe alertas na tela (útil para inicialização automática)
 */
async function carregarCamadasPredefinidas(silencioso = false) {
    if (typeof CAMADAS_PREDEFINIDAS === 'undefined' || !Array.isArray(CAMADAS_PREDEFINIDAS) || CAMADAS_PREDEFINIDAS.length === 0) {
        if (!silencioso) alert('Nenhuma camada predefinida configurada.');
        return;
    }

    let carregadas = 0;
    let erros = 0;

    for (let i = 0; i < CAMADAS_PREDEFINIDAS.length; i++) {
        const camada = CAMADAS_PREDEFINIDAS[i];
        if (!camada.url || camada.url.includes('caminho/para/seu/arquivo')) {
            // Ignora caminhos de exemplo/placeholders
            continue;
        }

        // Verifica se a camada já foi carregada
        const layerId = 'kml_predefinida_' + i;
        if (kmlLayers.some(l => l.id === layerId)) {
            continue;
        }

        try {
            // Normaliza barras invertidas do Windows para barras normais
            let urlNormalizada = camada.url.replace(/\\/g, '/');

            const response = await fetch(urlNormalizada);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} (${response.statusText})`);
            }

            const kmlTexto = await response.text();
            processarKmlPredefinido(kmlTexto, camada, layerId);
            carregadas++;
        } catch (err) {
            console.warn(`[AnaqMaps] Camada predefinida "${camada.nome}" (${camada.url}) não pôde ser carregada:`, err.message);
            erros++;
        }
    }

    if (!silencioso) {
        if (carregadas > 0) {
            alert(`${carregadas} camada(s) predefinida(s) carregada(s) com sucesso!`);
        } else if (erros > 0) {
            alert('Não foi possível carregar as camadas predefinidas automaticamente. Verifique se o caminho do arquivo KML está acessível via servidor web local ou se há restrições de CORS.');
        } else {
            alert('Todas as camadas predefinidas já estão carregadas ou estão configuradas como caminhos de exemplo.');
        }
    }
}

/**
 * Processa o texto KML de uma camada predefinida e a insere no mapa
 */
function processarKmlPredefinido(kmlTexto, camada, layerId) {
    if (!window.omnivore || !window.omnivore.kml) {
        console.error('Biblioteca Leaflet Omnivore não carregada.');
        return;
    }

    const kml = omnivore.kml.parse(kmlTexto);
    kml._kmlLayerId = layerId;

    const corCamada = camada.cor || '#2F80ED';
    const visivelInicial = camada.visivel !== false;

    kml.eachLayer((layer) => {
        let nomeElemento = camada.nome;
        let coordenadas;

        if (layer.feature && layer.feature.properties && layer.feature.properties.name) {
            nomeElemento = layer.feature.properties.name;
        }

        if (layer.getLatLng) {
            coordenadas = layer.getLatLng();
        } else if (layer.getBounds) {
            coordenadas = layer.getBounds().getCenter();
        }

        if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
            const polygonId = layerId + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

            layer.setStyle({
                color: corCamada,
                fillColor: corCamada,
                fillOpacity: visivelInicial ? 0.25 : 0,
                weight: 2
            });

            layer.polygonId = polygonId;
            layer._kmlLayerId = layerId;

            const polygonData = {
                id: polygonId,
                layer: layer,
                name: nomeElemento,
                type: 'imported',
                visible: visivelInicial,
                cor: corCamada
            };

            polygons.push(polygonData);
            drawnItems.addLayer(layer);

            configurarCliquePoligono(layer);

            importedKmlLayers.push({
                polygonId: polygonId,
                layer: layer,
                name: nomeElemento
            });

            if (coordenadas) {
                const label = criarRotuloCustomizado(coordenadas, nomeElemento, polygonId, true);
                polygonLabels.push({
                    polygonId: polygonId,
                    layer: label,
                    isKml: true
                });
            }

            layer.bindPopup(`
                <b>${nomeElemento}</b><br>
                <small style="color: #666;">Camada: ${camada.nome}</small><br>
                <button onclick="editarRotuloPoligono('${polygonId}')">Editar Rótulo</button>
                <button onclick="removerPoligonoIndividual('${polygonId}')">Remover Polígono</button>
            `);

            if (isDraggingEnabled) {
                configurarArrastePoligono(layer);
            }
        }
    });

    if (visivelInicial) {
        mapa.addLayer(kml);
    }

    adicionarControleCamada(layerId, camada.nome, kml, visivelInicial);

    try {
        const bounds = kml.getBounds();
        if (bounds && bounds.isValid()) {
            const center = bounds.getCenter();
            criarRotuloArquivo(center, camada.nome, camada.nome, false);
        }
    } catch (e) {}

    atualizarListaPoligonos();
    atualizarControlesPoligonos();
    atualizarContadorPoligonos();
}