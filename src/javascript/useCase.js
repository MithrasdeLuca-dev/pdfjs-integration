document.getElementById('pageDown').addEventListener('click', function() {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
});

document.getElementById('pageUp').addEventListener('click', function() {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
});

document.getElementById('zoomIn').addEventListener('click', function() {
    scale += 0.1;
    renderPage(pageNum);
});

document.getElementById('zoomOut').addEventListener('click', function() {
    if (scale <= 0.1) {
        return;
    }
    scale -= 0.1;
    renderPage(pageNum);
});

document.getElementById('fitPage').addEventListener('click', function() {
    scale = 1.0;
    renderPage(pageNum);
});

document.getElementById('download').addEventListener('click', function() {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'documento.pdf';
    link.click();
});

document.getElementById('print').addEventListener('click', function() {
    window.print();
});