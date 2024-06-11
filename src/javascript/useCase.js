import { eventBus, pdfFindController, pdfViewer, url } from './config.js';

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

// Debounce function to limit the rate at which a function can fire.
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

document.getElementById('search-icon').addEventListener('click', () => {
    const findBar = document.getElementById('findBar');
    findBar.classList.toggle('disabled');
});

document.getElementById('findInput').addEventListener('input', debounce((event) => {
    const searchTerm = event.target.value;

    const options = {
        source: event.target,
        type: "find",
        query: searchTerm,
        phraseSearch: true,
        caseSensitive: false,
        entireWord: false,
        highlightAll: true,
        findPrevious: false
    };

    // Show loading icon
    document.getElementById('loadingIcon').classList.add('active');

    // Simulate async search (replace this with your actual search logic)
    setTimeout(() => {
        document.getElementById('loadingIcon').classList.remove('active');
        eventBus.dispatch('find', options);
    }, 700); // Simulate 700ms delay, replace with actual search delay if needed
}, 300)); // Adjust debounce delay as needed

document.getElementById('findPrevious').addEventListener('click', function () {
    const search = document.getElementById('findInput').value;
    eventBus.dispatch('find', {
        source: pdfFindController,
        type: "again",
        query: search,
        phraseSearch: true,
        caseSensitive: false,
        entireWord: false,
        highlightAll: true,
        findPrevious: true
    });
});

document.getElementById('findNext').addEventListener('click', function () {
    const search = document.getElementById('findInput').value;
    eventBus.dispatch('find', {
        source: pdfFindController,
        type: "again",
        query: search,
        phraseSearch: true,
        caseSensitive: false,
        entireWord: false,
        highlightAll: true,
        findPrevious: false
    });
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
