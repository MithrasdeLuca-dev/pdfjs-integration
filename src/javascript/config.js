import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.mjs';
import * as pdfjsViewer from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf_viewer.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs';

const url = '../../media/content.pdf';

const container = document.getElementById('viewerContainer');
const thumbnailContainer = document.getElementById('thumbnailContainer');
const eventBus = new pdfjsViewer.EventBus();
const pdfViewer = new pdfjsViewer.PDFViewer({
    container: container,
    eventBus: eventBus,
});

let pdfDocument = null;
let currentRotation = 0;

pdfjsLib.getDocument(url).promise.then(function (pdfDoc) {
    pdfDocument = pdfDoc;
    pdfViewer.setDocument(pdfDoc);
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
                return thumbnail;
            });
        }));
    }

    Promise.all(promises).then(thumbnails => {
        thumbnails.forEach(thumbnail => {
            thumbnailContainer.appendChild(thumbnail);
        });
    });
}

// Toolbar buttons
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

document.getElementById('pageNumber').addEventListener('change', (event) => {
    const pageNumber = parseInt(event.target.value);
    if (pageNumber > 0 && pageNumber <= pdfViewer.pagesCount) {
        pdfViewer.currentPageNumber = pageNumber;
    }
});

document.getElementById('scaleSelect').addEventListener('change', (event) => {
    const scaleValue = event.target.value;
    pdfViewer.currentScaleValue = scaleValue;
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

document.getElementById('search-text').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const searchTerm = event.target.value;
        console.log(searchTerm);
        if (searchTerm) {
            findTextInPDF(searchTerm);
        }
    }
});

const findTextInPDF = (searchTerm) => {
    console.log(pdfViewer);
    pdfViewer.eventBus.dispatch('find', {
        type: '',
        query: searchTerm
    });
};

eventBus.on('pagesinit', () => {
    pdfViewer.currentScaleValue = 'page-width';
});

eventBus.on('pagechanging', (evt) => {
    document.getElementById('pageNumber').value = evt.pageNumber;
});

const sidebarToggleBtn = document.getElementById('sidebarToggle');
sidebarToggleBtn.addEventListener('click', () => {
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    const viewerContainer = document.getElementById('viewerContainer');
    thumbnailContainer.classList.toggle('recolher');
    viewerContainer.classList.toggle('recolher');
});

window.addEventListener('resize', () => {
    pdfViewer.currentScaleValue = 'page-width';
});

window.addEventListener('keydown', (event) => {
    if ((event.ctrlKey && (event.key === 'p' || event.key === 's' || event.key === 'c')) ||
        (event.key === 'Insert' && event.ctrlKey)) {
        event.preventDefault();
        alert('Este comando foi desativado.');
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
