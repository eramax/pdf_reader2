<script>
  import PdfReader from "./pdf_helper";
  import { onMount } from "svelte";
  import testHighlights from "./testHighlights";
  import Header from "./Header.svelte";

  import "pdfjs-dist/web/pdf_viewer.css";

  export let url;
  let highlights = testHighlights[url];
  let reader = null;

  onMount(async () => {
    reader = new PdfReader("viewerContainer", url, 1.5, 1, highlights);
    await reader.render();
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
    width: 100vw;
    /* position: absolute;
    top: 10%;
    width: 83%;
    height: 80%; */
  }
</style>
