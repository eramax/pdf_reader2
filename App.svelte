<script>
  import Reader from "./Reader2.svelte";
  import Header from "./Header.svelte";

  let url = "/assets/3.pdf";
</script>

<main class="h-screen flex flex-col overflow-hidden w-full bg-gray-300">
  <div class="h-14 pt-2 overflow-hidden bg-gray-500 flex flex-row		">
    <Header />
  </div>

  <div class="flex-1 flex overflow-hidden w-full">
    <Reader {url} />
  </div>
</main>
