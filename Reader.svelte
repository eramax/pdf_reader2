<script>
  import * as pdfjsLib from "pdfjs-dist/build/pdf";
  import pdfWorker from "pdfjs-dist/build/pdf.worker.entry";
  import * as pdfjsViewer from "pdfjs-dist/web/pdf_viewer";
  import { onMount } from "svelte";
  import "pdfjs-dist/web/pdf_viewer.css";

  export let url;
  let containerNode;
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
  let pdfDocument;
  let viewer;

  const setupEventBus = (ebus) => {
    ebus.on("pagesinit", (evt) => {
      console.log(evt);
      onDocumentReady();
    });

    ebus.on("textlayerrendered", (evt) => {
      console.log(evt);
      onDocumentReady();
    });
  };

  const renderHighlights = () => {};
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
    viewer = new pdfjsViewer.PDFViewer({
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
    window.PdfViewer = this;
  };

  onMount(async () => {
    containerNode = document.querySelector("#viewerContainer");
    pdfDocument = await load_pdf(url);
    let eventBus = new pdfjsViewer.EventBus();
    setupEventBus(eventBus);
    let pdfLinkService = new pdfjsViewer.PDFLinkService({
      eventBus,
    });
    let pdfFindController = new pdfjsViewer.PDFFindController({
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
