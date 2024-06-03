zk.afterMount(function () {
    setTimeout(() => {
        var element = zk.Widget.$('$pdfBase64Label');
        var pdfBase64 = element.getValue();
        renderPdf(pdfBase64);
        console.log("entrei no aftermount");
    }, 1000);
});

function base64ToArrayBuffer(base64) {
    var binaryString = window.atob(base64);
    var len = binaryString.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function isValidBase64(base64) {
    try {
        window.atob(base64);
        return true;
    } catch (e) {
        return false;
    }
}

async function renderPdf(pdfBase64) {
    if (!isValidBase64(pdfBase64)) {
        console.error("Invalid Base64 string");
        return;
    }

    const pdfData = base64ToArrayBuffer(pdfBase64);

    console.log("entrei no render");

    const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.mjs');
    const pdfjsViewer = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf_viewer.mjs');

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs';

    const container = document.getElementById('viewerContainer');
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    const eventBus = new pdfjsViewer.EventBus();
    const pdfViewer = new pdfjsViewer.PDFViewer({
        container: container,
        eventBus: eventBus,
    });

    let pdfDocument = null;
    let currentRotation = 0;

    pdfjsLib.getDocument({ data: pdfData }).promise.then(function (pdfDoc) {
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
        if (pdfViewer.findController) {
            pdfViewer.findController.executeCommand('find', {
                query: searchTerm,
                highlightAll: true,
                caseSensitive: false,
                findPrevious: false
            });
        } else {
            console.error("findController is not initialized");
        }
    };

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

    eventBus.on('pagesinit', () => {
        pdfViewer.currentScaleValue = 'page-width';
    });

    eventBus.on('pagechanging', (evt) => {
        document.getElementById('pageNumber').value = evt.pageNumber;
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

    document.getElementById('download').addEventListener('click', function () {
        if (!isValidBase64(pdfBase64)) {
            console.error("Invalid Base64 string");
            return;
        }

        const byteCharacters = atob(pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = + '.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    document.getElementById('print').addEventListener('click', () => {
        if (!isValidBase64(pdfBase64)) {
            console.error("Invalid Base64 string");
            return;
        }

        const byteCharacters = atob(pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        iframe.src = blobUrl;
        document.body.appendChild(iframe);

        iframe.onload = () => {
            iframe.contentWindow.print();
        };
        document.body.appendChild(iframe);
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
    });

    document.addEventListener('fullscreenchange', (event) => {
        if (!document.fullscreenElement) {
            pdfViewer.currentScaleValue = 'auto';
        }
    });

    window.addEventListener('resize', () => {
        pdfViewer.currentScaleValue = 'auto';
    });
}