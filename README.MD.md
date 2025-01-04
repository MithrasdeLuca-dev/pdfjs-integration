
# PDF.js Custom Implementation Documentation

This repository documents a custom implementation of PDF.js using its CDN-hosted resources and adhering to its original structure and styles. Below, you will find details about the implementation and its core features.

---

## Core Features

### CSS and External Resources
This implementation leverages the built-in text CSS from PDF.js to avoid the need for creating separate text and PDF layers:

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf_viewer.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
```

### JavaScript Modules

Importing essential PDF.js modules directly from their CDN:

```javascript
// Import necessary PDF.js modules
import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.mjs';
import * as pdfjsViewer from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf_viewer.mjs';

// Worker configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.mjs';

const pdfLinkService = new pdfjsViewer.PDFLinkService({ eventBus });
const pdfFindController = new pdfjsViewer.PDFFindController({ eventBus, linkService: pdfLinkService });
const pdfViewer = new pdfjsViewer.PDFViewer({
    container,
    eventBus,
    textLayerMode: 1,
    linkService: pdfLinkService,
    findController: pdfFindController
});
```

### PDF Loading Options
- Binary loading.
- Direct file path.
- URL-based loading (default).

---

## PDF.js Services Structure
The implementation uses the following core services of PDF.js:

- **EventBus**: Manages communication between components.
- **PDFLinkService**: Handles internal PDF links.
- **PDFFindController**: Provides search functionality within the PDF.
- **PDFViewer**: Primary viewer component for rendering PDFs.

---

## Implementation Overview

### Version Details
The implementation is based on version `4.2.67` of PDF.js, which is currently the most stable and secure release. Alternative versions can be found:

- [Release 4.2.67](https://github.com/mozilla/pdf.js/releases/tag/v4.2.67)
- [Other releases](https://github.com/mozilla/pdf.js/tags)
- [Distributed files](https://www.jsdelivr.com/package/npm/pdfjs-dist?version=4.2.67)

### Key Files

1. **pdf.js**: Manages rendering, thumbnails, and event listeners.
2. **toolbar.js**: Handles toolbar interactions, including download and print permissions.
3. **layout.css**: Core styling for the viewer container and thumbnails.
4. **toolbar.css**: Toolbar styling, including find bar elements.
5. **HTML**: Hosts the full render structure, invoking stylesheets at the top and scripts at the bottom.

---

## Functional Details

### PDF Document Loading
- Utilizes `pdfjsLib.getDocument()` to load PDF files.
- Returns a promise to access the loaded document (`pdfDoc`).
- Configures the viewer and services with the loaded document.

### Viewer Setup
- Links the loaded document to the viewer and link service:
  ```javascript
  pdfViewer.setDocument(pdfDoc);
  pdfLinkService.setDocument(pdfDoc, null);
  ```
- Updates UI elements such as page numbers and thumbnails.
- Implements scrolling, zooming, and rendering adjustments.

### Toolbar.js Functionalities

#### Initial Setup
- Initializes rotation states and configures button references.
- Handles download and print button permissions.

#### Sidebar Toggling
- Dynamically toggles classes for sidebar visibility.

#### Search Functionality
- Debounced search event handling.
- Supports keyboard shortcuts (`Ctrl+F`, `Cmd+F`, `Escape`) for opening and closing the search bar.

#### Pagination
- Supports navigation buttons (first, previous, next, last page).
- Enables direct page number input for navigation.

#### Zoom Controls
- Implements zoom in, zoom out, and scale selection.

#### Rotations
- Allows clockwise and counterclockwise page rotation.

#### File Management
- **Download**: Converts Base64 to Blob for client download.
- **Print**: Prints the PDF from a Base64 Blob within an iframe.

#### Full-Screen Mode
- Enters full-screen mode and adjusts scale upon exit for consistency.

---

### Additional Features

#### Scrolling
- Highlights and scrolls to current thumbnails.
- Smooth scrolling for pages and thumbnails.

#### Dynamic Container Height
- Calculates interface element heights and adjusts the main container dynamically.

#### Error Handling
- Captures and displays errors during the PDF loading process.

---

This documentation provides an overview of the implementation's features and the usage of PDF.js services and APIs. Contributions and suggestions are welcome!
