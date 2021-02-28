<script>
 import Pdf from "./Pdf1.svelte";
 import Sidebar from "./Sidebar.svelte";

 let url =
   "/assets/1.pdf";
</script>


<main class="h-screen flex flex-row overflow-hidden w-full">
  <div class="w-2/12 overflow-hidden">
    <Sidebar />
  </div>

  <div class="flex-1 flex overflow-hidden w-10/12">
    <Pdf {url}/>
  </div>
</main>