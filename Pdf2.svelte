<script>
  import * as pdfjsLib from "pdfjs-dist";
  import pdfWorker from "pdfjs-dist/build/pdf.worker.entry";
  import "pdfjs-dist/web/pdf_viewer.css";
  import * as pdfjsViewer from "pdfjs-dist/web/pdf_viewer";
  import { onMount } from "svelte";
  import Header from "./Header.svelte";

  export let url;

  let pageNumber = 1;
  let cMapUrl = `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/cmaps/`;
  let cMapPacked = true;
  let SEARCH_FOR = "book";
  let numPages = 0;
  let pdfViewer = null;
  let ScaleValue = 1.2;
  const GetPage = async (pdfDoc, num, scale) => {
    let pg = await pdfDoc.getPage(num);
    return pg;
  };

  const zoomin = () => {
    ScaleValue += 0.1;
    pdfViewer.currentScaleValue = ScaleValue;
  };
  const zoomout = () => {
    ScaleValue -= 0.1;
    pdfViewer.currentScaleValue = ScaleValue;
  };
  const setPageScale = pdfPage => {
    var unscaledViewport = pdfPage.getViewport(1);
    var scale = Math.min(
      window.height / unscaledViewport.height,
      window.width / unscaledViewport.width
    );
    return pdfPage.getViewport(scale);
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
    const pageViewport = pdfViewer.getPageView(pageNumber - 1).viewport;

    pdfViewer.scrollPageIntoView({
      pageNumber
    });
  };
  const prev = () => {
    if (pageNumber == 1) return;
    pageNumber--;
    const pageViewport = pdfViewer.getPageView(pageNumber - 1).viewport;

    pdfViewer.scrollPageIntoView({
      pageNumber
    });
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
    var container = document.getElementById("viewerContainer");
    var eventBus = new pdfjsViewer.EventBus();

    var pdfLinkService = new pdfjsViewer.PDFLinkService({
      eventBus
    });

    // (Optionally) enable find controller.
    var pdfFindController = new pdfjsViewer.PDFFindController({
      eventBus,
      linkService: pdfLinkService
    });

    pdfViewer = new pdfjsViewer.PDFViewer({
      container,
      eventBus,
      annotationLayerFactory: new pdfjsViewer.DefaultAnnotationLayerFactory(),
      linkService: pdfLinkService,
      findController: pdfFindController,
      removePageBorders: true,
      enableWebGL: true,
      renderer: "svg",
      enhanceTextSelection: true,
      textLayerMode: 2
    });

    // Fetch the PDF document from the URL using promises.
    var loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(function(doc) {
      // Use a promise to fetch and render the next page.
      var promise = Promise.resolve();

      for (var i = 1; i <= doc.numPages; i++) {
        promise = promise.then(
          function(pageNum) {
            doc.getPage(pageNum).then(function(pdfPage) {
              // Create the page view.
              var pdfPageView = new pdfjsViewer.PDFPageView({
                container,
                id: pageNum,
                scale: ScaleValue,
                defaultViewport: setPageScale(pdfPage), //pdfPage.getViewport({ scale: ScaleValue }),
                eventBus,
                annotationLayerFactory: new pdfjsViewer.DefaultAnnotationLayerFactory(),
                textLayerFactory: new pdfjsViewer.DefaultTextLayerFactory(),
                renderInteractiveForms: true,
                removePageBorders: true,
                enableWebGL: true,
                renderer: "svg",
                enhanceTextSelection: true
              });

              // Associate the actual page with the view and draw it.
              pdfPageView.setPdfPage(pdfPage);
              pdfPageView.draw();
            });
          }.bind(null, i)
        );
      }
    });

    // loadPdf(url).then(async pdf => {
    //   numPages = pdf.numPages;
    //   let pdfPage = await GetPage(pdf, 1, ScaleValue);
    //   console.log(pdfPage);

    //   var pdfPageView = new pdfjsViewer.PDFPageView({
    //     container: container,
    //     id: 1,
    //     scale: ScaleValue,
    //     defaultViewport: pdfPage.getViewport({ scale: ScaleValue }),
    //     // We can enable text/annotations layers, if needed
    //     textLayerFactory: new pdfjsViewer.DefaultTextLayerFactory(),
    //     annotationLayerFactory: new pdfjsViewer.DefaultAnnotationLayerFactory()
    //   });

    //   // Associates the actual page with the view, and drawing it
    //   pdfPageView.setPdfPage(pdfPage);
    //   pdfPageView.draw();
    // });
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
