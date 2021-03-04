<script>
    import * as pdfjsLib from "pdfjs-dist/build/pdf";
    import pdfWorker from "pdfjs-dist/build/pdf.worker.entry";
    import * as pdfjsViewer from "pdfjs-dist/web/pdf_viewer";
    import {onMount} from "svelte";
    import Header from "./Header.svelte";
    //import "pdfjs-dist/web/pdf_viewer.css";

    export let url;
    let pdfViewer = null
    let pageNumber = 2;
    let scale = 1.5;
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker
    const eventBus = new pdfjsViewer.EventBus();
    const pdfLinkService = new pdfjsViewer.PDFLinkService({
        eventBus
    });
    const pdfFindController = new pdfjsViewer.PDFFindController({
        eventBus,
        linkService: pdfLinkService
    });

    onMount(() => {
        const container = document.querySelector('#pdf-wrapper');
        const loadingTask = pdfjsLib.getDocument({url});
        loadingTask.promise.then(function (pdfDocument) {
            // Document loaded, retrieving the page.
            pdfDocument.getPage(pageNumber).then(function (pdfPage) {
                // Creating the page view with default parameters.
                pdfViewer = new pdfjsViewer.PDFPageView({
                    container: container,
                    id: pageNumber,
                    scale: 2,
                    defaultViewport: pdfPage.getViewport({scale}),
                    eventBus: eventBus,
                    annotationLayerFactory: new pdfjsViewer.DefaultAnnotationLayerFactory(),
                    textLayerFactory: new pdfjsViewer.DefaultTextLayerFactory(),
                    linkService: pdfLinkService,
                    findController: pdfFindController,
                    removePageBorders: true,
                    enableWebGL: true,
                    //renderer: "svg",
                    enhanceTextSelection: true,
                    textLayerMode: 2,
                    renderInteractiveForms: true

                });
                globalThis.pdfViewer = pdfViewer
                // Associates the actual page with the view, and drawing it
                pdfViewer.setPdfPage(pdfPage);
                pdfViewer.draw();
            });
        });
    })

    const remove = () => {
        pdfViewer.cleanup();
        pdfViewer = null;
    }
</script>
<style>
    #pdf-wrapper {
        border: 1px solid black;
        position: relative;
        width: 100%;
        overflow: auto;
    }
</style>
<div class="flex flex-col w-full overflow-hidden ">

    <Header zoomin={() => pdfViewer.currentScale+=0.25} zoomout={() => pdfViewer.currentScale-=0.25}
            next={() => pageNumber++} prev={() => pageNumber--}/>
    <div id="pdf-wrapper"></div>
</div>