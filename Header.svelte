<script>
  export let prev;
  export let next;
  export let zoomin;
  export let zoomout;
</script>

<div class="h-10 overflow-hidden bg-gray-500 flex flex-row text-sm">
  <svg
    class="fill-current text-yellow-500 w-16"
    version="1.1"
    id="Capa_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    x="0px"
    y="0px"
    viewBox="0 0 512 512"
    style="enable-background:new 0 0 512 512;"
    xml:space="preserve"
  >
    <g>
      <g>
        <path
          d="M481,206.522V95.234l-110.167,41.968c-1.462-35.104-12.774-67.976-32.233-93.272C316.809,15.602,287.474,0,256,0
			s-60.809,15.602-82.6,43.931c-19.459,25.296-30.771,58.168-32.233,93.272L31,95.234v111.288C12.666,215.452,0,234.273,0,256
			s12.666,40.548,31,49.478v121.814L250.614,512h10.771L481,427.292V305.478c18.334-8.93,31-27.751,31-49.478
			S499.334,215.452,481,206.522z M241,476.137L61,406.708v-96.041c27.514-3,49-26.367,49-54.667s-21.486-51.667-49-54.667v-62.568
			l180,68.572V476.137z M451,201.333c-27.514,3-49,26.367-49,54.667s21.486,51.667,49,54.667v96.042l-180,69.428v-268.8l180-68.572
			V201.333z"
        />
      </g>
    </g>
  </svg>

  <button
    on:click={prev}
    class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center mr-4 w-auto"
  >
    Prev
  </button>

  <button
    on:click={next}
    class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center mr-4 w-auto"
  >
    Next
  </button>

  <button
    on:click={zoomin}
    class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center mr-4 w-auto"
  >
    Zoom in
  </button>

  <button
    on:click={zoomout}
    class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center mr-4 w-auto"
  >
    Zoom out
  </button>

  <button
    class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center mr-4 w-auto"
  >
    Read
  </button>

  <button
    class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center mr-4 w-auto"
  >
    Highlight
  </button>
</div>
