// Initialize variables
let pdfDoc = null;
let pageNum = 1;
let scale = 2.0; // High quality rendering
let canvas = document.getElementById('pdf-render');
let ctx = canvas.getContext('2d');

// Parse the URL parameters
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const pdfUrl = params.get('pdf');
    const pageParam = params.get('page');
    
    // Convert page parameter to number if present
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    
    return { pdfUrl, page };
}

// Render the specified page of the PDF
function renderPage(pageNumber) {
    // Show loading container while rendering
    document.getElementById('loading-container').style.display = 'flex';
    
    pdfDoc.getPage(pageNumber).then(page => {
        // Calculate viewport to fit the canvas to the PDF page
        const viewport = page.getViewport({ scale });
        
        // Set canvas dimensions to match the viewport
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render PDF page into canvas context
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        const renderTask = page.render(renderContext);
        
        // When the render completes, hide the loading spinner
        renderTask.promise.then(() => {
            document.getElementById('loading-container').style.display = 'none';
            document.getElementById('pdf-container').style.display = 'block';
        });
    });
}

// Load and initialize the PDF
function loadPDF(url, initialPage) {
    pdfjsLib.getDocument(url).promise.then(pdf => {
        pdfDoc = pdf;
        pageNum = initialPage;
        
        // Ensure the page number is valid
        if (pageNum < 1) pageNum = 1;
        if (pageNum > pdf.numPages) pageNum = pdf.numPages;
        
        // Render the page
        renderPage(pageNum);
    }).catch(error => {
        // Handle errors
        console.error('Error loading PDF:', error);
        document.getElementById('loading-container').innerHTML = `
            <div class="loading-text">Error loading PDF: ${error.message}</div>
        `;
    });
}

// When the page loads, get URL parameters and load the PDF
document.addEventListener('DOMContentLoaded', () => {
    const { pdfUrl, page } = getUrlParams();
    
    if (pdfUrl) {
        loadPDF(pdfUrl, page);
    } else {
        // If no PDF URL is provided, display a message
        document.getElementById('loading-container').innerHTML = `
            <div class="loading-text">No PDF URL provided. Use ?pdf=URL in the query string.</div>
        `;
    }
});

// Handle window resize to keep PDF centered
window.addEventListener('resize', () => {
    if (pdfDoc) {
        renderPage(pageNum);
    }
});
