<script>
  import * as pdfjsLib from "pdfjs-dist/build/pdf";
  import pdfWorker from "pdfjs-dist/build/pdf.worker.entry";
  import {
    PDFViewer,
    PDFLinkService,
    PDFFindController,
    EventBus,
  } from "pdfjs-dist/web/pdf_viewer";
  //import * as pdfjsViewer from "pdfjs-dist/web/pdf_viewer";
  import PageHighlightLayer from "./PageHighlightLayer.svelte";
  import { onMount } from "svelte";
  import testHighlights from "./testHighlights";
  import "pdfjs-dist/web/pdf_viewer.css";
  import "style.css";

  export let url;
  let highlights = [];

  let containerNode;
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
  let pdfDocument;
  let viewer;

  const scaledToViewport = (scaled, viewport, usePdfCoordinates = false) => {
    const { width, height } = viewport;

    if (usePdfCoordinates) {
      return pdfToViewport(scaled, viewport);
    }

    const x1 = (width * scaled.x1) / scaled.width;
    const y1 = (height * scaled.y1) / scaled.height;

    const x2 = (width * scaled.x2) / scaled.width;
    const y2 = (height * scaled.y2) / scaled.height;

    return {
      left: x1,
      top: y1,
      width: x2 - x1,
      height: y2 - y1,
    };
  };
  const scaledPositionToViewport = (
    pageNumber,
    boundingRect,
    rects,
    usePdfCoordinates
  ) => {
    const viewport = viewer.getPageView(pageNumber - 1).viewport;
    return {
      boundingRect: scaledToViewport(boundingRect, viewport, usePdfCoordinates),
      rects: (rects || []).map((rect) =>
        scaledToViewport(rect, viewport, usePdfCoordinates)
      ),
      pageNumber,
    };
  };

  const setupEventBus = (ebus) => {
    ebus.on("pagesinit", (evt) => {
      console.log(evt);
      onDocumentReady();
    });

    ebus.on("textlayerrendered", (evt) => {
      console.log(evt);
      onTextLayerRendered();
    });
  };

  const findOrCreateContainerLayer = (container, className) => {
    let layer = container.querySelector(`.${className}`);

    if (!layer) {
      layer = document.createElement("div");
      layer.className = className;
      container.appendChild(layer);
    }

    return layer;
  };

  const findOrCreateHighlightLayer = (page_number) => {
    const textLayer = viewer.getPageView(page_number - 1).textLayer;

    if (!textLayer) {
      return null;
    }

    return findOrCreateContainerLayer(
      textLayer.textLayerDiv,
      "PdfHighlighter__highlight-layer"
    );
  };

  const renderHighlights = () => {
    console.log("renderHighlights");
    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
      const highlightLayer = findOrCreateHighlightLayer(pageNumber);
      if (highlightLayer) {
        console.log(highlightLayer);
      }
    }
  };
  const onTextLayerRendered = () => {
    renderHighlights();
  };
  const onDocumentReady = () => {
    viewer.currentScaleValue = "auto";
    //scrollRef(this.scrollTo);
  };

  const load_pdf = async (link) => {
    return await pdfjsLib.getDocument({
      url: link,
    }).promise;
  };

  const initviewer = (container, doc, ebus, linksvc, findsvc) => {
    viewer = new PDFViewer({
      container: container,
      enhanceTextSelection: true,
      removePageBorders: true,
      linkService: linksvc,
      findController: findsvc,
      eventBus: ebus,
    });
    viewer.setDocument(doc);
    linksvc.setDocument(doc);
    linksvc.setViewer(viewer);

    // debug
    window.PdfViewer = viewer;
  };

  const initHighlights = () => {};

  onMount(async () => {
    highlights = testHighlights[url] ? [...testHighlights[url]] : [];
    console.log(highlights);
    containerNode = document.querySelector("#viewerContainer");
    pdfDocument = await load_pdf(url);
    let eventBus = new EventBus();
    setupEventBus(eventBus);
    let pdfLinkService = new PDFLinkService({
      eventBus,
    });
    let pdfFindController = new PDFFindController({
      eventBus,
      linkService: pdfLinkService,
    });

    initviewer(
      containerNode,
      pdfDocument,
      eventBus,
      pdfLinkService,
      pdfFindController
    );
  });
</script>

<div class="flex flex-col w-full overflow-hidden ">
  <div class="w-full" id="viewerContainer">
    <div id="viewer" class="pdfViewer" />
  </div>
</div>

<style>
  #viewerContainer {
    overflow: auto;
    position: absolute;
    top: 10%;
    width: 83%;
    height: 80%;
  }
</style>
