/* =============================================
   IMPRESSÃO E MOLDURA A4 (PAISAGEM E RETRATO)
   ============================================= */

function togglePrintOptions() {
    const printOptions = document.getElementById('printOptions');
    if (!printOptions) return;

    if (printOptions.style.display === 'block') {
        printOptions.style.display = 'none';
    } else {
        printOptions.style.display = 'block';
        sincronizarTitulo();
    }
}

/**
 * Atualiza o posicionamento do rótulo da moldura A4 relativo ao container do mapa
 */
function atualizarPosicaoRotuloMoldura() {
    const moldura = document.getElementById('printFrame');
    const label = document.getElementById('printFrameLabel');
    if (!moldura || !label || moldura.style.display === 'none') return;

    const mapContainer = document.querySelector('.map-container');
    if (!mapContainer) return;

    const molduraRect = moldura.getBoundingClientRect();
    const containerRect = mapContainer.getBoundingClientRect();

    const topPos = Math.max(8, molduraRect.top - containerRect.top + 8);
    const leftPos = Math.max(8, molduraRect.left - containerRect.left + 8);

    label.style.top = topPos + 'px';
    label.style.left = leftPos + 'px';
}

/**
 * Atualiza as classes CSS e dimensões da moldura conforme a orientação selecionada
 */
function atualizarMolduraVisual() {
    const moldura = document.getElementById('printFrame');
    const label = document.getElementById('printFrameLabel');
    const orientacaoSelect = document.getElementById('orientacao');
    const orientacao = orientacaoSelect ? orientacaoSelect.value : 'landscape';

    if (!moldura) return;

    moldura.className = 'print-frame ' + (orientacao === 'portrait' ? 'a4-portrait' : 'a4-landscape');

    if (label) {
        label.textContent = orientacao === 'portrait' 
            ? 'ÁREA DE IMPRESSÃO A4 (RETRATO)' 
            : 'ÁREA DE IMPRESSÃO A4 (PAISAGEM)';
    }

    setTimeout(atualizarPosicaoRotuloMoldura, 20);
}

/**
 * Define explicitamente a orientação da moldura e da impressão ('portrait' ou 'landscape')
 */
function definirMolduraOrientacao(orientacao) {
    const orientacaoSelect = document.getElementById('orientacao');
    if (orientacaoSelect) {
        orientacaoSelect.value = orientacao;
    }

    if (!molduraVisivel) {
        toggleMolduraImpressao();
    } else {
        atualizarMolduraVisual();
    }
}

/**
 * Alterna dinamicamente entre formato Retrato e Paisagem
 */
function alternarOrientacaoMoldura() {
    const orientacaoSelect = document.getElementById('orientacao');
    const atual = orientacaoSelect ? orientacaoSelect.value : 'landscape';
    const nova = atual === 'portrait' ? 'landscape' : 'portrait';
    definirMolduraOrientacao(nova);
}

/**
 * Sincroniza a moldura caso o usuário mude o select de orientação no painel de impressão
 */
function sincronizarOrientacaoMoldura(novaOrientacao) {
    if (molduraVisivel) {
        atualizarMolduraVisual();
    }
}

/**
 * Exibe ou oculta a moldura A4
 */
function toggleMolduraImpressao(orientacaoDesejada) {
    const moldura = document.getElementById('printFrame');
    const label = document.getElementById('printFrameLabel');
    const controls = document.querySelector('.print-frame-controls');
    const btnToggle = document.getElementById('btnToggleMoldura');

    if (orientacaoDesejada) {
        const orientacaoSelect = document.getElementById('orientacao');
        if (orientacaoSelect) orientacaoSelect.value = orientacaoDesejada;
    }

    if (!molduraVisivel) {
        moldura.style.display = 'block';
        label.style.display = 'block';
        if (controls) controls.style.display = 'block';

        molduraVisivel = true;
        atualizarMolduraVisual();

        const botoes = document.querySelectorAll('.frame-toggle-btn');
        botoes.forEach(b => {
            b.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Moldura';
        });

        if (btnToggle) {
            btnToggle.innerHTML = '<i class="fas fa-eye-slash"></i> Ocultar Moldura A4';
            btnToggle.classList.add('active');
        }
    } else {
        moldura.style.display = 'none';
        label.style.display = 'none';
        if (controls) controls.style.display = 'none';
        molduraVisivel = false;

        const botoes = document.querySelectorAll('.frame-toggle-btn');
        botoes.forEach(b => {
            b.innerHTML = '<i class="fas fa-crop-alt"></i> Mostrar Moldura';
        });

        if (btnToggle) {
            btnToggle.innerHTML = '<i class="fas fa-crop-alt"></i> Mostrar Moldura A4';
            btnToggle.classList.remove('active');
        }
    }
}

// Redimensionamento de janela atualiza rótulo
window.addEventListener('resize', () => {
    if (molduraVisivel) atualizarPosicaoRotuloMoldura();
});

/**
 * Prepara o documento e dispara a impressão A4 com orientação configurada
 */
function prepararImpressao() {
    sincronizarTituloParaMapa();

    const titulo =
        document.getElementById('tituloImpressao').value ||
        document.getElementById('map-title').value ||
        'Título Mapa ...';
    const orientacao = document.getElementById('orientacao')?.value || 'landscape';

    document.getElementById('map-title').value = titulo;
    document.getElementById('print-title').textContent = titulo;
    document.body.setAttribute('data-print-date', new Date().toLocaleDateString('pt-BR'));

    const style = document.createElement('style');
    style.id = 'dynamic-print-style';
    style.innerHTML = `
        @page {
            size: A4 ${orientacao};
            margin: 6mm;
        }

        @media print {
            .container {
                margin-top: 90px !important;
                height: calc(100vh - 90px) !important;
            }

            .main-content {
                height: calc(100vh - 90px) !important;
            }

            .map-container {
                height: calc(100vh - 90px) !important;
            }

            #map {
                height: 100% !important;
            }
        }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
        window.print();

        setTimeout(() => {
            if (style.parentNode) document.head.removeChild(style);
        }, 150);
    }, 150);
}
