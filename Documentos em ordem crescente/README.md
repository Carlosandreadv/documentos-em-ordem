# 📄 Documentos em Ordem

Processador cronológico de documentos — uma aplicação HTML standalone que seleciona uma pasta, processa todos os arquivos (texto, PDF, DOCX, imagens OCR, áudio) e exporta um `.docx` profissional com capa, índice clicável e numeração de páginas.

> **Não precisa de servidor nem instalação.** Basta abrir o HTML no navegador Chrome ou Edge.

---

## 🚀 Como usar

### Opção 1: Abrir direto no navegador
```
1. Baixe ou clone o repositório
2. Abra Documentos_em_ordem.html no Chrome ou Edge
3. Clique em "📁 Selecionar Pasta" e escolha o diretório
4. Clique em "⚙️ Processar"
5. Clique em "📥 Exportar .docx" quando terminar
```

### Opção 2: Via servidor local (recomendado)
```bash
npx serve .
# Abra http://localhost:3000/Documentos_em_ordem.html
```

> O servidor local elimina avisos de segurança do navegador e garante que todas as APIs funcionem corretamente.

---

## 📋 Formatos suportados

| Tipo | Extensões | Método de extração |
|------|-----------|-------------------|
| **Texto** | `.txt`, `.md`, `.html`, `.htm`, `.css`, `.js`, `.json`, `.xml`, `.csv`, `.rtf` | Leitura direta |
| **PDF** | `.pdf` | PDF.js (extração por página) |
| **DOCX** | `.docx` | Mammoth.js |
| **DOC** | `.doc` | Mammoth.js (tentativa) |
| **ODT** | `.odt` | JSZip (extrai `content.xml`) |
| **Imagens** | `.jpg`, `.jpeg`, `.png`, `.tiff`, `.bmp`, `.gif`, `.webp`, `.svg` | Tesseract.js (OCR) |
| **Áudio** | `.mp3`, `.wav`, `.aac`, `.flac`, `.ogg`, `.m4a`, `.wma`, `.opus` | Web Speech API |

---

## ✨ Funcionalidades

### Processamento
- **Seleção de pasta** via File System Access API (Chrome/Edge)
- **Ordenação cronológica** automática (mais antigo primeiro)
- **Pausa / Retoma / Cancelamento** do processamento
- **Retry** — botão para reprocessar apenas os arquivos que falharam
- **Barra de progresso** com tempo decorrido e estimativa de conclusão

### OCR de imagens
- **Pré-processamento**: conversão para escala de cinza → normalização de contraste → binarização
- **Detecção EXIF** de orientação (JPEG e PNG) — corrige automaticamente fotos de celular viradas
- **Teste em 4 orientações** (0°, 90°, 180°, 270°) — seleciona automaticamente a que mais texto encontrar
- **Fallback**: se binarizado falhar, tenta com a imagem original

### Transcrição de áudio
- Conversão AudioBuffer → WAV
- Transcrição via `captureStream()` + Web Speech API
- Detecção de silêncio (RMS) antes de tentar transcrever
- Transcrição progressiva (atualiza tooltip em tempo real)

### Exportação DOCX
- **Capa**: barras decorativas, título, caixa de informações
- **Índice**: tabela com hiperlinks clicáveis (Ctrl+Click pula para o arquivo)
- **Conteúdo**: cabeçalho com bookmark, metadados em tabela, texto formatado
- **Footer**: "Página X de Y" em todas as páginas + nome do documento
- **Detecção de formatação**: títulos (maiúsculas/números) em negrito, separadores de página PDF em itálico

### Interface
- **Tema claro/escuro** com toggle
- **Painel de estatísticas** (total, prontos, fila, erros)
- **Lista de arquivos** com ícones por tipo e status visual
- **Filtro por tipo** (pílulas clicáveis)
- **Logs detalhados** com timestamp
- **Prévia** do conteúdo de cada arquivo processado
- **Detecção de servidor local** com escaneamento de portas

---

## 🛠️ Dependências (via CDN)

| Biblioteca | Versão | Uso |
|-----------|--------|-----|
| [PDF.js](https://mozilla.github.io/pdf.js/) | 3.11.174 | Extração de texto de PDFs |
| [Mammoth.js](https://github.com/mwilliamson/mammoth.js) | 1.8.0 | Extração de texto de DOCX |
| [Tesseract.js](https://tesseract.projectnaptha.com/) | 5.x | OCR de imagens |
| [docx.js](https://github.com/dolanmiu/docx) | 8.5.0 | Geração de DOCX |
| [FileSaver.js](https://github.com/nickersoft/FileSaver.js) | 2.0.5 | Download de arquivos |
| [JSZip](https://stuk.github.io/jszip/) | 3.10.1 | Leitura de ODT (ZIP) |

> Todas as bibliotecas são carregadas via CDN — não é necessário `npm install`.

---

## 🖥️ Requisitos do navegador

| API | Chrome | Edge | Firefox | Safari |
|-----|--------|------|---------|--------|
| File System Access API | ✅ | ✅ | ❌ | ❌ |
| captureStream() | ✅ | ✅ | ⚠️ | ❌ |
| SpeechRecognition | ✅ | ✅ | ❌ | ❌ |
| createImageBitmap | ✅ | ✅ | ✅ | ✅ |

> **Recomendação**: Use **Chrome** ou **Edge** para melhor compatibilidade.

---

## 📁 Estrutura do projeto

```
Documentos em ordem crescente/
├── Documentos_em_ordem.html   ← Aplicação principal (tudo em um arquivo)
└── README.md
```

---

## 📄 Licença

Uso livre para fins pessoais e educacionais.
