const baseUrl = 'TemplateData/src/pdfjs-dist-2.10.377/';

"use strict";

if (!pdfjsLib.getDocument || !pdfjsViewer.PDFViewer) {
  alert("Please build the pdfjs-dist library using\n `gulp dist-install`");
}

const USE_ONLY_CSS_ZOOM = true;
const TEXT_LAYER_MODE = 0; // DISABLE
const MAX_IMAGE_SIZE = 1024 * 1024;
const CMAP_URL = baseUrl + "cmaps/";
const CMAP_PACKED = true;

pdfjsLib.GlobalWorkerOptions.workerSrc = baseUrl + "build/pdf.worker.js";

const DEFAULT_SCALE_DELTA = 1.1;
const MIN_SCALE = 0.25;
const MAX_SCALE = 10.0;
const DEFAULT_SCALE_VALUE = "auto";

const PDFViewerApplication = {
  pdfLoadingTask: null,
  pdfDocument: null,
  pdfViewer: null,
  pdfHistory: null,
  pdfLinkService: null,
  eventBus: null,

  /**
   * Opens PDF document specified by URL.
   * @returns {Promise} - Returns the promise, which is resolved when document
   *                      is opened.
   */
  open(params) {
    if (this.pdfLoadingTask) {
      // We need to destroy already opened document
      return this.close().then(
        function () {
          // ... and repeat the open() call.
          return this.open(params);
        }.bind(this)
      );
    }

    const url = params.url;
    const self = this;
    this.setTitle(params.title);

    // Loading document.
    const loadingTask = pdfjsLib.getDocument({
      url,
      maxImageSize: MAX_IMAGE_SIZE,
      cMapUrl: CMAP_URL,
      cMapPacked: CMAP_PACKED,
    });
    this.pdfLoadingTask = loadingTask;

    loadingTask.onProgress = function (progressData) {
      self.progress(progressData.loaded / progressData.total);
    };

    return loadingTask.promise.then(
      function (pdfDocument) {
        // Document loaded, specifying document for the viewer.
        self.pdfDocument = pdfDocument;
        self.pdfViewer.setDocument(pdfDocument);
        self.pdfLinkService.setDocument(pdfDocument);
        self.pdfHistory.initialize({ fingerprint: pdfDocument.fingerprint });

        self.loadingBar.hide();
        self.updatePageNumberView();
      },
      function (exception) {
        const message = exception && exception.message;
        console.log(message);
        self.loadingBar.hide();
      }
    );
  },

  /**
   * Closes opened PDF document.
   * @returns {Promise} - Returns the promise, which is resolved when all
   *                      destruction is completed.
   */
  close() {
    if (!this.pdfLoadingTask) {
      return Promise.resolve();
    }

    const promise = this.pdfLoadingTask.destroy();
    this.pdfLoadingTask = null;

    if (this.pdfDocument) {
      this.pdfDocument = null;

      this.pdfViewer.setDocument(null);
      this.pdfLinkService.setDocument(null, null);

      if (this.pdfHistory) {
        this.pdfHistory.reset();
      }
    }

    return promise;
  },

  get loadingBar() {
    const bar = new pdfjsViewer.ProgressBar("#pdf-loading-bar", {});

    return pdfjsLib.shadow(this, "pdf-loading-bar", bar);
  },

  setTitle: function pdfViewSetTitle(title) {
    document.getElementById("pdf-title").textContent = title;
  },

  updatePageNumberView: function pdfViewUpdatePageNumber()
  {
    const page = this.page;
    const numPages = this.pagesCount;
    const pageText = `${page}/${numPages}`;

    document.getElementById("pageNumber").textContent = pageText;
    document.getElementById("pdf-previous").disabled = page <= 1;
    document.getElementById("pdf-next").disabled = page >= numPages;
  },

  progress: function pdfViewProgress(level) {
    const percent = Math.round(level * 100);
    // Updating the bar if value increases.
    if (percent > this.loadingBar.percent || isNaN(percent)) {
      this.loadingBar.percent = percent;
    }
  },

  get pagesCount() {
    return this.pdfDocument.numPages;
  },

  get page() {
    return this.pdfViewer.currentPageNumber;
  },

  set page(val) {
    this.pdfViewer.currentPageNumber = val;
  },

  zoomIn: function pdfViewZoomIn(ticks) {
    let newScale = this.pdfViewer.currentScale;
    do {
      newScale = (newScale * DEFAULT_SCALE_DELTA).toFixed(2);
      newScale = Math.ceil(newScale * 10) / 10;
      newScale = Math.min(MAX_SCALE, newScale);
    } while (--ticks && newScale < MAX_SCALE);
    this.pdfViewer.currentScaleValue = newScale;
  },

  zoomOut: function pdfViewZoomOut(ticks) {
    let newScale = this.pdfViewer.currentScale;
    do {
      newScale = (newScale / DEFAULT_SCALE_DELTA).toFixed(2);
      newScale = Math.floor(newScale * 10) / 10;
      newScale = Math.max(MIN_SCALE, newScale);
    } while (--ticks && newScale > MIN_SCALE);
    this.pdfViewer.currentScaleValue = newScale;
  },

  fitToPage: function pdfViewFitToPage(ticks) {
    this.pdfViewer.currentScaleValue = "page-fit";
  },

  fitToWidth: function pdfViewFitToWidth(ticks) {
    this.pdfViewer.currentScaleValue = "page-width";
  },

  initUI: function pdfViewInitUI() {
    const eventBus = new pdfjsViewer.EventBus();
    this.eventBus = eventBus;

    const linkService = new pdfjsViewer.PDFLinkService({
      eventBus
    });
    this.pdfLinkService = linkService;

    this.l10n = pdfjsViewer.NullL10n;

    const container = document.getElementById("pdf-viewer");
    const pdfViewer = new pdfjsViewer.PDFViewer({
      container,
      eventBus,
      linkService,
      l10n: this.l10n,
      useOnlyCssZoom: USE_ONLY_CSS_ZOOM,
      textLayerMode: TEXT_LAYER_MODE
    });
    this.pdfViewer = pdfViewer;
    linkService.setViewer(pdfViewer);

    this.pdfHistory = new pdfjsViewer.PDFHistory({
      eventBus,
      linkService
    });
    linkService.setHistory(this.pdfHistory);

    document
      .getElementById("pdf-previous")
      .addEventListener("click", function () {
        PDFViewerApplication.page--;
      });

    document.getElementById("pdf-next").addEventListener("click", function () {
      PDFViewerApplication.page++;
    });

    document
      .getElementById("pdf-zoom-in")
      .addEventListener("click", function () {
        PDFViewerApplication.zoomIn();
      });

    document
      .getElementById("pdf-zoom-out")
      .addEventListener("click", function () {
        PDFViewerApplication.zoomOut();
      });

    document
      .getElementById("pdf-fit-to-page")
      .addEventListener("click", function () {
        PDFViewerApplication.fitToPage();
      });

    document
      .getElementById("pdf-fit-to-width")
      .addEventListener("click", function () {
        PDFViewerApplication.fitToWidth();
      });

    eventBus.on("pagesinit", function () {
      // We can use pdfViewer now, e.g. let's change default scale.
      pdfViewer.currentScaleValue = DEFAULT_SCALE_VALUE;
    });

    eventBus.on(
      "pagechanging",
      function (evt) {
        PDFViewerApplication.updatePageNumberView();
      },
      true
    );

    eventBus.on(
        "scalechanging",
        function (evt) {
            const zoomAmount = evt.scale * 100;            
            const zoomText = `${zoomAmount.toFixed(0)}%`;
            document.getElementById("zoomText").textContent = zoomText;
        }
    )
  },
};

window.PDFViewerApplication = PDFViewerApplication;

document.addEventListener(
  "DOMContentLoaded",
  function () {
    PDFViewerApplication.initUI();
  },
  true
);

const pdfCloseButton = document.getElementById("pdf-close");

pdfCloseButton.addEventListener('click', function()
{
    HidePdf();
})

function ShowPdf(url, title)
{
  const container = document.getElementById("pdf-viewer-container");
  container.style.display = "block";
    PDFViewerApplication.open({
        url: url,
        title: title
      });
}

function HidePdf()
{
  const container = document.getElementById("pdf-viewer-container");
  container.style.display = "none";
    PDFViewerApplication.close();
}
