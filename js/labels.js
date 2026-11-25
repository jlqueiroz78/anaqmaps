/* =============================================
   CRIAÇÃO E GERENCIAMENTO DE RÓTULOS
   ============================================= */

// Mostra/oculta painel de opções de rótulo
function toggleLabelOptions() {
    const labelOptions = document.getElementById('labelOptions');
    if (labelOptions.style.display === 'block') {
        labelOptions.style.display = 'none';
    } else {
        labelOptions.style.display = 'block';
        atualizarListaPoligonos();
    }
}

// Aplica rótulo pelo painel
function adicionarRotulo() {
    const polygonId = document.getElementById('poligonoSelecionado').value;
    const nome = document.getElementById('nomePoligono').value;

    if (!polygonId) {
        alert('Por favor, selecione um polígono.');
        return;
    }

    if (!nome) {
        alert('Por favor, digite um nome para o polígono.');
        return;
    }

    adicionarRotuloParaPoligono(polygonId, nome);

    document.getElementById('nomePoligono').value = '';
    document.getElementById('poligonoSelecionado').value = '';
}

// Cria/edita rótulo de um polígono
function adicionarRotuloParaPoligono(polygonId, nome) {
    const polygon = polygons.find(p => p.id === polygonId);
    if (!polygon) {
        alert('Polígono não encontrado.');
        return;
    }

    const existingLabelIndex = polygonLabels.findIndex(label => label.polygonId === polygonId);

    if (existingLabelIndex !== -1) {
        if (confirm('Este polígono já tem um rótulo. Deseja editar o rótulo existente?')) {
            const novoNome = prompt('Digite o novo nome para o rótulo:', nome || polygon.name);
            if (novoNome) {
                polygon.name = novoNome;

                const labelData = polygonLabels[existingLabelIndex];
                mapa.removeLayer(labelData.layer);

                const labelPos = labelData.layer.getLatLng();
                const newLabel = criarRotuloCustomizado(
                    labelPos,
                    novoNome,
                    polygonId,
                    polygon.type === 'imported'
                );

                polygonLabels[existingLabelIndex] = {
                    polygonId: polygonId,
                    layer: newLabel,
                    isKml: polygon.type === 'imported'
                };

                atualizarListaPoligonos();
                atualizarControlesPoligonos();
                atualizarTransparenciaRotulos();
                alert('Rótulo atualizado com sucesso!');
            }
        }
    } else {
        const novoNome = nome || prompt('Digite o nome para o rótulo:', polygon.name);
        if (novoNome) {
            polygon.name = novoNome;

            const bounds = polygon.layer.getBounds();
            const center = bounds.getCenter();

            const label = criarRotuloCustomizado(
                center,
                novoNome,
                polygonId,
                polygon.type === 'imported'
            );

            polygonLabels.push({
                polygonId: polygonId,
                layer: label,
                isKml: polygon.type === 'imported'
            });

            atualizarListaPoligonos();
            atualizarControlesPoligonos();
            atualizarTransparenciaRotulos();
            alert('Rótulo adicionado com sucesso!');
        }
    }
}

// Calcula tamanho do rótulo com base no texto
function calcularTamanhoRotulo(texto) {
    const larguraMinima = 100;
    const alturaMinima = 35;
    const comprimentoTexto = texto.length;

    let largura = larguraMinima;
    if (comprimentoTexto > 15) {
        largura = larguraMinima + (comprimentoTexto - 15) * 8;
    }
    largura = Math.min(largura, 400);

    return { largura, altura: alturaMinima };
}

// Cria rótulo customizado (polígono desenhado ou KML)
function criarRotuloCustomizado(latlng, texto, polygonId, isKml = false) {
    const className = isKml ? 'kml-label' : 'custom-label';
    const tamanho = calcularTamanhoRotulo(texto);

    const labelDiv = L.divIcon({
        className: className,
        html: `<div style="width: ${tamanho.largura}px; height: ${tamanho.altura}px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">${texto}</div>`,
        iconSize: [tamanho.largura, tamanho.altura],
        iconAnchor: [tamanho.largura / 2, tamanho.altura / 2]
    });

    const marker = L.marker(latlng, {
        icon: labelDiv,
        draggable: true
    }).addTo(mapa);

    marker.polygonId = polygonId;
    marker.isKmlLabel = isKml;
    marker.texto = texto;
    marker.tamanho = tamanho;

    if (!selectedPolygonIds.includes(polygonId)) {
        marker.getElement().classList.remove('visible');
    } else {
        marker.getElement().classList.add('visible');
    }

    marker.on('dragstart', function () {
        this.getElement().classList.add('dragging');
        this.getElement().classList.add('visible');
    });

    marker.on('dragend', function () {
        this.getElement().classList.remove('dragging');
        if (!selectedPolygonIds.includes(polygonId)) {
            this.getElement().classList.remove('visible');
        }
    });

    let popupContent = `
        <b>${texto}</b><br>
        <em>Rótulo ${isKml ? 'KML' : 'do polígono'}</em><br>
        <button onclick="editarRotuloPoligono('${polygonId}')">Editar Rótulo</button>
        <button onclick="removerRotulo('${polygonId}')">Remover Rótulo</button>
    `;

    if (!isKml) {
        popupContent += `<button onclick="centralizarRotulo('${polygonId}')">Centralizar no Polígono</button>`;
    }

    marker.bindPopup(popupContent);
    return marker;
}

// Edita um rótulo existente
function editarRotuloPoligono(polygonId) {
    const labelIndex = polygonLabels.findIndex(label => label.polygonId === polygonId);
    if (labelIndex === -1) return;

    const labelData = polygonLabels[labelIndex];
    const novoTexto = prompt('Digite o novo texto para o rótulo:', labelData.layer.texto);

    if (novoTexto && novoTexto.trim() !== '') {
        mapa.removeLayer(labelData.layer);

        const polygon = polygons.find(p => p.id === polygonId);
        const center = polygon ? polygon.layer.getBounds().getCenter() : labelData.layer.getLatLng();

        const novoRotulo = criarRotuloCustomizado(center, novoTexto.trim(), polygonId, labelData.isKml);

        polygonLabels[labelIndex] = {
            polygonId: polygonId,
            layer: novoRotulo,
            isKml: labelData.isKml
        };

        if (polygon) {
            polygon.name = novoTexto.trim();
            atualizarControlesPoligonos();
        }

        if (selectedPolygonIds.includes(polygonId)) {
            novoRotulo.getElement().classList.add('visible');
        }
    }
}

// Remove rótulo de um polígono
function removerRotulo(polygonId) {
    const labelsParaRemover = polygonLabels.filter(label => label.polygonId === polygonId);
    if (labelsParaRemover.length === 0) {
        alert('Este polígono não possui um rótulo.');
        return;
    }
    if (!confirm('Tem certeza que deseja remover o rótulo deste polígono?')) return;

    labelsParaRemover.forEach(labelData => {
        mapa.removeLayer(labelData.layer);
    });

    polygonLabels = polygonLabels.filter(label => label.polygonId !== polygonId);

    const polygon = polygons.find(p => p.id === polygonId);
    if (polygon) {
        polygon.name = polygon.type === 'imported'
            ? (polygon.layer.feature?.properties?.name || 'Polígono KML')
            : 'Polígono ' + (polygons.findIndex(p => p.id === polygonId) + 1);
    }

    atualizarListaPoligonos();
    atualizarControlesPoligonos();
    alert('Rótulo removido com sucesso!');
}

// Centraliza rótulo no centro do polígono
function centralizarRotulo(polygonId) {
    const labelsAssociados = polygonLabels.filter(label => label.polygonId === polygonId);
    if (labelsAssociados.length === 0) return;

    const polygon = polygons.find(p => p.id === polygonId);
    if (!polygon) return;

    const center = polygon.layer.getBounds().getCenter();
    labelsAssociados.forEach(labelData => {
        labelData.layer.setLatLng(center);
    });
}

// Aplica transparência conforme seleção
function atualizarTransparenciaRotulos() {
    polygonLabels.forEach(labelData => {
        const labelElement = labelData.layer.getElement();
        const labelMarker = labelData.layer;

        if (selectedPolygonIds.includes(labelData.polygonId)) {
            if (labelData.isKml) {
                labelElement.classList.remove('transparent');
                labelElement.classList.add('visible');
                labelElement.style.opacity = '1';
                labelElement.style.visibility = 'visible';
                labelMarker.setOpacity(1);
            } else {
                labelElement.classList.remove('transparent');
            }
        } else {
            if (labelData.isKml) {
                labelElement.classList.remove('visible');
                labelElement.style.opacity = '0';
                labelElement.style.visibility = 'hidden';
                labelMarker.setOpacity(0);
            } else {
                labelElement.classList.add('transparent');
            }
        }
    });
}

/* =============================================
   RÓTULOS DE ARQUIVO (KML IMPORTADO)
   ============================================= */

function criarRotuloArquivo(latlng, nomeArquivo, fileName, isVisible = false) {
    const tamanho = calcularTamanhoRotulo(nomeArquivo);

    const labelDiv = L.divIcon({
        className: 'file-label',
        html: `<div style="width: ${tamanho.largura}px; height: ${tamanho.altura}px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">${nomeArquivo}</div>`,
        iconSize: [tamanho.largura, tamanho.altura],
        iconAnchor: [tamanho.largura / 2, tamanho.altura / 2]
    });

    const marker = L.marker(latlng, { icon: labelDiv, draggable: true }).addTo(mapa);

    marker.fileName = fileName;
    marker.nomeArquivo = nomeArquivo;
    marker.tamanho = tamanho;

    if (isVisible) {
        marker.getElement().classList.add('visible');
    }

    marker.on('dragstart', function () {
        this.getElement().classList.add('dragging');
        this.getElement().classList.add('visible');
    });

    marker.on('dragend', function () {
        this.getElement().classList.remove('dragging');
        if (!this.selected) {
            this.getElement().classList.remove('visible');
        }
    });

    marker.bindPopup(`
        <b>${nomeArquivo}</b><br>
        <em>Arquivo: ${fileName}</em><br>
        <button onclick="toggleVisibilidadeRotuloArquivo('${fileName}')">${isVisible ? 'Ocultar' : 'Mostrar'} Rótulo</button>
        <button onclick="removerRotuloArquivo('${fileName}')">Remover Rótulo</button>
        <button onclick="editarNomeRotuloArquivo('${fileName}')">Editar Nome</button>
    `);

    fileLabels.push({
        fileName: fileName,
        nomeArquivo: nomeArquivo,
        layer: marker,
        selected: false,
        tamanho: tamanho
    });

    return marker;
}

function editarNomeRotuloArquivo(fileName) {
    const fileLabel = fileLabels.find(label => label.fileName === fileName);
    if (!fileLabel) return;

    const novoNome = prompt('Digite o novo nome para o rótulo:', fileLabel.nomeArquivo);
    if (!novoNome || novoNome.trim() === '') return;

    fileLabel.nomeArquivo = novoNome.trim();
    const novoTamanho = calcularTamanhoRotulo(fileLabel.nomeArquivo);
    fileLabel.tamanho = novoTamanho;

    const novoIcone = L.divIcon({
        className: 'file-label',
        html: `<div style="width: ${novoTamanho.largura}px; height: ${novoTamanho.altura}px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">${fileLabel.nomeArquivo}</div>`,
        iconSize: [novoTamanho.largura, novoTamanho.altura],
        iconAnchor: [novoTamanho.largura / 2, novoTamanho.altura / 2]
    });

    const marker = fileLabel.layer;
    marker.setIcon(novoIcone);

    marker.bindPopup(`
        <b>${fileLabel.nomeArquivo}</b><br>
        <em>Arquivo: ${fileName}</em><br>
        <button onclick="toggleVisibilidadeRotuloArquivo('${fileName}')">${marker.getElement().classList.contains('visible') ? 'Ocultar' : 'Mostrar'} Rótulo</button>
        <button onclick="removerRotuloArquivo('${fileName}')">Remover Rótulo</button>
        <button onclick="editarNomeRotuloArquivo('${fileName}')">Editar Nome</button>
    `);

    if (marker.getElement().classList.contains('visible')) {
        marker.getElement().classList.add('visible');
    }
}

function toggleVisibilidadeRotuloArquivo(fileName) {
    const fileLabel = fileLabels.find(label => label.fileName === fileName);
    if (!fileLabel) return;

    const marker = fileLabel.layer;
    const element = marker.getElement();

    if (element.classList.contains('visible')) {
        element.classList.remove('visible');
        fileLabel.selected = false;
    } else {
        element.classList.add('visible');
        fileLabel.selected = true;
    }
}

function removerRotuloArquivo(fileName) {
    const index = fileLabels.findIndex(label => label.fileName === fileName);
    if (index === -1) return;

    const fileLabel = fileLabels[index];
    mapa.removeLayer(fileLabel.layer);
    fileLabels.splice(index, 1);
}