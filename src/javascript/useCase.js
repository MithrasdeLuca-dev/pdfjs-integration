import { eventBus, pdfViewer, url } from './config.js';

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

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

document.getElementById('findInput').addEventListener('input', debounce((event) => {
    const searchTerm = event.target.value;

    const options = {
        source: event.target,
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
        eventBus.dispatch('findbarclose', { source: event.target });
    }
}, 400));



document.getElementById('findPrevious').addEventListener('click', () => {
    const searchTerm = document.getElementById('findInput').value;
    eventBus.dispatch('findagain', {
        findPrevious: true
    });

});

document.getElementById('findNext').addEventListener('click', () => {
    const searchTerm = document.getElementById('findInput').value;

    eventBus.dispatch('findagain', {
        findPrevious: false
    });
});

eventBus.on('findagain', (evt) => {
    console.log('findagain foi chamado:', evt);

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
