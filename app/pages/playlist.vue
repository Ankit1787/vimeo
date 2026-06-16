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
const showcaseIdInput = ref('8449374')
const loadedShowcaseId = ref('')
const isLoading = ref(false)
const errorMsg = ref('')
const isPasswordProtected = ref(false)

// Showcase Details
const showcaseTitle = ref('Showcase Playlist')
const showcaseDesc = ref('Curated video playlist fetched dynamically from Vimeo.')

// Dynamic Video Playlist
const videos = reactive<VideoItem[]>([])

// Initialize Video Player Composable
const playerState = useVideoPlayer(videos)

// Fetch showcase videos from our Nuxt API
const fetchShowcaseVideos = async (id: string) => {
  const cleanId = id.trim()
  if (!cleanId) return

  isLoading.value = true
  errorMsg.value = ''
  isPasswordProtected.value = false

  try {
    const res = await $fetch<any>(`/api/showcase?showcaseId=${cleanId}`)

    if (res && res.success) {
      showcaseTitle.value = res.showcaseTitle || 'Showcase Series'
      showcaseDesc.value = res.showcaseDesc || 'Curated video playlist fetched dynamically from Vimeo.'

      if (res.data && res.data.length > 0) {
        // Update the reactive array in-place so playerState maintains correct references
        videos.splice(0, videos.length, ...res.data)
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
        videos.splice(0, videos.length)
        errorMsg.value = 'No videos found in this showcase.'
      }
    } else {
      // If the showcase fails, check if it's password protected
      videos.splice(0, videos.length)
      if (cleanId === '12107219' || (res && res.error && res.error.toLowerCase().includes('password'))) {
        isPasswordProtected.value = true
      } else {
        errorMsg.value = res?.error || 'Failed to load showcase. Please check the ID.'
      }
    }
  } catch (err: any) {
    console.error('API error fetching showcase:', err)
    videos.splice(0, videos.length)
    errorMsg.value = err.data?.message || err.message || 'Error connecting to showcase API.'
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
    if (videos.length === 0) return
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

    <!-- ==================== SEARCH / SELECTOR BAR ==================== -->
    <div
      class="bg-surface-container-low border-b border-outline-variant py-4 sticky top-[0px] z-30 shadow-sm select-none cursor-default">
      <div
        class="max-w-[1440px] mx-auto px-4 lg:px-gutter flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex flex-col gap-1 w-full md:w-auto">
          <h2 class="text-primary font-display font-semibold text-sm uppercase tracking-wider">Vimeo Showcase
            Integration</h2>
          <p class="text-xs text-on-surface-variant">Paste a Showcase ID or URL below to load its videos</p>
        </div>

        <div class="flex items-center gap-2">
          <div class="relative w-full">
            <span class="material-symbols-outlined absolute left-3 top-1 text-sm text-on-surface-variant">link</span>
            <input v-model="showcaseIdInput" type="text"
              class="w-full bg-background border border-outline rounded-lg pl-9 pr-4 py-2 text-xs text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="e.g. 8449374 or showcase URL" @keyup.enter="fetchShowcaseVideos(showcaseIdInput)" />
          </div>
          <button
            class="bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold px-4 py-2.5 rounded-lg active:scale-95 transition-all shadow-md shrink-0 flex items-center gap-1 cursor-pointer"
            :disabled="isLoading" @click="fetchShowcaseVideos(showcaseIdInput)">
            <span v-if="isLoading"
              class="animate-spin inline-block w-3 h-3 border-2 border-on-primary border-t-transparent rounded-full mr-1"></span>
            {{ isLoading ? 'Loading...' : 'Load' }}
          </button>
        </div>
      </div>

      <!-- Quick Links / Presets -->
      <!-- <div class="max-w-[1440px] mx-auto px-4 lg:px-gutter mt-2.5 flex flex-wrap gap-2 items-center">
        <span class="text-[10px] uppercase font-bold text-on-surface-variant">Presets:</span>
        <button
          class="bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant rounded px-2.5 py-1 text-[10px] font-semibold text-primary transition-all cursor-pointer"
          @click="showcaseIdInput = '8449374'; fetchShowcaseVideos('8449374')">
          Public Showcase (8449374)
        </button>
        <button
          class="bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant rounded px-2.5 py-1 text-[10px] font-semibold text-[#723600] transition-all cursor-pointer"
          @click="showcaseIdInput = '12107219'; fetchShowcaseVideos('12107219')">
          Password Protected (12107219)
        </button>
      </div> -->
    </div>

    <!-- ==================== PASSWORD RESTRICTION WARNING ==================== -->
    <div v-if="isPasswordProtected" class="max-w-[1440px] mx-auto px-4 lg:px-gutter pt-6">
      <div
        class="bg-error-container border border-error/20 rounded-xl p-5 md:p-6 text-on-error-container flex flex-col md:flex-row items-start gap-4">
        <span class="material-symbols-outlined text-3xl text-error">lock</span>
        <div class="flex-1 space-y-2">
          <h3 class="font-display font-bold text-lg text-error">Password Protected Showcase (12107219)</h3>
          <p class="text-sm leading-relaxed">
            This showcase is password-protected on Vimeo. Because of Vimeo's security model, the Vimeo API does not
            allow programmatic retrieval of the video list from password-protected albums or showcases.
          </p>
          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <a href="https://vimeo.com/showcase/12107219?share=copy&fl=sm&fe=fs" target="_blank"
              class="bg-error text-on-error text-xs font-bold px-4 py-2 rounded-lg hover:bg-error/90 active:scale-95 transition-all text-center inline-block cursor-pointer shadow-sm">
              Open on Vimeo (Needs Password)
            </a>
            <button
              class="border border-outline hover:bg-surface-container-high text-on-surface text-xs font-semibold px-4 py-2 rounded-lg transition-all text-center inline-block cursor-pointer"
              @click="showcaseIdInput = '8449374'; fetchShowcaseVideos('8449374')">
              Try Public Showcase instead
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== ERROR BANNER ==================== -->
    <div v-if="errorMsg && !isPasswordProtected" class="max-w-[1440px] mx-auto px-4 lg:px-gutter pt-6">
      <div
        class="bg-error-container border border-error/20 rounded-xl p-5 text-on-error-container flex items-center gap-3">
        <span class="material-symbols-outlined text-2xl text-error">warning</span>
        <div>
          <h4 class="font-semibold text-sm">Failed to Load Showcase</h4>
          <p class="text-xs mt-0.5">{{ errorMsg }}</p>
        </div>
      </div>
    </div>

    <!-- ==================== HEADER BANNER ==================== -->
    <div v-if="videos.length > 0" class="max-w-[1440px] mx-auto px-4 lg:px-gutter pt-6  cursor-default">
      <div
        class="bg-[#1a3a34] rounded-xl p-8 md:p-10 flex flex-col justify-center text-white relative overflow-hidden soft-elevation">
        <div class="relative z-10 max-w-3xl">
          <span
            class="bg-white/10 text-white/90 border border-white/20 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-3 inline-block">Active
            Showcase</span>
          <h1 class="font-display text-2xl md:text-4xl mb-4 font-bold uppercase tracking-tight">{{ showcaseTitle }}</h1>
          <p class="font-body-md text-sm md:text-base text-white/90 leading-relaxed">
            {{ showcaseDesc }}
          </p>
        </div>
        <div class="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
      </div>
    </div>

    <!-- ==================== MAIN CONTENT GRID ==================== -->
    <div v-if="videos.length > 0" class="max-w-[1440px] mx-auto px-4 lg:px-gutter pt-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

        <!-- LEFT COLUMN: PLAYER & METADATA -->
        <div class="lg:col-span-8 space-y-6">

          <!-- Vimeo Player Wrapper -->
          <div class="bg-black lg:rounded-xl  shadow-2xl">
            <VideoPlayer :player-state="playerState" />
          </div>

          <!-- Video Details Card -->
          <div
            class="bg-surface-container-low border border-outline-variant p-6 lg:p-8 rounded-xl shadow-sm space-y-6 transition-all duration-300 hover:shadow-md  cursor-default">
            <div class="flex flex-col  justify-between items-start gap-4 mb-4">
              <div>
                <h1
                  class="font-headline-lg text-xl lg:text-3xl text-on-surface mb-2 font-bold uppercase tracking-tight">
                  {{ playerState?.currentVideo?.value?.title }}
                </h1>
                <div class="flex items-center gap-4 text-on-surface-variant font-body-md text-sm select-none">
                  <div class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-lg leading-none">visibility</span>
                    <span>{{ playerState?.currentVideo?.value?.views }}</span>
                  </div>
                  <span class="w-1 h-1 bg-outline-variant rounded-full"></span>
                  <div class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-lg leading-none">schedule</span>
                    <span>{{ playerState?.currentVideo?.value?.timeAgo }}</span>
                  </div>
                </div>
              </div>
              <!-- Action Buttons (Share, Like, Flag) -->
              <div class="flex items-center gap-2 mt-2 sm:mt-0 text-slate-500">
                <button
                  class="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-500 hover:text-primary active:scale-90">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                  </svg>
                </button>
                <button
                  class="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-500 hover:text-primary active:scale-90">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                  </svg>
                </button>
                <button
                  class="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-500 hover:text-primary active:scale-90">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                      stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Creator / Channel Info Bar -->
            <div class="flex items-center gap-4 py-6 border-t border-outline-variant mb-2">
              <img alt="Creator Avatar" class="w-12 h-12 rounded-full border border-outline-variant shadow-sm"
                :src="playerState.currentVideo?.value?.creatorAvatar" />
              <div class="flex-1">
                <h4 class="font-headline-md text-base lg:text-lg text-on-surface font-semibold">
                  {{ playerState.currentVideo?.value?.creator }}
                </h4>
                <p class="font-body-md text-xs lg:text-sm text-on-surface-variant">
                  {{ playerState.currentVideo?.value?.subscribers }}
                </p>
              </div>
              <!-- <button
                class="px-6 py-2 rounded-full font-label-md text-sm lg:text-md font-bold transition-all duration-300 active:scale-95 cursor-pointer shadow-sm"
                :class="isSubscribed ? 'bg-surface-container-highest text-on-surface-variant border border-outline-variant' : 'bg-on-surface text-surface hover:bg-primary hover:text-white'"
                @click="toggleSubscribe"
              >
                {{ isSubscribed ? 'Subscribed' : 'Subscribe' }}
              </button> -->
            </div>

            <!-- Expandable Video Description -->
            <div class="text-on-surface-variant font-body-md text-sm leading-relaxed">
              <p :class="{ 'line-clamp-3': !isExpanded && !isServer }">
                {{ playerState.currentVideo?.value?.description }}
              </p>
              <button class="mt-2 font-bold text-on-surface hover:text-primary transition-colors cursor-pointer text-sm"
                @click="toggleExpanded">
                {{ isExpanded ? 'Show less' : 'Show more' }}
              </button>
            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN: PLAYLIST SIDEBAR & COMMENTS -->
        <div class="lg:col-span-4 space-y-6">

          <!-- Playlist Sidebar card -->
          <div class="bg-surface-container-low border border-outline-variant p-5 rounded-xl shadow-sm space-y-4">
            <!-- Autoplay Next Toggle Switch (identical to home and youtube pages) -->
            <div class="flex justify-between items-center pb-3 border-b border-outline-variant">
              <div>
                <h3 class="font-display font-semibold text-sm uppercase text-on-surface tracking-wider">Autoplay next
                </h3>
                <p class="text-[10px] text-on-surface-variant mt-0.5  max-w-[200px] truncate">
                  <span v-if="playerState.autoplayNext.value">
                    <strong class="font-semibold text-primary">Up Next:</strong> {{
                      videos[(playerState.currentIndex.value + 1) % videos.length]?.title }}
                  </span>
                  <span v-else>
                    Autoplay is turned off
                  </span>
                </p>
              </div>
              <div class="flex items-center gap-2">
                <!-- Premium Custom Toggle Switch -->
                <button
                  class="w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ease-in-out shadow-inner focus:outline-none shrink-0"
                  :class="playerState.autoplayNext.value ? 'bg-primary' : 'bg-secondary/40'"
                  @click="playerState.autoplayNext.value = !playerState.autoplayNext.value">
                  <div
                    class="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ease-in-out shadow"
                    :class="playerState.autoplayNext.value ? 'translate-x-6' : 'translate-x-1'"></div>
                </button>
              </div>
            </div>

            <!-- List Header -->
            <div class="flex justify-between items-center pb-1">
              <h4 class="font-display font-semibold text-xs uppercase text-on-surface tracking-wider">Next in Series
              </h4>
              <span
                class="text-[10px] font-bold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full  ">
                {{ videos.length }}
              </span>
            </div>

            <!-- Videos List -->
            <div class="space-y-4 max-h-[500px] overflow-y-auto pr-1 no-scrollbar ">
              <div v-for="(video, index) in videos" :key="video.id"
                class="flex gap-4 group cursor-pointer p-2 -mx-2 rounded-xl border border-transparent transition-all duration-300 hover:bg-surface-container-low"
                :class="{ 'bg-surface-container-low border-outline-variant/30': playerState.currentIndex.value === index }"
                @click="playerState.changeVideo(index)">
                <!-- Thumbnail -->
                <div class="relative w-36 h-24 rounded-lg overflow-hidden shrink-0 bg-black">
                  <img :src="video.thumbnail || 'https://vimeo.com/assets/images/default_avatar.png'"
                    alt="Video thumbnail"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span class="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 rounded font-bold">
                    {{ video.duration }}
                  </span>

                  <!-- Hover Play Icon Overlay -->
                  <div
                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                    <span class="material-symbols-outlined text-white text-3xl">play_circle</span>
                  </div>

                  <!-- Active Playing Indicator -->
                  <div v-if="playerState.currentIndex.value === index"
                    class="absolute inset-0 bg-primary/10 flex items-center justify-center">
                    <span class="material-symbols-outlined text-primary text-3xl animate-pulse">volume_up</span>
                  </div>
                </div>

                <!-- Text metadata -->
                <div class="flex flex-col justify-center min-w-0">
                  <h4
                    class="font-body-md font-bold text-sm text-on-surface leading-snug line-clamp-2 transition-colors duration-200 group-hover:text-primary"
                    :class="{ 'text-primary': playerState.currentIndex.value === index }">
                    {{ video.title }}
                  </h4>
                  <p class="text-xs text-on-surface-variant mt-1 truncate">{{ video.creator }}</p>
                  <p class="text-[10px] text-on-surface-variant/80 mt-0.5 truncate">{{ video.views }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop Comments card -->
          <!-- <div class="bg-surface-container-low border border-outline-variant p-6 rounded-xl shadow-sm space-y-4">
            <h3 class="font-display font-semibold text-sm uppercase text-on-surface tracking-wider">Comments ({{ comments.length }})</h3>
            
            <div class="flex gap-3 items-start pb-2">
              <div class="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                Y
              </div>
              <div class="flex-1 bg-background border border-outline px-3 py-2 rounded-lg focus-within:border-primary transition-all">
                <textarea v-model="commentInputText" class="bg-transparent border-none focus:ring-0 focus:outline-none w-full text-xs placeholder-on-surface-variant/50 text-on-surface resize-none min-h-[36px]" placeholder="Add a public comment..." rows="1"></textarea>
                <div v-if="commentInputText.trim()" class="flex justify-end gap-2 mt-2">
                  <button class="px-3 py-1 rounded text-[10px] font-semibold text-on-surface-variant hover:bg-surface-container-high cursor-pointer" @click="commentInputText = ''">Cancel</button>
                  <button class="px-3.5 py-1 bg-primary text-on-primary text-[10px] font-bold rounded hover:bg-primary/95 cursor-pointer" @click="handleAddComment">Comment</button>
                </div>
              </div>
            </div>

            <div class="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              <div v-for="comment in comments" :key="comment.id" class="flex gap-3 text-xs border-b border-outline-variant pb-3">
                <div class="w-8 h-8 rounded-full bg-secondary-container border border-outline-variant shrink-0 overflow-hidden flex items-center justify-center font-bold text-xs">
                  <img v-if="comment.avatar" :src="comment.avatar" class="w-full h-full object-cover" />
                  <span v-else>{{ comment.author[0] }}</span>
                </div>
                <div class="flex-1 space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-on-surface text-[11px]">{{ comment.author }}</span>
                    <span class="text-[10px] text-on-surface-variant">{{ comment.timeAgo === 'NaNd ago' ? 'just now' : comment.timeAgo }}</span>
                  </div>
                  <p class="text-on-surface-variant leading-relaxed">{{ comment.content }}</p>
                  <button class="flex items-center gap-1 text-[10px] text-on-surface-variant hover:text-primary mt-1 cursor-pointer" :class="{ 'text-primary': comment.hasLiked }" @click="toggleLikeComment(comment)">
                    <span class="material-symbols-outlined text-xs">thumb_up</span>
                    <span>{{ comment.likes }}</span>
                  </button>
                </div>
              </div>
              <p v-if="comments.length === 0" class="text-xs text-on-surface-variant text-center py-4">No comments yet for this video.</p>
            </div>
          </div> -->

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
