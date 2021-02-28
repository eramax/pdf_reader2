<script>
 import Pdf from "./Pdf1.svelte";
 import Sidebar from "./Sidebar.svelte";

 let url =
   "https://uploads.codesandbox.io/uploads/user/788432d2-e404-445a-9edb-09d901099290/8qUO-pdd.pdf";
</script>


<main class="h-screen flex flex-row overflow-hidden w-full">
  <div class="w-2/12 overflow-hidden">
    <Sidebar />
  </div>

  <div class="flex-1 flex overflow-hidden w-10/12">
    <Pdf {url}/>
  </div>
</main>