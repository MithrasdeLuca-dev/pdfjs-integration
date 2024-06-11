// Importações dos módulos PDF.js necessários
import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.mjs';
import * as pdfjsViewer from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf_viewer.mjs';

// Configuração do URL do worker do PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs';

// URL do documento PDF
const url = '../../media/content.pdf';

// Elementos HTML importantes
const permission = document.getElementById('permission');
const container = document.getElementById('viewerContainer');
const thumbnailContainer = document.getElementById('thumbnailContainer');
const findbarMessageContainer = document.getElementById('findbarMessageContainer');
const findResultCount = document.getElementById('findResultsCount');
const findMsg = document.getElementById('findMsg');

// Instância do EventBus do PDF.js
const eventBus = new pdfjsViewer.EventBus();

// Serviços e controladores do PDF.js
const pdfLinkService = new pdfjsViewer.PDFLinkService({ eventBus });
const pdfFindController = new pdfjsViewer.PDFFindController({ eventBus, linkService: pdfLinkService });
const pdfViewer = new pdfjsViewer.PDFViewer({ container, eventBus, linkService: pdfLinkService, findController: pdfFindController });

// Configuração do serviço de links e do visualizador PDF
pdfLinkService.setViewer(pdfViewer);

// Variável para armazenar o documento PDF
let pdfDocument = null;

// Carregamento do documento PDF
pdfjsLib.getDocument(url).promise.then(function (pdfDoc) {
    pdfDocument = pdfDoc;
    pdfViewer.setDocument(pdfDoc);
    pdfLinkService.setDocument(pdfDoc, null);
    document.getElementById('numPages').textContent = "/ " + pdfDoc.numPages;
    document.getElementById('pageNumber').value = '1';
    renderThumbnails(pdfDoc);
}).catch(function (error) {
    console.error('Erro ao carregar o documento PDF:', error);
});

// Renderização de miniaturas das páginas do PDF
function renderThumbnails(pdfDoc) {
    const promises = [];
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        promises.push(pdfDoc.getPage(pageNum).then(function (page) {
            const viewport = page.getViewport({ scale: 0.2 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            return page.render(renderContext).promise.then(function () {
                const thumbnail = document.createElement('div');
                thumbnail.className = 'thumbnail';
                thumbnail.appendChild(canvas);
                thumbnail.addEventListener('click', () => {
                    pdfViewer.currentPageNumber = pageNum;
                });
                thumbnail.dataset.pageNumber = pageNum;
                return thumbnail;
            });
        }));
    }

    Promise.all(promises).then(thumbnails => {
        thumbnails.forEach(thumbnail => {
            thumbnailContainer.appendChild(thumbnail);
        });
        highlightCurrentThumbnail(pdfViewer.currentPageNumber);
    });
}

// Destaca a miniatura da página atual
function highlightCurrentThumbnail(pageNumber) {
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumbnail => {
        if (parseInt(thumbnail.dataset.pageNumber) === pageNumber) {
            thumbnail.classList.add('active');
            scrollToThumbnail(thumbnail);
        } else {
            thumbnail.classList.remove('active');
        }
    });
}

// Rolamento para a miniatura da página atual
function scrollToThumbnail(thumbnail) {
    const toolbarHeight = 45;
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    const containerTop = thumbnailContainer.scrollTop;
    const containerBottom = containerTop + thumbnailContainer.clientHeight;
    const thumbnailTop = thumbnail.offsetTop - toolbarHeight;
    const thumbnailBottom = thumbnailTop + thumbnail.clientHeight;

    if (thumbnailTop < containerTop) {
        thumbnailContainer.scrollTo({
            top: thumbnailTop,
            behavior: 'smooth'
        });
    } else if (thumbnailBottom > containerBottom) {
        thumbnailContainer.scrollTo({
            top: thumbnailBottom - thumbnailContainer.clientHeight,
            behavior: 'smooth'
        });
    }
}

// Rolamento para a página específica
function scrollToPage(pageNumber) {
    const toolbarHeight = 60;
    const pageElement = document.querySelector(`[data-page-number="${pageNumber}"]`);
    if (pageElement) {
        const offsetTop = pageElement.offsetTop - toolbarHeight;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Assinaturas de eventos
eventBus.on('pagesinit', () => {
    pdfViewer.currentScaleValue = 'auto';
});

eventBus.on('pagechanging', (evt) => {
    document.getElementById('pageNumber').value = evt.pageNumber;
    highlightCurrentThumbnail(evt.pageNumber);
    scrollToPage(evt.pageNumber);
});

eventBus.on('updatefindmatchescount', (event) => {
    if (event.matchesCount.total > 0) {
        findResultCount.textContent = event.matchesCount.current + " / " + event.matchesCount.total;
        findResultCount.style.display = "block";
    } else {
        findResultCount.style.display = "none";
    }
});

eventBus.on('updatefindcontrolstate', (event) => {
    let message = "";
    let isActive = false;

    if (event.rawQuery) {
        switch (event.state) {
            case 0:
                message = event.matchesCount.current + " / " + event.matchesCount.total;
                isActive = true;
                break;
            case 1:
                message = "Nenhuma correspondência encontrada";
                isActive = true;
                break;
        }
    }
    findResultCount.textContent = message;
    findbarMessageContainer.classList.toggle('active', isActive);
});

// Atualização automática do zoom ao redimensionar a janela
window.addEventListener('resize', () => {
    pdfViewer.currentScaleValue = 'auto';
});

// Bloqueio de comandos de impressão e cópia em determinadas situações
window.addEventListener('keydown', (event) => {
    if ((event.ctrlKey && (event.key === 'p' || event.key === 's' || event.key === 'c')) ||
        (event.key === 'Insert' && event.ctrlKey)) {
        if (!permission.checked) {
            event.preventDefault();
            alert('Este comando foi desativado.');
        }
    }
});

window.addEventListener('contextmenu', (event) => {
    if (!permission.checked) {
        event.preventDefault();
        alert('Este comando foi desativado.');
    }
});

// Exportação dos elementos importantes
export { eventBus, pdfDocument, pdfFindController, pdfLinkService, pdfViewer, url };

