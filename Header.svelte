<script>
  export let prev;
  export let next;
  export let zoomin;
  export let zoomout;
</script>

<div class="flex flex-row">
	<button on:click={prev} class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-4">
		Prev
	</button>

	<button on:click={next} class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-4">
		Next
	</button>

	<button on:click={zoomin} class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-4">
		Zoom +
	</button>

	<button on:click={zoomout} class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-4">
		Zoom -
	</button>

	<button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-4">
		Read
	</button>

	<button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-4">
		...
	</button>

</div>