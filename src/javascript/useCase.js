import { eventBus, pdfFindController, pdfViewer, url } from './config.js';

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

// Configuração de Permissões e Interface
{
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

    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    sidebarToggleBtn.addEventListener('click', () => {
        const thumbnailContainer = document.getElementById('thumbnailContainer');
        const viewerContainer = document.getElementById('viewerContainer');
        thumbnailContainer.classList.toggle('recolher');
        viewerContainer.classList.toggle('recolher');
    });
}

// Funções de Pesquisa
{
    // Debounce function to limit the rate at which a function can fire.
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    // Função find para verificar o tipo e enviar o envento de pesquisa no PDF
    const dispatchFindEvent = (type, findPrevious = false) => {
        const search = document.getElementById('findInput').value;
        const options = {
            source: pdfFindController,
            type,
            query: search,
            caseSensitive: document.getElementById('findMatchCase').checked,
            entireWord: document.getElementById('findEntireWord').checked,
            highlightAll: document.getElementById('findHighlightAll').checked,
            matchDiacritics: document.getElementById('findMatchDiacritics').checked,
            findPrevious
        };

        if (findPrevious) {
            options.findPrevious = true;
        }

        eventBus.dispatch('find', options);
    };

    // Bloco para abrir e fechar a findbar "pesquisa"
    // Bloco para abrir e fechar a findbar "pesquisa"
    const findBarOpenORClose = (isOpen) => {
        const findBox = document.getElementById('findBox');
        const findBar = document.getElementById('findBar');
        const findInput = document.getElementById('findInput');

        if (!isOpen) {
            eventBus.dispatch('findbarclose');
            findBox.classList.remove('focus');
            findBar.classList.remove('active');
        } else {
            findBox.classList.add('focus');
            findBar.classList.add('active');
            findInput.focus();
        }
    };

    document.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
            event.preventDefault(); // Previne a ação padrão do navegador
            findBarOpenORClose(true); // Abre a barra
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            findBarOpenORClose(false); // Fecha a barra
            event.preventDefault();
        }
    });

    document.getElementById('findBox').addEventListener('click', () => {
        const findBar = document.getElementById('findBar');
        findBarOpenORClose(!findBar.classList.contains('active'));
    });

    // Bloco de botões da findbar "pesquisa"
    document.getElementById('findInput').addEventListener('input', debounce((event) => {
        document.getElementById('loadingIcon').classList.add('active');
        setTimeout(() => {
            document.getElementById('loadingIcon').classList.remove('active');

            if (event.target.value === "") {
                eventBus.dispatch('findbarclose');
            }
            dispatchFindEvent('find');
        }, 700);
    }, 300));

    document.getElementById('findPrevious').addEventListener('click', function () {
        dispatchFindEvent('again', true);
    });

    document.getElementById('findNext').addEventListener('click', function () {
        dispatchFindEvent('again', false);
    });

    document.addEventListener('keydown', (event) => {
        const findInput = document.getElementById('findInput');
        if (event.key === 'Enter' && findInput === document.activeElement) {
            dispatchFindEvent('again', false);
            event.preventDefault(); // Previne a ação padrão do navegador
        }
    });

    document.getElementById('findHighlightAll').addEventListener('change', function () {
        dispatchFindEvent('highlightallchange');
    });

    document.getElementById('findMatchCase').addEventListener('change', function () {
        dispatchFindEvent('casesensitivitychange');
    });

    document.getElementById('findEntireWord').addEventListener('change', function () {
        dispatchFindEvent('entirewordchange');
    });

    document.getElementById('findMatchDiacritics').addEventListener('change', function () {
        dispatchFindEvent('diacriticmatchingchange');
    });

    // eventBus.on('find', eventData => {
    //     console.log("Evento 'find' recebido:", eventData);
    //     // Você pode adicionar outras ações com base no tipo de evento
    // });
}

// Funções de Navegação no PDF
{
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
}

// Funções de Download e Impressão
{
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
}

// Funções de Visualização em Tela Cheia
{
    document.getElementById('fullScreen').addEventListener('click', () => {
        const elem = document.getElementById('viewerContainer');
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
        elem.style.overflow = 'auto';
    });

    document.addEventListener('fullscreenchange', (event) => {
        if (!document.fullscreenElement) {
            pdfViewer.currentScaleValue = 'auto';
        }
    });
}
