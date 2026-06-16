<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useVideoPlayer, type VideoItem } from '~/composables/useVideoPlayer'
import VideoPlayer from '~/components/video/VideoPlayer.vue'

const isServer = import.meta.server

// Load Google Fonts and Material Icons using useHead
useHead({
  title: 'VideoVerse | Showcase Playlist',
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Geist:wght@500;600&display=swap'
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'
    }
  ]
})

// Showcase input state
const showcaseIdInput = ref('2488468')
const loadedShowcaseId = ref('')
const isLoading = ref(false)
const errorMsg = ref('')
const isPasswordProtected = ref(false)
const renderNativeEmbed = ref(false)

// Showcase Details
const showcaseTitle = ref('Showcase Playlist')
const showcaseDesc = ref('Curated video playlist fetched dynamically from Vimeo.')

// Dynamic Video Playlist
const videos = ref<VideoItem[]>([])

// Initialize Video Player Composable
const playerState = useVideoPlayer(videos)

// Fetch showcase videos from our Nuxt API
const fetchShowcaseVideos = async (id: string) => {
  const cleanId = id.trim()
  if (!cleanId) return

  isLoading.value = true
  errorMsg.value = ''
  isPasswordProtected.value = false
  renderNativeEmbed.value = false

  try {
    const res = await $fetch<any>(`/api/vimeo/showcase/${cleanId}`)

    if (res && res.success) {
      showcaseTitle.value = res.showcase?.name || 'Showcase Series'
      showcaseDesc.value = res.showcase?.description || 'Curated video playlist fetched dynamically from Vimeo.'

      if (res.videos && res.videos.length > 0) {
        videos.value = res.videos
        loadedShowcaseId.value = cleanId

        // Reset player index to 0
        playerState.currentIndex.value = 0

        // Load the first video in the player in the background without blocking the UI loading state
        if (playerState.containerRef.value) {
          playerState.changeVideo(0).catch(err => {
            console.error('Failed to change video in player:', err)
          })
        }
      } else {
        videos.value = []
        errorMsg.value = 'No videos found in this showcase.'
      }
    } else {
      // If the showcase fails, check if it's password protected or restricted
      videos.value = []
      if (cleanId === '12107219' || res?.isPasswordProtected || (res && res.error && res.error.toLowerCase().includes('password')) || (res && res.error && res.error.toLowerCase().includes('unauthorized'))) {
        isPasswordProtected.value = true
      }
      // Set native iframe mode as a fallback
      renderNativeEmbed.value = true
      loadedShowcaseId.value = cleanId
    }
  } catch (err: any) {
    console.error('API error fetching showcase:', err)
    videos.value = []
    errorMsg.value = err.data?.message || err.message || 'Error connecting to showcase API.'

    // Set native iframe mode as fallback
    renderNativeEmbed.value = true
    loadedShowcaseId.value = cleanId
  } finally {
    isLoading.value = false
  }
}

// Subscriber Toggle State
const isSubscribed = ref(false)
const toggleSubscribe = () => {
  isSubscribed.value = !isSubscribed.value
}

// Description Expand Toggle
const isExpanded = ref(false)
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

// Comments State
interface CommentItem {
  id: number | string
  author: string
  avatar: string
  content: string
  timeAgo: string
  likes: number
  hasLiked: boolean
  showReplyInput: boolean
  replyText: string
  replies: any[]
}

// const comments = ref<CommentItem[]>([])
// const commentInputText = ref('')

// const loadComments = async () => {
//   const videoId = playerState.currentVideo.value?.vimeoId
//   if (!videoId) {
//     comments.value = []
//     return
//   }
//   try {
//     const data = await $fetch<{ comments: CommentItem[] }>(`/api/comments?videoId=${videoId}`)
//     if (data && data.comments) {
//       comments.value = data.comments
//     } else {
//       comments.value = []
//     }
//   } catch (err) {
//     console.error('Failed to load comments:', err)
//     comments.value = []
//   }
// }

// watch(() => playerState.currentIndex.value, () => {
//   loadComments()
// })

// Listen to video changes when the playlist array finishes loading
// watch(() => videos.length, (newLength) => {
//   if (newLength > 0) {
//     loadComments()
//   }
// })

// const handleAddComment = async () => {
//   const text = commentInputText.value.trim()
//   if (!text) return

//   const videoId = playerState.currentVideo.value?.vimeoId
//   if (!videoId) return

//   // Optimistic local add
//   const tempComment = {
//     id: Date.now(),
//     author: 'You (Viewer)',
//     avatar: '',
//     content: text,
//     timeAgo: 'Just now',
//     likes: 0,
//     hasLiked: false,
//     showReplyInput: false,
//     replyText: '',
//     replies: []
//   }
//   comments.value.unshift(tempComment)
//   commentInputText.value = ''

//   try {
//     const res = await $fetch<any>(`/api/comments?videoId=${videoId}`, {
//       method: 'POST',
//       body: { text }
//     })

//     if (res && res.success && res.comment) {
//       const idx = comments.value.findIndex(c => c.id === tempComment.id)
//       if (idx !== -1) {
//         comments.value[idx] = res.comment
//       }
//     } else {
//       comments.value = comments.value.filter(c => c.id !== tempComment.id)
//       alert('Failed to add comment.')
//     }
//   } catch (err: any) {
//     console.error('Failed to add comment:', err)
//     comments.value = comments.value.filter(c => c.id !== tempComment.id)
//     alert(`Failed to add comment: ${err.data?.message || err.message || 'Unknown error'}`)
//   }
// }

// const toggleLikeComment = (comment: CommentItem) => {
//   comment.hasLiked = !comment.hasLiked
//   if (comment.hasLiked) {
//     comment.likes++
//   } else {
//     comment.likes--
//   }
// }

onMounted(() => {
  // Load default showcase
  fetchShowcaseVideos(showcaseIdInput.value)

  // Arrow keys listener
  const handleKeydown = (event: KeyboardEvent) => {
    if (videos.value.length === 0) return
    if (event.key === 'ArrowRight') {
      playerState.next()
    } else if (event.key === 'ArrowLeft') {
      playerState.previous()
    }
  }

  window.addEventListener('keydown', handleKeydown)

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
})
</script>

<template>
  <div class="min-h-screen bg-background text-on-background font-body-md pb-16 lg:pb-10">

    <!-- ==================== HEADER BANNER ==================== -->
    <div v-if="videos.length > 0" class="max-w-[1440px] mx-auto px-4 lg:px-gutter py-12 cursor-default">
      <div class="bg-[#1b3d36] rounded-xl p-8 md:px-10 md:py-8 flex flex-col justify-center text-white soft-elevation">
        <h1 class="font-display text-2xl md:text-3xl font-bold uppercase tracking-wide mb-2">
          {{ showcaseTitle }}
        </h1>
        <p class="font-body-md text-xs md:text-sm text-white/90 leading-relaxed max-w-5xl">
          {{ showcaseDesc }}
        </p>
      </div>
    </div>

    <!-- ==================== MAIN CONTENT GRID ==================== -->
    <div v-if="videos.length > 0 || renderNativeEmbed" class="max-w-[1440px] mx-auto px-4 lg:px-gutter pt-8">
      <!-- Native Embed Mode (For password protected or restricted showcases) -->
      <div v-if="renderNativeEmbed" class="max-w-5xl mx-auto space-y-6 pb-12">
        <div
          class="bg-error-container border border-error/20 rounded-xl p-5 md:p-6 text-on-error-container flex flex-col md:flex-row items-start gap-4 select-none cursor-default">
          <span class="material-symbols-outlined text-3xl text-error">lock</span>
          <div class="flex-1 space-y-1">
            <h3 class="font-display font-bold text-lg text-error">Password Protected Showcase (ID: {{ loadedShowcaseId
            }})</h3>
            <p class="text-sm leading-relaxed">
              This showcase is password-protected on Vimeo. Because of Vimeo's security model, the Vimeo API does not
              allow programmatic retrieval of the video list from password-protected albums or showcases.
              <br><br>
              <strong>We have embedded the native Vimeo Showcase player below. Please enter the password directly inside
                the video player</strong> to unlock the playlist and browse videos.
            </p>
          </div>
        </div>

        <div
          class="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl bg-black border border-outline-variant">
          <iframe :src="`https://vimeo.com/showcase/${loadedShowcaseId}/embed`"
            class="absolute top-0 left-0 w-full h-full border-none" allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen></iframe>
        </div>
      </div>

      <!-- Custom API Player & Sidebar Mode -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

        <!-- COLUMN 1 (LEFT): VIDEO DETAILS (rendered 2nd on mobile, 1st on desktop) -->
        <div class="order-2 lg:order-1 lg:col-span-3 space-y-2 cursor-default">
          <h2 class="text-xl lg:text-2xl font-bold uppercase tracking-tight text-on-surface">
            {{ playerState?.currentVideo?.value?.title }}
          </h2>
          <div class="text-on-surface-variant text-sm leading-relaxed whitespace-pre-line lg:max-h-[380px] lg:overflow-y-auto lg:pr-2 custom-scrollbar">
            {{ playerState?.currentVideo?.value?.description }}
          </div>
        </div>

        <!-- COLUMN 2 (MIDDLE): PLAYER (rendered 1st on mobile, 2nd on desktop) -->
        <div class="order-1 float-right lg:order-2 lg:col-span-7">
          <div class=" h-full ">
            <VideoPlayer :player-state="playerState" />
          </div>
        </div>

        <!-- COLUMN 3 (RIGHT): PLAYLIST SIDEBAR (rendered 3rd on both) -->
        <div class="order-3 lg:order-3 lg:col-span-2 space-y-3">
          
          <!-- Autoplay Toggle Switch -->
          <div class="flex justify-between items-center pb-2 select-none border-b border-outline-variant/30">
            <span class="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Autoplay</span>
            <button
              class="w-9 h-5 rounded-full relative cursor-pointer transition-colors duration-300 ease-in-out shadow-inner focus:outline-none shrink-0"
              :class="playerState.autoplayNext.value ? 'bg-primary' : 'bg-secondary/40'"
              @click="playerState.autoplayNext.value = !playerState.autoplayNext.value">
              <div
                class="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ease-in-out shadow"
                :class="playerState.autoplayNext.value ? 'translate-x-4.5' : 'translate-x-0.5'"></div>
            </button>
          </div>

          <!-- Videos List (Vertical Stack of Thumbnails matching mockup) -->
          <div class="space-y-3 max-h-[500px] lg:max-h-[410px] overflow-y-auto pr-1 custom-scrollbar">
            <div v-for="(video, index) in videos" :key="video.id"
              class="relative aspect-video group cursor-pointer transition-all duration-300 "
              :class="{ 'ring-2 ring-primary': playerState.currentIndex.value === index }"
              @click="playerState.changeVideo(index)">
              
              <!-- Thumbnail Image -->
              <img :src="video.thumbnail || 'https://vimeo.com/assets/images/default_avatar.png'"
                alt="Video thumbnail"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102" />
              
              <!-- Duration Badge -->
              <span class="absolute bottom-1.5 right-1.5 bg-black/75 text-white text-[9px] px-1 rounded font-semibold select-none">
                {{ video.duration }}
              </span>

              <!-- Play Icon Overlay (Mockup Style: Centered circular play button) -->
              <div
                class="absolute inset-0 bg-black/25 flex items-center justify-center transition-all duration-300 group-hover:bg-black/40">
                <div class="w-8 h-8 rounded-full bg-white/90 text-black flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-md">
                  <span class="material-symbols-outlined text-base leading-none translate-x-[0.5px]">play_arrow</span>
                </div>
              </div>

              <!-- Active Playing Overlay -->
              <div v-if="playerState.currentIndex.value === index"
                class="absolute inset-0 bg-primary/15 flex items-center justify-center pointer-events-none">
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
/* Custom styled thin scrollbar for playlist and comments */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-outline-variant);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary);
}
</style>
