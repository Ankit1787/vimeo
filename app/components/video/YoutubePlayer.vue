<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  playerState: any
}>()

const playerContainer = ref<HTMLDivElement | null>(null)

// Initialize YouTube player inside the container
onMounted(() => {
  if (playerContainer.value) {
    props.playerState.initPlayer(playerContainer.value)
  }
})
</script>

<template>
  <div class="relative w-full aspect-video bg-black lg:rounded-xl overflow-hidden group shadow-2xl">
    <!-- YouTube player container div where the API will generate the iframe -->
    <div
      ref="playerContainer"
      class="player-container w-full h-full"
    ></div>

    <!-- Chevron Navigation Overlay (Left / Right) -->
    <!-- These match the previous/next overlays floating over the player in the Stitch design and HTML code -->
    <button
      class="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer"
      @click.stop="props.playerState.previous()"
    >
      <span class="material-symbols-outlined text-3xl">chevron_left</span>
    </button>
    <button
      class="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer"
      @click.stop="props.playerState.next()"
    >
      <span class="material-symbols-outlined text-3xl">chevron_right</span>
    </button>
  </div>
</template>

<style scoped>
/* Scoped styles to ensure the YouTube iframe fits the relative aspect-ratio wrapper */
.player-container :deep(iframe) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100% !important;
  height: 100% !important;
  border: none;
}
</style>
