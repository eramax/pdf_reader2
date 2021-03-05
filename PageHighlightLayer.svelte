<script>
  import Highlight from "./Highlight.svelte";
  export let highlights = [];
</script>

{#each highlights as highlight}
  <Highlight
    key={highlight.id}
    isScrolledTo={false}
    position={highlight.position}
    comment={highlight.comment}
  />
{/each}
