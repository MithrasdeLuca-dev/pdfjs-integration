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

document.getElementById('search-icon').addEventListener('click', () => {
    let searchBox = document.getElementById('search-text');
    if (searchBox.style.display === 'none' || searchBox.style.display === '') {
        searchBox.style.display = 'inline';
        searchBox.focus();
    } else {
        searchBox.style.display = 'none';
    }
});

var toolbarContainer = document.getElementById("toolbarContainer");

var pdfBase64 = zk.Widget.$('$pdfBase64Label').getValue();
var canDownload = zk.Widget.$('$permissao').getValue();
var nomeDoArquivo = zk.Widget.$('$nomeDoArquivo').getValue();


var downloadButton = document.getElementById("download");
var printButton = document.getElementById("print");

renderPdf(pdfBase64, nomeDoArquivo);

if (canDownload === "true") {
    downloadButton.style.display = "inline-block";
    downloadButton.disabled = false;
    printButton.style.display = "inline-block";
    printButton.disabled = false;