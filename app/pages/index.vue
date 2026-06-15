<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useVideoPlayer, type VideoItem } from '~/composables/useVideoPlayer'
import VideoPlayer from '~/components/video/VideoPlayer.vue'

const isServer = import.meta.server

// Load Google Fonts and Material Icons using useHead
useHead({
  title: 'CinemaStream | Premium Educational Streaming',
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

// Video Playlist matching Stitch UI with fallbacks
const videos = reactive<VideoItem[]>([
  {
    id: 1,
    vimeoId: '980152198',
    hash: '321608ca22',
    title: 'ACT LIKE AN OWNER',
    creator: 'Starbucks Global Academy',
    creatorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIpY_7ZPFuodeFJsLBvDu2VX_daDojMjW1quYvFUQhQhiJGhOrIlwyHPKXEuLbFBtghzPtM-t3aCRATIKDHVhpk_kCLY3PVO0ZmdoC9qqxXOyEjBbSYrxvtVZgOxdP8wWzmxPWYnDBJVOBYKGh0dZ4snlQjSSeo-xuf6sNCbWFMt7_aaHV0HmIIpmjshlIH1krPo5S6M7NjH438S_atdxspczWP5Fpt8CIEZXNse0LniVQ4PUd42uRtkwSuuRAADpbuJ8TpaxXIbk',
    subscribers: '2.4M subscribers',
    views: '165K views',
    timeAgo: '1 day ago',
    duration: '24:15',
    description: 'Embracing an ownership mindset transforms how you lead, how you show up, and how you drive meaningful results. Acting like an owner is about stepping into full responsibility for your area — owning not just the outcomes, but the thinking, decisions, and behaviors that create them. It means looking ahead, anticipating challenges before they surface, and asking the important questions others may overlook.',
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6Z_TaQGAPHRJzMdW2H366lArbLGkIdU5R4cL-gvXTGUye7dSM7w6MBaP888vCQbBXHkbp5a37uMlKC33zIF0Zs2rNhqeZr_rQbAExUgTTdZU9Q9eH1nSmGzWAD2ShoJmwV0NL2_miaVgTa_8TjsyznqrVgWVQGQLI_9ICWTvAx-B5RCav3HBMJjcXHmXg4gUbe4gbWmo6mrB16vQnfeZnrinFVAd5qBZW17ul4_esuE8WWeBOYIym2OTc1iD1vLZ1ArXTmKXaYuE'
  },
  {
    id: 2,
    vimeoId: '1199532654',
    title: 'All the Queens Houses',
    creator: 'Sean Mowry',
    creatorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIpY_7ZPFuodeFJsLBvDu2VX_daDojMjW1quYvFUQhQhiJGhOrIlwyHPKXEuLbFBtghzPtM-t3aCRATIKDHVhpk_kCLY3PVO0ZmdoC9qqxXOyEjBbSYrxvtVZgOxdP8wWzmxPWYnDBJVOBYKGh0dZ4snlQjSSeo-xuf6sNCbWFMt7_aaHV0HmIIpmjshlIH1krPo5S6M7NjH438S_atdxspczWP5Fpt8CIEZXNse0LniVQ4PUd42uRtkwSuuRAADpbuJ8TpaxXIbk',
    subscribers: '1.2M subscribers',
    views: '120K views',
    timeAgo: '2 days ago',
    duration: '09:56',
    description: 'A visual survey of the housing architecture in Queens, New York, exploring the diverse structures and neighborhoods of the borough.',
    thumbnail: ''
  },
  {
    id: 3,
    vimeoId: '17914974',
    title: 'The Backwater Gospel',
    creator: 'The Animation Workshop',
    creatorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIpY_7ZPFuodeFJsLBvDu2VX_daDojMjW1quYvFUQhQhiJGhOrIlwyHPKXEuLbFBtghzPtM-t3aCRATIKDHVhpk_kCLY3PVO0ZmdoC9qqxXOyEjBbSYrxvtVZgOxdP8wWzmxPWYnDBJVOBYKGh0dZ4snlQjSSeo-xuf6sNCbWFMt7_aaHV0HmIIpmjshlIH1krPo5S6M7NjH438S_atdxspczWP5Fpt8CIEZXNse0LniVQ4PUd42uRtkwSuuRAADpbuJ8TpaxXIbk',
    subscribers: '850K subscribers',
    views: '98K views',
    timeAgo: '5 days ago',
    duration: '09:30',
    description: 'A dark, stylized animated short film about a small town, a minister, and the mysterious Undertaker who brings doom in his wake.',
    thumbnail: ''
  },
  {
    id: 4,
    vimeoId: '22439234',
    title: 'The Mountain',
    creator: 'TSO Photography',
    creatorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIpY_7ZPFuodeFJsLBvDu2VX_daDojMjW1quYvFUQhQhiJGhOrIlwyHPKXEuLbFBtghzPtM-t3aCRATIKDHVhpk_kCLY3PVO0ZmdoC9qqxXOyEjBbSYrxvtVZgOxdP8wWzmxPWYnDBJVOBYKGh0dZ4snlQjSSeo-xuf6sNCbWFMt7_aaHV0HmIIpmjshlIH1krPo5S6M7NjH438S_atdxspczWP5Fpt8CIEZXNse0LniVQ4PUd42uRtkwSuuRAADpbuJ8TpaxXIbk',
    subscribers: '2.4M subscribers',
    views: '45K views',
    timeAgo: '1 week ago',
    duration: '03:05',
    description: 'A stunning time-lapse film shot on El Teide, Spain\'s highest mountain, capturing the movement of stars, clouds, and light in breathtaking detail.',
    thumbnail: ''
  }
])

// Fetch dynamic OEmbed metadata from Vimeo
const fetchVimeoMetadata = async () => {
  await Promise.all(
    videos.map(async (video) => {
      try {
        let url = `https://vimeo.com/${video.vimeoId}`
        if (video.hash) {
          url = `https://vimeo.com/${video.vimeoId}/${video.hash}`
        }
        const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`
        const response = await fetch(oembedUrl)
        if (response.ok) {
          const data = await response.json()
          if (data.title) video.title = data.title
          if (data.thumbnail_url) video.thumbnail = data.thumbnail_url
          if (data.author_name) video.creator = data.author_name
          if (data.duration) {
            const mins = Math.floor(data.duration / 60)
            const secs = Math.floor(data.duration % 60)
            video.duration = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
          }
        }
      } catch (error) {
        console.error(`Failed to fetch Vimeo metadata for ${video.vimeoId}:`, error)
      }
    })
  )
}

onMounted(() => {
  fetchVimeoMetadata()

  // Keydown event listener for Arrow keys to navigate between videos
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      playerState.next()
    } else if (event.key === 'ArrowLeft') {
      playerState.previous()
    }
  }

  window.addEventListener('keydown', handleKeydown)

  // Cleanup event listener on unmount
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
})

// Initialize Video Player Composable
const playerState = useVideoPlayer(videos)

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
interface ReplyItem {
  id: number
  author: string
  avatar: string
  content: string
  timeAgo: string
}

interface CommentItem {
  id: number
  author: string
  avatar: string
  content: string
  timeAgo: string
  likes: number
  hasLiked: boolean
  showReplyInput: boolean
  replyText: string
  replies: ReplyItem[]
}

const comments = ref<CommentItem[]>([
  {
    id: 1,
    author: 'Banco E-AMAZÔNIA',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDm68foQp4UiyghE-pSOq6X59D5zh55RHpLzL8yCcOY79n0foGxd3QuB7EEiOz1_w6VhCp6AfLRMqml-JQ91_IsHPRWQ97AwbMazMdYNW-Lt9RRs6flFNYpEViNlBo7tJrTa_bHgFq672A8pjD0QMaP5h3gfUaBWubJoBx6iiAaTOgV25xCOPKXkS2IG2Ts_yJfrqwjTFDoIigLOoMamSHAceXHyn7zHvXY9Gn5RQejVW-1r84spTJeo70No2V7ZPacpLkV3elN9CM',
    content: 'So informative! Learned so much about taking ownership in our daily workflows.',
    timeAgo: '2 hours ago',
    likes: 24,
    hasLiked: false,
    showReplyInput: false,
    replyText: '',
    replies: []
  },
  {
    id: 2,
    author: 'alzareef company',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHLuMbtDLbgiBO2ZBsybapbldsm4ewOVf_EsHYB9Io0wQ4ghGQeU2bDj6oNZM79msoc2irVBneTH6hBAGlZcc7aQaqnQgPci7nGORxwcQJvjIgZUVtNDDyjGQyPxEmnru0N1yXZ_JskKyaktoq_3hoMCcgEfxTFreWKBiLU0rID2wwIHaXwgm0QNNmCfFwxO2lGnhM4_HmrRxH9YWnCLzS6TJuXqHj1ytmNHefSFNheZpiSKYUW30kG89CUW4mSzWhVY_7E7TlS5I',
    content: 'Great info! This mindset shift is exactly what our management team needed to hear.',
    timeAgo: '2 hours ago',
    likes: 8,
    hasLiked: false,
    showReplyInput: false,
    replyText: '',
    replies: []
  },
  {
    id: 3,
    author: 'Zofia',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_i0LD4aGGTlyCVrdi2LUoM9IkRgvYqTbDivktQRQy0kV34LyBlVRFWC9salCknHM2DOA8eNJDXcBFpQbH5Vudjzlztl70xVeoWAJdXScdIzTAVysak7mT0oUsulYMzA8ADqW62kF2gYlQbOYC6jzGQTAJ6YTMTJSMqRKV0OZzehPhHwpRsjFCIJKAePkJchyDvGA476r7NFJ_ZerHSHwUiUr6thl7h1sU2Xi11pxwlwLGSwxPjOzMxsX_ZdEsmiE0Lm7peJGWhJE',
    content: 'Perfectly explained. Now I have something concrete to show my clients when discussing accountability.',
    timeAgo: '4 hours ago',
    likes: 56,
    hasLiked: false,
    showReplyInput: false,
    replyText: '',
    replies: []
  }
])

// Comments Actions
const commentInputText = ref('')

const handleAddComment = () => {
  if (!commentInputText.value.trim()) return
  
  comments.value.unshift({
    id: Date.now(),
    author: 'You (Viewer)',
    avatar: '', // Fallback profile icon
    content: commentInputText.value.trim(),
    timeAgo: 'Just now',
    likes: 0,
    hasLiked: false,
    showReplyInput: false,
    replyText: '',
    replies: []
  })
  
  commentInputText.value = ''
}

const toggleLikeComment = (comment: CommentItem) => {
  comment.hasLiked = !comment.hasLiked
  if (comment.hasLiked) {
    comment.likes++
  } else {
    comment.likes--
  }
}

const toggleReplyInput = (comment: CommentItem) => {
  comment.showReplyInput = !comment.showReplyInput
  if (comment.showReplyInput) {
    comment.replyText = ''
  }
}

const handleAddReply = (comment: CommentItem) => {
  if (!comment.replyText.trim()) return
  
  comment.replies.push({
    id: Date.now(),
    author: 'You (Viewer)',
    avatar: '', // Fallback profile icon
    content: comment.replyText.trim(),
    timeAgo: 'Just now'
  })
  
  comment.replyText = ''
  comment.showReplyInput = false
}

const handleCancelReply = (comment: CommentItem) => {
  comment.replyText = ''
  comment.showReplyInput = false
}
</script>

<template>
  <div class="min-h-screen bg-background text-on-background font-body-md pb-16 lg:pb-0">
    <!-- ==================== DESKTOP NAVIGATION BAR ==================== -->
    <nav class="hidden lg:flex bg-background border-b border-outline-variant justify-between items-center h-16 px-margin-desktop w-full sticky top-0 z-50">
      <div class="flex items-center gap-8">
        <span class="font-display text-2xl font-bold text-primary uppercase tracking-tighter cursor-pointer hover:opacity-90 transition-opacity">
          CinemaStream
        </span>
        <div class="flex gap-6">
          <NuxtLink class="text-primary font-bold border-b-2 border-primary pb-2 font-label-md text-label-md transition-all" to="/">Vimeo</NuxtLink>
          <NuxtLink class="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 font-label-md text-label-md" to="/youtube">YouTube</NuxtLink>
          <a class="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 font-label-md text-label-md" href="#">Trending</a>
          <a class="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200 font-label-md text-label-md" href="#">Library</a>
        </div>
      </div>
      <div class="flex items-center gap-6">
        <div class="relative hidden lg:block">
          <input
            class="bg-surface-container-high border-none rounded-full px-6 py-2 w-64 text-label-md focus:ring-2 focus:ring-primary focus:outline-none placeholder-on-surface-variant/50 transition-all duration-300"
            placeholder="Search movies, creators..."
            type="text"
          />
        </div>
        <div class="flex items-center gap-4">
          <button class="material-symbols-outlined text-on-surface-variant hover:text-primary transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer">
            notifications
          </button>
          <button class="material-symbols-outlined text-on-surface-variant hover:text-primary transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer">
            apps
          </button>
          <button class="bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md px-4 py-2 rounded-xl active:scale-95 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg">
            Upload
          </button>
          <div class="w-10 h-10 rounded-full border border-outline-variant overflow-hidden shadow-inner cursor-pointer hover:border-primary transition-colors duration-200">
            <img
              alt="User profile"
              class="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkLcQ03OZXe1bl1ozq1qQkBv988JLOP81pFI3QNQeelAebn1aspNzK4vmW-MSTgiANtzYza4OFbINFaVyjDhrr2SmQhAuYTiKVV4n6cGDicU2UQ1mD5r_rHJmKa2MiHjMAdF9Ce_KVO0RMzKVlW2OOfs8giafKE8OXwEsJ7I_wP4K065MBxXPsMRuSSxSl8nrR1wK7WEthgAUToJucJFxErLHrla-bPQmw5Une6JlXf_o0wMJp63UYfX_oeHhhG737y1deeQfoG_0"
            />
          </div>
        </div>
      </div>
    </nav>

    <!-- ==================== RESPONSIVE VIDEO PLAYER CONTAINER ==================== -->
    <!-- On mobile: sticky top-0, aspect-video, z-40, black background -->
    <!-- On desktop: relative top-auto, max-width container, margins, transparent background -->
    <div class="sticky top-0 z-40 lg:relative lg:top-auto lg:z-10 bg-black lg:bg-transparent w-full">
      <div class="max-w-[1440px] mx-auto px-0 lg:px-gutter lg:pt-4 lg:pb-6">
        <VideoPlayer :player-state="playerState" />
      </div>
    </div>

    <!-- ==================== MAIN PAGE LAYOUT GRID ==================== -->
    <main class="w-full max-w-[1440px] p-6 grid grid-cols-1  gap-8 mx-auto">
      
      <!-- ==================== LEFT COLUMN: INFO & PLAYLIST ==================== -->
      <div class="lg:col-span-2 space-y-8">
          
          <!-- Video Metadata & Creator Info -->
          <section class="bg-surface-container-low p-6 lg:p-8 rounded-xl border border-outline-variant shadow-sm transition-all duration-300 hover:shadow-md">
            <!-- Header Section -->
            <div class="flex flex-col  justify-between items-start gap-4 mb-4">
              <div>
                <h1 class="font-headline-lg text-xl lg:text-3xl text-on-surface mb-2 font-bold uppercase tracking-tight">
                  {{ playerState?.currentVideo?.value?.title }}
                </h1>
                <div class="flex items-center gap-4 text-on-surface-variant font-body-md text-sm">
                  <span>{{ playerState?.currentVideo?.value?.views }}</span>
                  <span class="w-1 h-1 bg-outline-variant rounded-full"></span>
                  <span>{{ playerState?.currentVideo?.value?.timeAgo }}</span>
                </div>
              </div>
                          <!-- Action Buttons (Share, Like, Flag) -->
              <div class="flex items-center gap-2 mt-2 sm:mt-0 text-slate-500">
                <button class="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-500 hover:text-primary active:scale-90">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                  </svg>
                </button>
                <button class="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-500 hover:text-primary active:scale-90">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                  </svg>
                </button>
                <button class="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-slate-500 hover:text-primary active:scale-90">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Creator / Channel Info Bar -->
            <div class="flex items-center gap-4 py-6 border-t border-outline-variant mb-2">
              <img
                alt="Creator Avatar"
                class="w-12 h-12 rounded-full border border-outline-variant shadow-sm"
                :src="playerState.currentVideo?.value?.creatorAvatar"
              />
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
              <button
                class="mt-2 font-bold text-on-surface hover:text-primary transition-colors cursor-pointer text-sm"
                @click="toggleExpanded"
              >
                {{ isExpanded ? 'Show less' : 'Show more' }}
              </button>
            </div>
          </section>

          <!-- Playlist / Autoplay next Section -->
          <section class="space-y-4">
            <div class="flex justify-between items-center px-1">
              <div>
                <h3 class="font-headline-md text-lg lg:text-xl font-bold text-on-surface">Autoplay next</h3>
                <p class="text-xs text-on-surface-variant mt-1 select-none">
                  <span v-if="playerState.autoplayNext.value">
                    <strong class="font-semibold text-primary">Up Next:</strong> {{ videos[(playerState.currentIndex.value + 1) % videos.length]?.title }}
                  </span>
                  <span v-else>
                    Autoplay is turned off
                  </span>
                </p>
              </div>
              <div class="flex items-center gap-2">
                <!-- Premium Custom Toggle Switch -->
                <button
                  class="w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ease-in-out shadow-inner focus:outline-none"
                  :class="playerState.autoplayNext.value ? 'bg-primary' : 'bg-secondary/40'"
                  @click="playerState.autoplayNext.value = !playerState.autoplayNext.value"
                >
                  <div
                    class="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ease-in-out shadow"
                    :class="playerState.autoplayNext.value ? 'translate-x-6' : 'translate-x-1'"
                  ></div>
                </button>
              </div>
            </div>

            <!-- Related Videos - Desktop Grid Layout -->
            <div class="hidden lg:grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <div
                v-for="(video, index) in videos"
                :key="video.id"
                class="group cursor-pointer"
                @click="playerState.changeVideo(index)"
              >
                <div class="relative aspect-video rounded-xl overflow-hidden mb-3 bg-surface-container shadow-sm group-hover:shadow-md transition-shadow">
                  <img
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    :src="video.thumbnail"
                    :alt="video.title"
                  />
                  <span class="absolute bottom-2 right-2 px-2 py-1 bg-black/85 rounded font-label-md text-[10px] text-white tracking-wide">
                    {{ video.duration }}
                  </span>
                  <!-- Hover play button overlay -->
                  <div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                    <span class="material-symbols-outlined text-4xl text-white transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      play_circle
                    </span>
                  </div>
                  <!-- Active video glow outline -->
                  <div
                    v-if="playerState.currentIndex.value === index"
                    class="absolute inset-0 border-2 border-primary rounded-xl"
                  ></div>
                </div>
                <h4
                  class="font-headline-md text-sm font-semibold text-on-surface line-clamp-2 transition-colors duration-200"
                  :class="playerState.currentIndex.value === index ? 'text-primary' : 'group-hover:text-primary'"
                >
                  {{ video.title }}
                </h4>
                <p class="text-xs text-on-surface-variant mt-1">
                  {{ video.creator }} • {{ video.views }}
                </p>
              </div>
            </div>

            <!-- Related Videos - Mobile Swipe/Scroll Layout -->
            <div class="lg:hidden flex gap-4 overflow-x-auto pb-4 custom-scrollbar px-1 snap-x">
              <div
                v-for="(video, index) in videos"
                :key="video.id"
                class="w-64 flex-shrink-0 group snap-start"
                @click="playerState.changeVideo(index)"
              >
                <div class="relative aspect-video rounded-xl overflow-hidden mb-2 shadow-sm">
                  <img
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    :src="video.thumbnail"
                    :alt="video.title"
                  />
                  <span class="absolute bottom-2 right-2 px-1.5 bg-black/80 text-white font-label-sm text-[10px] rounded">
                    {{ video.duration }}
                  </span>
                  <!-- Active outline on mobile -->
                  <div
                    v-if="playerState.currentIndex.value === index"
                    class="absolute inset-0 border-2 border-primary rounded-xl"
                  ></div>
                </div>
                <h4
                  class="font-body-md font-semibold text-sm text-on-surface line-clamp-2"
                  :class="{ 'text-primary': playerState.currentIndex.value === index }"
                >
                  {{ video.title }}
                </h4>
                <p class="font-label-sm text-on-surface-variant text-[10px] uppercase mt-1">
                  {{ video.creator }}
                </p>
              </div>
            </div>
          </section>

          <!-- MOBILE ONLY: Comments Stack -->
          <!-- (Renders on mobile, hides on desktop) -->
          <section class="lg:hidden mt-8 border-t border-outline-variant pt-6">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-2">
                <h2 class="font-headline-md text-lg text-on-surface font-bold">Comments</h2>
                <span class="font-body-md text-sm text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
                  {{ comments.length }}
                </span>
              </div>
              <div class="flex gap-4 text-on-surface-variant">
                <span class="material-symbols-outlined cursor-pointer hover:text-primary">search</span>
                <span class="material-symbols-outlined cursor-pointer hover:text-primary">sort</span>
              </div>
            </div>

            <!-- Mobile Comment Input -->
            <div class="flex gap-3 mb-6 items-start">
              <div class="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                Y
              </div>
              <div class="flex-1 bg-surface-container-high/40 border border-outline-variant px-3 py-2 rounded-xl focus-within:border-primary focus-within:bg-background transition-all duration-200">
                <textarea
                  v-model="commentInputText"
                  class="bg-transparent border-none focus:ring-0 focus:outline-none w-full text-sm placeholder:text-on-surface-variant/75 resize-none min-h-[36px]"
                  placeholder="Add a comment..."
                  rows="1"
                ></textarea>
                <div v-if="commentInputText.trim()" class="flex justify-end gap-2 mt-2 transition-all">
                  <button
                    class="px-3 py-1 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high"
                    @click="commentInputText = ''"
                  >
                    Cancel
                  </button>
                  <button
                    class="px-4 py-1 rounded-full text-xs font-bold bg-primary text-on-primary hover:bg-primary/95"
                    @click="handleAddComment"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>

            <!-- Mobile Comments List -->
            <!-- <div class="space-y-6">
              <div v-for="comment in comments" :key="comment.id" class="flex gap-3 text-sm">
                <div class="w-9 h-9 rounded-full border border-outline-variant overflow-hidden shrink-0 shadow-inner bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <img v-if="comment.avatar" :src="comment.avatar" class="w-full h-full object-cover" />
                  <span v-else class="font-bold">{{ comment.author[0] }}</span>
                </div>
                
                <div class="flex-1 space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-on-surface text-xs font-bold">{{ comment.author }}</span>
                    <span class="text-[10px] text-on-surface-variant">{{ comment.timeAgo }}</span>
                  </div>
                  <p class="text-on-surface-variant leading-relaxed text-sm">
                    {{ comment.content }}
                  </p>
                  
                  <div class="flex items-center gap-4 mt-2">
                    <button
                      class="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                      :class="{ 'text-primary font-semibold': comment.hasLiked }"
                      @click="toggleLikeComment(comment)"
                    >
                      <span class="material-symbols-outlined text-[16px]">thumb_up</span>
                      <span class="text-xs">{{ comment.likes }}</span>
                    </button>
                    <button
                      class="text-xs font-bold text-on-surface-variant hover:text-on-surface cursor-pointer"
                      @click="toggleReplyInput(comment)"
                    >
                      REPLY
                    </button>
                  </div>

                  <div v-if="comment.showReplyInput" class="mt-4 flex gap-2 items-start pl-2 border-l-2 border-outline-variant">
                    <input
                      v-model="comment.replyText"
                      type="text"
                      class="flex-1 bg-surface-container border border-outline-variant px-3 py-1.5 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                      placeholder="Reply to this comment..."
                      @keyup.enter="handleAddReply(comment)"
                    />
                    <button
                      class="px-3 py-1.5 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary/95"
                      @click="handleAddReply(comment)"
                    >
                      Reply
                    </button>
                    <button
                      class="px-2 py-1.5 text-on-surface-variant text-xs font-semibold rounded-lg hover:bg-surface-container-high"
                      @click="handleCancelReply(comment)"
                    >
                      Cancel
                    </button>
                  </div>

                  <div v-if="comment.replies.length > 0" class="mt-4 space-y-4 pl-4 border-l-2 border-outline-variant/60">
                    <div v-for="reply in comment.replies" :key="reply.id" class="flex gap-2 text-xs">
                      <div class="w-7 h-7 rounded-full border border-outline-variant overflow-hidden shrink-0 bg-secondary-container flex items-center justify-center font-bold text-[10px]">
                        <img v-if="reply.avatar" :src="reply.avatar" class="w-full h-full object-cover" />
                        <span v-else>{{ reply.author[0] }}</span>
                      </div>
                      <div class="flex-1">
                        <div class="flex items-center gap-2">
                          <span class="font-bold text-on-surface">{{ reply.author }}</span>
                          <span class="text-[9px] text-on-surface-variant">{{ reply.timeAgo }}</span>
                        </div>
                        <p class="text-on-surface-variant leading-relaxed mt-0.5">{{ reply.content }}</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div> -->
          </section>

        </div>

        <!-- ==================== RIGHT COLUMN: COMMENTS (DESKTOP) & PROMOS ==================== -->
        <!-- (Renders on desktop, hides on mobile) -->
        <!-- <aside class="hidden lg:col-span-1 lg:flex flex-col gap-6">
          <div class="bg-surface-container p-6 rounded-xl border border-outline-variant flex flex-col shadow-sm">
            <div class="flex justify-between items-center mb-6">
              <h3 class="font-headline-md text-md text-on-surface font-semibold select-none">
                Comments <span class="text-on-surface-variant ml-2 text-xs font-normal">({{ comments.length }})</span>
              </h3>
              <div class="flex items-center gap-3 text-on-surface-variant">
                <button class="material-symbols-outlined text-lg hover:text-primary transition-colors cursor-pointer">search</button>
                <button class="material-symbols-outlined text-lg hover:text-primary transition-colors cursor-pointer">sort</button>
              </div>
            </div>

            <div class="mb-8">
              <div class="flex gap-4 items-start">
                <div class="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0 font-bold shadow-sm">
                  Y
                </div>
                <div class="flex-1 border-b border-outline-variant pb-2 group focus-within:border-primary transition-colors duration-200">
                  <textarea
                    v-model="commentInputText"
                    class="w-full bg-transparent border-none p-0 text-sm focus:ring-0 focus:outline-none resize-none min-h-[24px]"
                    placeholder="Add a comment..."
                    rows="1"
                    @keyup.ctrl.enter="handleAddComment"
                  ></textarea>
                </div>
              </div>
              <div v-if="commentInputText.trim()" class="flex justify-end gap-2 mt-2 transition-all">
                <button
                  class="px-4 py-1.5 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                  @click="commentInputText = ''"
                >
                  Cancel
                </button>
                <button
                  class="px-4 py-1.5 rounded-full bg-primary text-on-primary font-bold text-xs hover:bg-primary/95 transition-all cursor-pointer shadow-sm"
                  @click="handleAddComment"
                >
                  Comment
                </button>
              </div>
            </div>

            <div class="space-y-6 overflow-y-auto no-scrollbar max-h-[600px] pr-1">
              <div v-for="comment in comments" :key="comment.id" class="flex gap-4 text-sm animate-fade-in">
                <div class="w-10 h-10 rounded-full border border-outline-variant overflow-hidden shrink-0 shadow-inner bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <img v-if="comment.avatar" :src="comment.avatar" class="w-full h-full object-cover" />
                  <span v-else class="font-bold">{{ comment.author[0] }}</span>
                </div>
                
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-bold text-on-surface font-semibold">{{ comment.author }}</span>
                    <span class="text-xs text-on-surface-variant">{{ comment.timeAgo }}</span>
                  </div>
                  <p class="text-on-surface-variant leading-relaxed">
                    {{ comment.content }}
                  </p>
                  
                  <div class="flex items-center gap-4 mt-2">
                    <button
                      class="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                      :class="{ 'text-primary font-semibold': comment.hasLiked }"
                      @click="toggleLikeComment(comment)"
                    >
                      <span class="material-symbols-outlined text-[16px]">thumb_up</span>
                      <span class="text-xs">{{ comment.likes }}</span>
                    </button>
                    <button
                      class="text-xs font-bold text-on-surface-variant hover:text-on-surface cursor-pointer"
                      @click="toggleReplyInput(comment)"
                    >
                      REPLY
                    </button>
                  </div>

                  <div v-if="comment.showReplyInput" class="mt-4 flex gap-2 items-start pl-2 border-l-2 border-outline-variant">
                    <input
                      v-model="comment.replyText"
                      type="text"
                      class="flex-1 bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded-lg text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                      placeholder="Reply to this comment..."
                      @keyup.enter="handleAddReply(comment)"
                    />
                    <button
                      class="px-3 py-1.5 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary/95"
                      @click="handleAddReply(comment)"
                    >
                      Reply
                    </button>
                    <button
                      class="px-2 py-1.5 text-on-surface-variant text-xs font-semibold rounded-lg hover:bg-surface-container-high"
                      @click="handleCancelReply(comment)"
                    >
                      Cancel
                    </button>
                  </div>

                  <div v-if="comment.replies.length > 0" class="mt-4 space-y-4 pl-4 border-l-2 border-outline-variant/60">
                    <div v-for="reply in comment.replies" :key="reply.id" class="flex gap-3 text-xs">
                      <div class="w-8 h-8 rounded-full border border-outline-variant overflow-hidden shrink-0 bg-secondary-container flex items-center justify-center font-bold">
                        <img v-if="reply.avatar" :src="reply.avatar" class="w-full h-full object-cover" />
                        <span v-else>{{ reply.author[0] }}</span>
                      </div>
                      <div class="flex-1">
                        <div class="flex items-center gap-2">
                          <span class="font-bold text-on-surface">{{ reply.author }}</span>
                          <span class="text-[10px] text-on-surface-variant">{{ reply.timeAgo }}</span>
                        </div>
                        <p class="text-on-surface-variant leading-relaxed mt-0.5">{{ reply.content }}</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <div class="relative rounded-xl overflow-hidden bg-primary-container p-6 text-on-primary shadow-md hover:shadow-lg transition-shadow">
            <h4 class="font-display text-lg font-bold mb-2">Upgrade to Stream+</h4>
            <p class="text-sm mb-4 opacity-90 leading-relaxed">Watch ad-free, download educational videos, and support your favorite creators.</p>
            <button class="w-full bg-surface-container-lowest text-primary py-2 rounded-xl font-label-md text-label-md font-bold hover:bg-surface-bright active:scale-95 transition-all cursor-pointer">
              Learn More
            </button>
          </div>
        </aside> -->

    </main>

    <!-- ==================== BOTTOM NAVBAR (MOBILE ONLY) ==================== -->
    <nav class="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 px-2 bg-surface-container border-t border-outline-variant shadow-lg rounded-t-xl">
      <NuxtLink class="flex flex-col items-center justify-center text-primary bg-primary-container/10 rounded-full py-1 px-4 active:scale-95 transition-transform tap-highlight-none" to="/">
        <span class="material-symbols-outlined text-[24px]">home</span>
        <span class="font-label-sm text-[10px] mt-0.5 font-bold">Vimeo</span>
      </NuxtLink>
      <NuxtLink class="flex flex-col items-center justify-center text-on-surface-variant active:scale-95 transition-transform tap-highlight-none" to="/youtube">
        <span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' 1;">explore</span>
        <span class="font-label-sm text-[10px] mt-0.5">YouTube</span>
      </NuxtLink>
      <a class="flex flex-col items-center justify-center text-on-surface-variant active:scale-95 transition-transform tap-highlight-none" href="#">
        <span class="material-symbols-outlined text-[24px]">subscriptions</span>
        <span class="font-label-sm text-[10px] mt-0.5">Subscribed</span>
      </a>
      <a class="flex flex-col items-center justify-center text-on-surface-variant active:scale-95 transition-transform tap-highlight-none" href="#">
        <span class="material-symbols-outlined text-[24px]">video_library</span>
        <span class="font-label-sm text-[10px] mt-0.5">Library</span>
      </a>
    </nav>
  </div>
</template>

<style scoped>
/* Smooth fade-in animation for newly added comments */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}
</style>