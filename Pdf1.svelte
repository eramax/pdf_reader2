<script>
  import * as pdfjsLib from "pdfjs-dist";
  import pdfWorker from "pdfjs-dist/build/pdf.worker.entry";
  import * as pdfjsViewer from "pdfjs-dist/web/pdf_viewer";
  import { onMount } from "svelte";
  import Header from "./Header.svelte";
  import "pdfjs-dist/web/pdf_viewer.css";

  export let url;

  let pageNumber = 1;
  let cMapUrl = `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/cmaps/`;
  let cMapPacked = true;
  let SEARCH_FOR = "book";
  let numPages = 0;
  let pdfViewer = null;
  let ScaleValue = 1;
  const GetPage = async (pdfDoc, num) => {
    let pg = await pdfDoc.getPage(num);
    return pg;
  };

  const zoomin = () => {
    ScaleValue += 0.1;
    pdfViewer.currentScale = ScaleValue;
  };
  const zoomout = () => {
    ScaleValue -= 0.1;
    pdfViewer.currentScale = ScaleValue;
  };
  const scaledToViewport = (scaled, viewport) => {
    const { width, height } = viewport;

    if (scaled.x1 === undefined) {
      throw new Error("You are using old position format, please update");
    }

    const x1 = (width * scaled.x1) / scaled.width;
    const y1 = (height * scaled.y1) / scaled.height;

    const x2 = (width * scaled.x2) / scaled.width;
    const y2 = (height * scaled.y2) / scaled.height;

    return {
      left: x1,
      top: y1,
      width: x2 - x1,
      height: y2 - y1
    };
  };
  const next = () => {
    if (pageNumber >= numPages) return;
    pageNumber++;
    pdfViewer.currentPageNumber = pageNumber;
    // const pageViewport = pdfViewer.getPageView(pageNumber - 1).viewport;
    //
    // pdfViewer.scrollPageIntoView({
    //   pageNumber
    // });
  };
  const prev = () => {
    if (pageNumber == 1) return;
    pageNumber--;
    pdfViewer.currentPageNumber = pageNumber;
    // const pageViewport = pdfViewer.getPageView(pageNumber - 1).viewport;
    //
    // pdfViewer.scrollPageIntoView({
    //   pageNumber
    // });
  };
  const loadPdf = async link => {
    console.log(link);
    return await pdfjsLib.getDocument({
      url: link,
      cMapUrl: cMapUrl,
      cMapPacked: cMapPacked
    }).promise;
  };

  onMount(async () => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
    const eventBus = new pdfjsViewer.EventBus();
    const container = document.getElementById("viewerContainer");
    // (Optionally) enable hyperlinks within PDF files.
    const pdfLinkService = new pdfjsViewer.PDFLinkService({
      eventBus
    });

    // (Optionally) enable find controller.
    const pdfFindController = new pdfjsViewer.PDFFindController({
      eventBus,
      linkService: pdfLinkService
    });

    pdfViewer = new pdfjsViewer.PDFSinglePageViewer({
      container,
      eventBus,
      annotationLayerFactory: new pdfjsViewer.DefaultAnnotationLayerFactory(),
      textLayerFactory: new pdfjsViewer.DefaultTextLayerFactory(),
      linkService: pdfLinkService,
      findController: pdfFindController,
      removePageBorders: true,
      enableWebGL: true,
      renderer: "svg",
      enhanceTextSelection: true,
      textLayerMode: 2,
      renderInteractiveForms: true
    });


    window.viewer = pdfViewer;
    pdfLinkService.setViewer(pdfViewer);

    eventBus.on("pagesinit", function() {
      // We can use pdfViewer now, e.g. let's change default scale.
      pdfViewer.currentScaleValue = ScaleValue;//"page-width"; //page-fit
      // We can try searching for things.
      if (SEARCH_FOR) {
        pdfFindController.executeCommand("find", { query: SEARCH_FOR });
      }
    });

    loadPdf(url).then(pdf => {
      numPages = pdf.numPages;
      pdfViewer.setDocument(pdf);
      pdfLinkService.setDocument(pdf, null);
    });

    globalThis.pdfViewer = pdfViewer


  });
</script>
<style>
  #viewerContainer {
    overflow: auto;
    position: absolute;
    top: 10%;
    width: 83%;
    height: 80%;
  }
</style>

<div class="flex flex-col w-full overflow-hidden ">
<Header  {prev} {next} {zoomin} {zoomout} />

<div class="w-full" id="viewerContainer">
  <div id="viewer" class="pdfViewer" />
</div>
</div>