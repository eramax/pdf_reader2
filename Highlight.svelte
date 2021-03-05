<script>
  export let rects,
    boundingRect,
    onClick,
    onMouseOver,
    onMouseOut,
    comment,
    isScrolledTo;
</script>

<div class="Highlight">
  <div class="Highlight__parts">
    {#each rects as rect, index}
      <div key={index} style={rect} class={`Highlight__part`} />
    {/each}
  </div>
</div>
