import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.mjs';
import * as pdfjsViewer from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf_viewer.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs';

const url = '../../media/content.pdf';

const container = document.getElementById('viewerContainer');
const eventBus = new pdfjsViewer.EventBus();
const linkService = new pdfjsViewer.PDFLinkService({ eventBus });

console.log(linkService)

const pdfViewer = new pdfjsViewer.PDFViewer({
    container: container,
    eventBus: eventBus,
    linkService: linkService,
});

const findController = new pdfjsViewer.PDFFindController({
    linkService: linkService,
    eventBus: eventBus,
});

let currentRotation = 0;

pdfjsLib.getDocument(url).promise.then(function (pdfDoc) {
    pdfViewer.setDocument(pdfDoc);
    linkService.setDocument(pdfDoc, null);
    findController.setDocument(pdfDoc);
    document.getElementById('numPages').textContent = "/ " + pdfDoc.numPages;
    renderThumbnails(pdfDoc);
});

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

eventBus.on('pagesinit', () => {
    pdfViewer.currentScaleValue = 'auto';
});

eventBus.on('pagechanging', (evt) => {
    document.getElementById('pageNumber').value = evt.pageNumber;
    highlightCurrentThumbnail(evt.pageNumber);
    scrollToPage(evt.pageNumber);
});

document.getElementById('pageNumber').addEventListener('change', (event) => {
    const pageNumber = parseInt(event.target.value);
    if (pageNumber > 0 && pageNumber <= pdfViewer.pagesCount) {
        pdfViewer.currentPageNumber = pageNumber;
    }
});

window.addEventListener('resize', () => {
    pdfViewer.currentScaleValue = 'auto';
});

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

function scrollToThumbnail(thumbnail) {
    const toolbarHeight = 45; // Altura da toolbar em pixels
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    const containerTop = thumbnailContainer.scrollTop;
    const containerBottom = containerTop + thumbnailContainer.clientHeight;
    const thumbnailTop = thumbnail.offsetTop - toolbarHeight; // Subtrai a altura da toolbar
    const thumbnailBottom = thumbnailTop + thumbnail.clientHeight;

    if (thumbnailTop < containerTop) {
        thumbnailContainer.scrollTo({
            top: thumbnailTop,
            behavior: 'smooth' // Adiciona rolagem suave
        });
    } else if (thumbnailBottom > containerBottom) {
        thumbnailContainer.scrollTo({
            top: thumbnailBottom - thumbnailContainer.clientHeight,
            behavior: 'smooth' // Adiciona rolagem suave
        });
    }
}

function scrollToPage(pageNumber) {
    const toolbarHeight = 60; // Altura da toolbar em pixels
    const pageElement = document.querySelector(`[data-page-number="${pageNumber}"]`);
    if (pageElement) {
        const offsetTop = pageElement.offsetTop - toolbarHeight;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Eventos da Toolbar

const sidebarToggleBtn = document.getElementById('sidebarToggle');
sidebarToggleBtn.addEventListener('click', () => {
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    const viewerContainer = document.getElementById('viewerContainer');
    thumbnailContainer.classList.toggle('recolher');
    viewerContainer.classList.toggle('recolher');
});

document.getElementById('search-icon').addEventListener('click', () => {
    let searchBox = document.getElementById('search-text');
    if (searchBox.style.display === 'none' || searchBox.style.display === '') {
        searchBox.style.display = 'inline';
        searchBox.focus();
    } else {
        searchBox.style.display = 'none';
    }
});

document.getElementById('search-text').addEventListener('input', (event) => {
    const searchTerm = event.target.value;
    if (searchTerm) {
        eventBus.dispatch('find', {
            source: this,
            query: searchTerm,
            caseSensitive: false,
            entireWord: false,
            highlightAll: true,
            findPrevious: false,
            matchDiacritics: false,
        });
    }
});

eventBus.on('updatefindmatchescount', (evt) => {
    console.log(evt);
    const { total } = evt.matchesCount;
});

eventBus.on('updatetextlayermatches', (evt) => {
    console.log(evt);
    const { pageIndex } = evt;
    if (pageIndex === -1) {
        // Atualização para todas as páginas
        const pageMatches = findController.pageMatches;
        pageMatches.forEach((matches, index) => {
            if (matches.length > 0) {
                console.log(`Página ${index + 1}: ${matches.length} correspondências`);
            }
        });
    } else {
        // Atualização para uma página específica
        const matches = findController.pageMatches[pageIndex];
        if (matches.length > 0) {
            console.log(`Página ${pageIndex + 1}: ${matches.length} correspondências`);
        }
    }
});

document.getElementById('firstPage').addEventListener('click', () => {
    pdfViewer.currentPageNumber = 1;
});

document.getElementById('previous').addEventListener('click', () => {
    pdfViewer.currentPageNumber = Math.max(pdfViewer.currentPageNumber - 1, 1);
});

document.getElementById('next').addEventListener('click', () => {
    pdfViewer.currentPageNumber = Math.min(pdfViewer.currentPageNumber + 1, pdfViewer.pagesCount);
});

document.getElementById('lastPage').addEventListener('click', () => {
    pdfViewer.currentPageNumber = pdfViewer.pagesCount;
});

document.getElementById('zoomIn').addEventListener('click', () => {
    pdfViewer.currentScaleValue = (pdfViewer.currentScale * 1.1).toFixed(2);
});

document.getElementById('scaleSelect').addEventListener('change', (event) => {
    const scaleValue = event.target.value;
    pdfViewer.currentScaleValue = scaleValue;
});

document.getElementById('zoomOut').addEventListener('click', () => {
    pdfViewer.currentScaleValue = (pdfViewer.currentScale / 1.1).toFixed(2);
});

document.getElementById('rotateCw').addEventListener('click', () => {
    currentRotation = (currentRotation + 90) % 360;
    pdfViewer.pagesRotation = currentRotation;
});

document.getElementById('rotateCcw').addEventListener('click', () => {
    currentRotation = (currentRotation - 90) % 360;
    pdfViewer.pagesRotation = currentRotation;
});

document.getElementById('download').addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.pdf';
    link.click();
});

document.getElementById('print').addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.src = url;
    iframe.onload = () => {
        iframe.contentWindow.print();
    };
    document.body.appendChild(iframe);
});

window.addEventListener('keydown', (event) => {
    if ((event.ctrlKey && (event.key === 'p' || event.key === 's' || event.key === 'c')) ||
        (event.key === 'Insert' && event.ctrlKey)) {
        event.preventDefault();
        alert('Este comando foi desativado.');
    }
});

document.getElementById('fullScreen').addEventListener('click', () => {
    const elem = document.getElementById('viewerContainer');
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { // Firefox
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { // Chrome, Safari and Opera
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE/Edge
        elem.msRequestFullscreen();
    }
    elem.style.overflow = 'auto';
});

document.addEventListener('fullscreenchange', (event) => {
    if (!document.fullscreenElement) {
        pdfViewer.currentScaleValue = 'auto';
    }
});

const userPermissions = {
    canDownload: true,
    canPrint: true
}

if (!userPermissions.canDownload) {
    const downloadButton = document.getElementById('download');
    downloadButton.disabled = true;
    downloadButton.style.display = 'none';
}

if (!userPermissions.canPrint) {
    const printButton = document.getElementById('print');
    printButton.disabled = true;
    printButton.style.display = 'none';
}