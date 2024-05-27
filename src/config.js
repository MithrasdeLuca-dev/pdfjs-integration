import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.mjs';
import * as pdfjsViewer from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf_viewer.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs';

const url = '../media/content.pdf';

const container = document.getElementById('viewerContainer');
const thumbnailContainer = document.getElementById('thumbnailContainer');
const eventBus = new pdfjsViewer.EventBus();
const pdfViewer = new pdfjsViewer.PDFViewer({
    container: container,
    eventBus: eventBus,
});

let pdfDocument = null;
let currentRotation = 0;

pdfjsLib.getDocument(url).promise.then(function(pdfDoc) {
    pdfDocument = pdfDoc;
    pdfViewer.setDocument(pdfDoc);
    document.getElementById('page_count').textContent = pdfDoc.numPages;
    renderThumbnails(pdfDoc);
});

function renderThumbnails(pdfDoc) {
    const promises = [];
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        promises.push(pdfDoc.getPage(pageNum).then(function(page) {
            const viewport = page.getViewport({ scale: 0.2 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            return page.render(renderContext).promise.then(function() {
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
    window.print();
});

document.getElementById('page_num').addEventListener('change', (event) => {
    const pageNumber = parseInt(event.target.value);
    if (pageNumber > 0 && pageNumber <= pdfViewer.pagesCount) {
        pdfViewer.currentPageNumber = pageNumber;
    }
});

eventBus.on('pagesinit', () => {
    pdfViewer.currentScaleValue = 'page-width';
});

eventBus.on('pagechanging', (evt) => {
    document.getElementById('page_num').value = evt.pageNumber;
});

// Toggle thumbnails functionality
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