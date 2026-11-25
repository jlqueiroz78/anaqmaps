/* =============================================
   CONFIGURAÇÃO GLOBAL E ESTADO DA APLICAÇÃO
   ============================================= */

// Configuração do ambiente e chaves de API
const ENV = {
    GEOAPIFY_API_KEY: ''
};

/**
 * Carrega variáveis de ambiente de forma segura e assíncrona
 * Suporta:
 * 1. window.__ENV__ (js/env.js local para protocolo file://)
 * 2. fetch('.env') (para servidores HTTP/HTTPS e localhost)
 * 3. localStorage (fallback de configuração)
 */
async function carregarVariaveisAmbiente() {
    // 1. Tentar ler do window.__ENV__ (caso configurado localmente via js/env.js)
    if (window.__ENV__ && window.__ENV__.GEOAPIFY_API_KEY) {
        ENV.GEOAPIFY_API_KEY = window.__ENV__.GEOAPIFY_API_KEY;
        return ENV;
    }

    // 2. Tentar carregar do arquivo .env via fetch (servidor web/localhost)
    try {
        const response = await fetch('.env');
        if (response.ok) {
            const text = await response.text();
            const lines = text.split(/\r?\n/);
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#')) {
                    const sepIdx = trimmed.indexOf('=');
                    if (sepIdx !== -1) {
                        const key = trimmed.slice(0, sepIdx).trim();
                        let val = trimmed.slice(sepIdx + 1).trim();
                        val = val.replace(/^["']|["']$/g, '');
                        if (key) {
                            ENV[key] = val;
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.info('Aviso: Leitura de .env via fetch indisponível no protocolo atual.');
    }

    // 3. Fallback: localStorage
    if (!ENV.GEOAPIFY_API_KEY && typeof localStorage !== 'undefined') {
        const keyArmazenada = localStorage.getItem('GEOAPIFY_API_KEY');
        if (keyArmazenada) {
            ENV.GEOAPIFY_API_KEY = keyArmazenada;
        }
    }

    return ENV;
}

// =============================================
// CONFIGURAÇÃO DE CAMADAS PREDEFINIDAS
// =============================================

// Defina aqui os caminhos para seus arquivos KML
const CAMADAS_PREDEFINIDAS = [
    {
        nome: "Limites Municipais",
        url: "Users\\d787887\\Documents\\AnaqMaps\\QDRA_risco_MOOCA-ARICANDUVA.kml",
        visivel: true,
        cor: "#3498db"
    },
    {
        nome: "Áreas de Preservação", 
        url: "caminho/para/seu/arquivo2.kml",
        visivel: true,
        cor: "#27ae60"
    },
    {
        nome: "Zoneamento Urbano",
        url: "caminho/para/seu/arquivo3.kml",
        visivel: false,
        cor: "#e74c3c"
    }
    // Adicione mais camadas conforme necessário
];

// Variáveis globais de estado
let marcador = null;
let marcadorBusca = null;
let circulo = null;
let circuloAtivo = false;

let drawnItems = null;          // Inicializado em map-init.js
let polygonDrawer = null;
let drawControl = null;
let drawControlActive = true;

let polygons = [];
let polygonLabels = [];
let importedKmlLayers = [];
let kmlLayers = [];
let fileLabels = [];

let isDraggingEnabled = false;
let isLabelDraggingEnabled = false;
let selectedPolygonIds = [];

let molduraVisivel = false;
let polygonManagerExpanded = false;
let layerManagerExpanded = false;

// Opções padrão de desenho de polígono
const defaultPolygonDrawOptions = {
    shapeOptions: {
        color: '#808070',
        fillColor: '#808070',
        fillOpacity: 0.25,
        weight: 2
    },
    allowIntersection: true,
    showArea: false,
    metric: true
};

// Configuração de idioma do Leaflet Draw (PT-BR)
function configurarIdiomaLeafletDraw() {
    if (window.L && L.drawLocal) {
        L.drawLocal.draw.toolbar.actions.title = 'Cancelar desenho';
        L.drawLocal.draw.toolbar.actions.text = 'Cancelar';
        L.drawLocal.draw.toolbar.finish.title = 'Finalizar desenho';
        L.drawLocal.draw.toolbar.finish.text = 'Finalizar';
        L.drawLocal.draw.toolbar.undo.title = 'Excluir último ponto';
        L.drawLocal.draw.toolbar.undo.text = 'Desfazer';
        L.drawLocal.draw.toolbar.buttons.polygon = 'Desenhar um polígono';
        L.drawLocal.draw.handlers.polygon.tooltip.start = 'Clique no mapa para começar a desenhar.';
        L.drawLocal.draw.handlers.polygon.tooltip.cont = 'Clique para continuar desenhando.';
        L.drawLocal.draw.handlers.polygon.tooltip.end = 'Clique no primeiro ponto para fechar o polígono.';
        L.drawLocal.edit.toolbar.actions.save.title = 'Salvar alterações';
        L.drawLocal.edit.toolbar.actions.save.text = 'Salvar';
        L.drawLocal.edit.toolbar.actions.cancel.title = 'Cancelar edição';
        L.drawLocal.edit.toolbar.actions.cancel.text = 'Cancelar';
        L.drawLocal.edit.toolbar.buttons.edit = 'Editar polígonos';
        L.drawLocal.edit.toolbar.buttons.remove = 'Remover polígonos';
    }
}