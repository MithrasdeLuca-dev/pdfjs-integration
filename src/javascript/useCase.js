import { eventBus, pdfViewer, url } from './config.js';

const sidebarToggleBtn = document.getElementById('sidebarToggle');
sidebarToggleBtn.addEventListener('click', () => {
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    const viewerContainer = document.getElementById('viewerContainer');
    thumbnailContainer.classList.toggle('recolher');
    viewerContainer.classList.toggle('recolher');
});

document.getElementById('permission').addEventListener('change', () => {
    const permission = document.getElementById('permission');
    const downloadButton = document.getElementById('download');
    const printButton = document.getElementById('print');

    if (permission.checked) {
        downloadButton.style.display = 'inline-block';
        printButton.style.display = 'inline-block';
        downloadButton.disabled = false;
        printButton.disabled = false;
    } else {
        downloadButton.style.display = 'none';
        printButton.style.display = 'none';
        downloadButton.disabled = true;
        printButton.disabled = true;
    }
});

document.getElementById('search-icon').addEventListener('click', () => {
    const findBar = document.getElementById('findBar');
    findBar.style.display = findBar.style.display === 'none' ? 'block' : 'none';
});

let previousSearchTerm = '';
let currentMatchPage = null;
let currentMatchIndex = null;

document.getElementById('findInput').addEventListener('input', (event) => {
    const searchTerm = event.target.value;
    const options = {
        source: this,
        type: 'find',
        query: searchTerm,
        phraseSearch: true,
        caseSensitive: false,
        entireWord: false,
        highlightAll: true,
        findPrevious: false
    };

    if (searchTerm) {
        eventBus.dispatch('find', options);
    } else {
        eventBus.dispatch('findbarclose', { source: this });
    }
});

eventBus.on('updatefindcontrolstate', (event) => {
    const currentSearchTerm = event.rawQuery;

    if (currentSearchTerm !== previousSearchTerm) {
        previousSearchTerm = currentSearchTerm;

        // Obter posição atual e página da correspondência
        const currentPosition = event.matchesCount.current;
        const currentPage = event.source._selected.pageIdx;

        // Atualizar variáveis de estado
        currentMatchPage = currentPage;
        currentMatchIndex = currentPosition;

        console.log('Pesquisa mudou. Atualizando correspondência:', currentSearchTerm);
        console.log('Posição atual:', currentPosition, 'Página atual:', currentPage);
    } else {
        // Se a pesquisa não mudou, mantenha a correspondência atual
        console.log('Pesquisa não mudou. Mantendo correspondência atual.');

        // Manter a visualização na página e posição atuais
        if (currentMatchPage !== null && currentMatchIndex !== null) {
            // Lógica para forçar a página e a posição atuais
            pdfViewer.currentPageNumber = currentMatchPage + 1; // Ajuste conforme necessário
            // Note: Pode ser necessário adicionar lógica adicional para destacar a correspondência específica na página
        }
    }
});

eventBus.on('updatetextlayermatches', (event) => {
    if (currentMatchPage !== null && currentMatchIndex !== null) {
        console.log(currentMatchPage + 1)
        pdfViewer.currentPageNumber = currentMatchPage + 1; // Ajuste conforme necessário
        // Note: Pode ser necessário adicionar lógica adicional para destacar a correspondência específica na página
    }
});


document.getElementById('findNext').addEventListener('click', () => {
    eventBus.dispatch('findagain', { source: this, findPrevious: false });
});

document.getElementById('findPrevious').addEventListener('click', () => {
    eventBus.dispatch('findagain', { source: this, findPrevious: true });
});

document.getElementById('findInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        eventBus.dispatch('findagain', { source: this, findPrevious: false });
    }
});

document.getElementById('firstPage').addEventListener('click', () => {
    pdfViewer.currentPageNumber = 1;
});

document.getElementById('previous').addEventListener('click', () => {
    pdfViewer.currentPageNumber = Math.max(pdfViewer.currentPageNumber - 1, 1);
});

document.getElementById('pageNumber').addEventListener('change', (event) => {
    const pageNumber = parseInt(event.target.value);
    if (pageNumber <= 0 || pageNumber > pdfViewer.pagesCount) {
        return event.target.value = pdfViewer.currentPageNumber;
    }
    pdfViewer.currentPageNumber = pageNumber;
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
    pdfViewer.currentScaleValue = event.target.value;
});

document.getElementById('zoomOut').addEventListener('click', () => {
    pdfViewer.currentScaleValue = (pdfViewer.currentScale / 1.1).toFixed(2);
});

document.getElementById('rotateCw').addEventListener('click', () => {
    pdfViewer.pagesRotation = (pdfViewer.pagesRotation + 90) % 360;
});

document.getElementById('rotateCcw').addEventListener('click', () => {
    pdfViewer.pagesRotation = (pdfViewer.pagesRotation - 90) % 360;
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
