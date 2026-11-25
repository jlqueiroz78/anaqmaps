# 🗺️ AnaqMaps

Aplicação web interativa para visualização geográfica, desenho e gestão de polígonos, importação de dados cartográficos (KML), rotulagem espacial dinâmica e geração de mapas impressos em formato A4 (Paisagem e Retrato).

Projetada com interface intuitiva, padrão visual institucional (**`#2F80ED`**) e arquitetura segura para proteção de chaves de API.

---

## 🚀 Funcionalidades

### 🔍 Busca de Endereços
- Geocodificação em tempo real via **Nominatim / OpenStreetMap**.
- Centralização e zoom automáticos no local pesquisado com criação de marcador de referência.
- Suporte a busca ao pressionar a tecla `Enter`.

### ✏️ Desenho e Gestão de Polígonos
- Desenho de polígonos sobre o mapa com **Leaflet Draw** totalmente em Português (PT-BR).
- Edição de vértices e cálculo visual de área.
- **Gerenciador de Polígonos**: painel retrátil com contagem em tempo real, seleção, alternância de visibilidade (*Visível / Oculto*) e exclusão individual ou em lote.
- Rótulos textuais personalizados aplicados diretamente a cada polígono.

### 📍 Marcadores e Raio de Amostragem
- Inserção de marcadores pontuais com controles de arrastar (*drag & drop*).
- Ativação de raio/círculo geográfico de **150 metros** com estilo visual tracejado.
- Popup de ações rápidas: remoção, alternância de raio e trava/destrava de posição.

### 📂 Importação de Arquivos KML
- **Upload manual**: importe arquivos `.kml` locais arrastando ou selecionando do computador.
- **Camadas Predefinidas**: suporte a catálogo de camadas pré-configuradas no sistema (`CAMADAS_PREDEFINIDAS`), com cores personalizadas (`cor`) e visibilidade configurável (`visivel: true/false`).
- Extração automática de geometrias, propriedades e centróides.
- Controle individual de cada camada importada no painel lateral.

### ✋ Movimentação Espacial (Arrastar e Soltar)
- Ativação de movimentação livre de polígonos desenhados/importados.
- Ativação de movimentação e reposicionamento livre de rótulos textuais no mapa.

### 🖨️ Impressão e Moldura A4 (Paisagem e Retrato)
- **Moldura A4 na tela**: guia visual com proporção física real para enquadrar o conteúdo antes de imprimir.
- Suporte completo aos dois formatos:
  - **Paisagem (Landscape)**: 297mm × 210mm.
  - **Retrato (Portrait)**: 210mm × 297mm.
- Botões rápidos de alternância de orientação na barra lateral e em widget flutuante no mapa.
- Exportação limpa e otimizada via `window.print()` / `@page`, com logotipo institucional, título sincronizado e ocultação automática de ferramentas de controle.

---

## 🎨 Identidade Visual e Interface

Todo o sistema segue o padrão de cores corporativo **`#2F80ED`**:
- Botões primários e interativos com efeitos de *hover* (`#1a68d1`) e *active* (`#1555ab`).
- Popups do Leaflet com cabeçalho estilizado, bordas suaves e botões integrados.
- Painéis de opções com contraste acessível, rótulos destacados e campos com anel de foco.
- Badges e contadores padronizados.

---

## 📂 Estrutura do Projeto

```text
AnaqMaps/
├── assets/
│   └── images/
│       └── Logo_trans_1.png     # Logotipo institucional
├── css/
│   ├── base.css                 # Reset global, fontes e scrollbars
│   ├── components.css           # Botões, inputs, painéis e popups (#2F80ED)
│   ├── labels.css               # Estilização de rótulos de polígonos e arquivos
│   ├── layout.css               # Estrutura do cabeçalho, painel lateral e mapa
│   ├── main.css                 # Importador central de estilos
│   ├── polygons.css             # Estilos de polígonos e do gerenciador
│   └── print.css                # Regras de impressão e moldura A4 (Paisagem/Retrato)
├── js/
│   ├── config.js                # Estado global, camadas predefinidas e loader de variáveis
│   ├── draw-polygons.js         # Manipulação do Leaflet Draw   
│   │
│   ├── kml-import.js            # Processamento de KML manual e camadas predefinidas
│   ├── labels.js                # Criação, posicionamento e arraste de rótulos
│   ├── main.js                  # Inicialização do ciclo de vida da aplicação
│   ├── map-init.js              # Inicialização do mapa Leaflet e camada base
│   ├── markers-circle.js        # Marcador pontual e círculo de 150m
│   ├── movement.js              # Movimentação/arraste de polígonos e textos
│   ├── polygon-manager.js       # Listagem, contagem e alternância de polígonos
│   ├── print.js                 # Lógica de moldura A4 e preparação de impressão
│   ├── search.js                # Busca de endereços (Nominatim)
│   └── title-sync.js            # Sincronização em tempo real do título do mapa
├── .gitignore                   # Proteção contra vazamento de credenciais e logs
├── index.html                   # Estrutura principal da página
└── README.md                    # Documentação do projeto
```

---

## 🔐 Configuração e Segurança da Chave de API

O AnaqMaps utiliza os tiles *OSM Bright Grey* da **Geoapify**. 

### 1. Obter uma Chave
Crie uma conta gratuita em [geoapify.com](https://myprojects.geoapify.com/) e gere uma chave de API para Map Tiles.

---

## 📌 Configuração de Camadas KML Predefinidas

Para registrar camadas fixas que carregam automaticamente ou através do botão **"Camadas Predefinidas"**, edite a constante `CAMADAS_PREDEFINIDAS` no arquivo [`js/config.js`](js/config.js):

```javascript
const CAMADAS_PREDEFINIDAS = [
    {
        nome: "Limites Municipais",
        url: "caminho/para/seu/arquivo.kml", // Caminho relativo ou URL
        visivel: true,                      // Exibir ao inicializar?
        cor: "#3498db"                      // Cor do traço e preenchimento
    },
    {
        nome: "Áreas de Preservação",
        url: "assets/kml/preservacao.kml",
        visivel: false,                     // Começa oculta na lista
        cor: "#27ae60"
    }
];
```

Cada camada cadastrada terá seu controle exibido na seção **Importação** do painel lateral, permitindo que o usuário ative, desative ou remova a visualização conforme necessário.

---

## ⚙️ Tecnologias Utilizadas

- **HTML5 & CSS3** (Layout Flexbox, Variáveis CSS, CSS Paged Media `@page`).
- **JavaScript Moderno (ES6+)** sem frameworks pesados (Vanilla JS).
- **[Leaflet 1.7.1](https://leafletjs.com/)**: Biblioteca principal de mapas interativos.
- **[Leaflet Draw 1.0.4](https://github.com/Leaflet/Leaflet.draw)**: Ferramentas de desenho vetorial.
- **[Leaflet Omnivore 0.3.4](https://github.com/mapbox/leaflet-omnivore)**: Parser assíncrono para KML/WKT/GeoJSON.
- **[JSZip 3.7.1](https://stuk.github.io/jszip/)**: Suporte a descompactação em memória.
- **[FontAwesome 6.5.2](https://fontawesome.com/)**: Ícones vetoriais.
- **[Nominatim API](https://nominatim.org/)**: Motor de busca geográfica de endereços.

---

## 🛠️ Como Executar o Projeto

1. Clone ou baixe este repositório.

2. Abra o projeto:
   - **Com servidor web local (recomendado):**
     ```bash
     # Exemplo com Python 3
     python -m http.server 8080
     ```
     Depois, acesse no navegador: `http://localhost:8080`
   - **Ou diretamente:** Dê duplo clique no arquivo `index.html`.

---

## 📄 Licença

Este projeto é de uso interno/institucional. Consulte os termos e atribuições de dados do [OpenStreetMap](https://www.openstreetmap.org/copyright), e [Geoapify](https://www.geoapify.com/).
