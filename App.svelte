<script>
  import PdfReader from "./pdf_helper";
  import { onMount } from "svelte";
  import testHighlights from "./testHighlights";
  import Header from "./Header.svelte";

  import "pdfjs-dist/web/pdf_viewer.css";

  let url = "/assets/3.pdf";
  let highlights = testHighlights[url];
  let reader;

  onMount(async () => {
    reader = new PdfReader("viewerContainer", url, 1.5, 1, highlights);
    await reader.render();
  });
</script>

<main class="h-screen flex flex-col overflow-hidden w-full bg-gray-300">
  <div class="h-14 pt-2 overflow-hidden bg-gray-500 flex flex-row		">
    {#if reader}
      <Header
        next={reader.nextPage}
        prev={reader.prevPage}
        zoomin={reader.zoomIn}
        zoomout={reader.zoomOut}
      />
    {/if}
  </div>

  <div class="flex-1 flex overflow-hidden w-full">
    <div class="flex flex-col w-full overflow-hidden ">
      <div class="w-full" id="viewerContainer">
        <div id="viewer" class="pdfViewer" />
      </div>
    </div>
  </div>
</main>

<style>
  #viewerContainer {
    overflow: auto;

    width: 100vw;
    /* position: absolute;
    top: 10%;
    width: 83%;
    height: 80%; */
  }
</style>
