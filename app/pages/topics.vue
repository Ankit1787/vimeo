<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useVideoPlayer, type VideoItem } from '~/composables/useVideoPlayer'
import VideoPlayer from '~/components/video/VideoPlayer.vue'

definePageMeta({ layout: false })

useHead({
  title: 'The Craft of Leadership',
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap'
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'
    }
  ]
})

interface Card {
  title: string
  description: string
}

interface Section {
  key: string
  title: string
  intro: string
  cards: Card[]
  layout: 'split' | 'grid'
}

const sections: Section[] = [
  {
    key: 'mindset',
    title: 'LEADERSHIP MINDSET',
    intro: 'This series captures the essence of ownership, keeping it simple — customer focused and winning together. Together, we learn, grow and win as one team with a shared purpose.',
    layout: 'split',
    cards: [
      {
        title: 'ACT LIKE AN OWNER',
        description: 'Embracing an ownership mindset transforms how you lead, how you show up, and how you drive meaningful results. Acting like an owner is about stepping into full responsibility for your area — owning not just the outcomes, but the thinking, decisions, and behaviors that create them.'
      },
      {
        title: 'KEEP IT SIMPLE & CUSTOMER FOCUSED',
        description: 'Keeping it simple starts with clarity. Partners should know what the priorities are, why they matter, and how to deliver on them. Clear expectations eliminate guesswork, reduce stress, and allow teams to move with confidence.'
      },
      {
        title: 'WIN TOGETHER',
        description: 'Winning together starts with meaningful connection — coaching through listening, checking in, and understanding what partners need to feel supported and confident. Coaching also brings clarity by helping partners understand goals, expectations, and priorities.'
      }
    ]
  },
  {
    key: 'skills',
    title: 'LEADERSHIP SKILLS',
    intro: 'Discover the essentials of great leadership in this video series designed to help you grow your confidence, strengthen your impact, and lead with humanity.',
    layout: 'grid',
    cards: [
      {
        title: 'BUILDING TRUST',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed varius commodo ullamcorper. Fusce nec dignissim turpis. Proin volutpat quis augue sed egestas.'
      },
      {
        title: 'HAVING DIFFICULT CONVERSATIONS',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed varius commodo ullamcorper. Fusce nec dignissim turpis. Proin volutpat quis augue sed egestas.'
      },
      {
        title: 'COACHING',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed varius commodo ullamcorper. Fusce nec dignissim turpis. Proin volutpat quis augue sed egestas.'
      },
      {
        title: 'INFLUENCING BROADLY',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed varius commodo ullamcorper. Fusce nec dignissim turpis. Proin volutpat quis augue sed egestas.'
      }
    ]
  },
  {
    key: 'development',
    title: 'LEADERSHIP DEVELOPMENT',
    intro: 'This video series is designed to help teams grow stronger together by building the everyday leadership skills that drive connection, clarity, and shared success.',
    layout: 'grid',
    cards: [
      {
        title: 'CREATING INCLUSIVE TEAMS',
        description: 'Blurb about Act Like an Owner insights. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed varius commodo ullamcorper. Fusce nec dignissim turpis.'
      },
      {
        title: 'EMOTIONAL INTELLIGENCE',
        description: 'Blurb about Act Like an Owner insights. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed varius commodo ullamcorper. Fusce nec dignissim turpis.'
      },
      {
        title: 'LEADING THROUGH CHANGE',
        description: 'Blurb about Act Like an Owner insights. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed varius commodo ullamcorper. Fusce nec dignissim turpis.'
      },
      {
        title: 'GROWING TOGETHER',
        description: 'Blurb about Act Like an Owner insights. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed varius commodo ullamcorper. Fusce nec dignissim turpis.'
      }
    ]
  }
]

// Horizontal scroll for the Development carousel
const devScrollRef = ref<HTMLDivElement | null>(null)
const scrollDev = (dir: 1 | -1) => {
  let el = devScrollRef.value as any
  if (Array.isArray(el)) {
    el = el[0]
  }
  if (!el) return

  const cards = el.querySelectorAll('[data-card]')
  if (cards.length === 0) return

  const firstVisible = [...cards].findIndex((card) => {
    const rect = (card as HTMLElement).getBoundingClientRect()
    const containerRect = el.getBoundingClientRect()
    return rect.left >= containerRect.left - 10
  })

  const nextIndex = Math.max(
    0,
    Math.min(cards.length - 1, firstVisible + dir)
  )

  const targetCard = cards[nextIndex] as HTMLElement
  const targetScrollLeft = targetCard.offsetLeft - el.offsetLeft - 8

  // Custom quadratic ease-in-out scroll animation
  const start = el.scrollLeft
  const change = targetScrollLeft - start
  const duration = 350 // ms
  const startTime = performance.now()

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    const ease = progress < 0.5 
      ? 2 * progress * progress 
      : -1 + (4 - 2 * progress) * progress

    el.scrollLeft = start + change * ease

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

const showcaseId = '12107219'
const videos = ref<VideoItem[]>([])
const isLoading = ref(true)
const errorMsg = ref('')

const fetchVideos = async () => {
  try {
    const res = await $fetch<any>(`/api/vimeo/showcase/${showcaseId}`)
    if (res?.success && Array.isArray(res.videos)) {
      videos.value = res.videos
    } else {
      errorMsg.value = res?.error || 'Failed to load videos.'
    }
  } catch (e: any) {
    errorMsg.value = e?.message || 'Failed to load videos.'
  } finally {
    isLoading.value = false
  }
}

// Each card maps to one showcase video by global index (cycled).
const videoForCard = (sectionIdx: number, cardIdx: number): VideoItem | null => {
  if (videos.value.length === 0) return null
  let offset = 0
  for (let i = 0; i < sectionIdx; i++) offset += sections[i].cards.length
  return videos.value[(offset + cardIdx) % videos.value.length]
}

const thumbForCard = (sectionIdx: number, cardIdx: number): string => {
  return videoForCard(sectionIdx, cardIdx)?.thumbnail || ''
}

// ---------- Modal state ----------
const modalOpen = ref(false)
const modalSection = ref<Section | null>(null)
const modalVideos = ref<VideoItem[]>([])

const playerState = useVideoPlayer(modalVideos)

const openModal = async (sectionIdx: number, cardIdx: number) => {
  const section = sections[sectionIdx]
  // Modal playlist = the entire showcase, starting at the clicked card's video.
  const startVideo = videoForCard(sectionIdx, cardIdx)
  const startIdx = startVideo ? videos.value.findIndex(v => v.vimeoId === startVideo.vimeoId) : 0
  const list: VideoItem[] = []
  for (let i = 0; i < videos.value.length; i++) {
    list.push(videos.value[(startIdx + i) % videos.value.length])
  }

  modalSection.value = section
  modalVideos.value = list
  playerState.currentIndex.value = 0
  modalOpen.value = true

  if (import.meta.client) document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  modalOpen.value = false
  modalSection.value = null
  if (import.meta.client) document.body.style.overflow = ''
}

watch(modalOpen, async (open) => {
  if (open) {
    await nextTick()
    if (playerState.containerRef.value) {
      playerState.initPlayer(playerState.containerRef.value).catch(() => {})
    }
  }
})

onMounted(() => {
  fetchVideos()
})
</script>

<template>
  <div class="min-h-screen bg-white text-neutral-900 font-body">

    <section v-for="(section, sIdx) in sections" :key="section.key"
      class="max-w-[1240px] mx-auto px-4 md:px-8 pt-10 pb-12">

      <!-- Green banner -->
      <div class="bg-[#1b3d36] text-white px-6 py-5 mb-8">
        <h2 class="font-display text-lg md:text-xl font-bold tracking-wide uppercase mb-1">
          {{ section.title }}
        </h2>
        <p class="text-xs md:text-sm text-white/90 leading-relaxed max-w-4xl">
          {{ section.intro }}
        </p>
      </div>

      <!-- ===== SPLIT LAYOUT (Mindset): text | BIG video | 3 smaller square thumbs ===== -->
      <div v-if="section.layout === 'split'" class="space-y-12">
        <div v-for="(card, cIdx) in section.cards" :key="card.title"
          class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          <!-- Col 1: text (top-aligned) -->
          <div class="lg:col-span-3 flex flex-col justify-start">
            <h3 class="font-display font-bold text-xl tracking-tight text-neutral-900 mb-3">
              {{ card.title }}
            </h3>
            <p class="text-sm text-neutral-700 leading-relaxed">
              {{ card.description }}
            </p>
          </div>

          <!-- Col 2: big featured video -->
          <div class="lg:col-span-6">
            <button type="button"
              @click="openModal(sIdx, cIdx)"
              class="relative block w-full aspect-video bg-neutral-200 overflow-hidden group focus:outline-none">
              <img v-if="thumbForCard(sIdx, cIdx)"
                :src="thumbForCard(sIdx, cIdx)"
                :alt="card.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
              <div v-else class="w-full h-full bg-neutral-300 animate-pulse"></div>
              <div class="absolute inset-0 bg-black/15 flex items-center justify-center transition-colors group-hover:bg-black/30">
                <div class="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
                  <span class="material-symbols-outlined text-3xl text-black translate-x-[1px]">play_arrow</span>
                </div>
              </div>
            </button>
          </div>

          <!-- Col 3: 3 smaller thumbs, all the same size -->
          <div class="lg:col-span-3 grid grid-rows-3 gap-2">
            <button v-for="t in 3" :key="t"
              type="button"
              @click="openModal(sIdx, (cIdx + t) % section.cards.length)"
              class="relative block w-full aspect-video bg-neutral-200 overflow-hidden group focus:outline-none border-b-2 border-[#1b3d36]">
              <img v-if="thumbForCard(sIdx, (cIdx + t) % section.cards.length)"
                :src="thumbForCard(sIdx, (cIdx + t) % section.cards.length)"
                :alt="section.cards[(cIdx + t) % section.cards.length].title"
                class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div v-else class="absolute inset-0 bg-neutral-300 animate-pulse"></div>
              <div class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                <div class="w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow-md">
                  <span class="material-symbols-outlined text-base text-black translate-x-[1px]">play_arrow</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- ===== SKILLS: static 3-col grid ===== -->
      <div v-else-if="section.key === 'skills'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
        <button v-for="(card, cIdx) in section.cards" :key="card.title"
          type="button"
          @click="openModal(sIdx, cIdx)"
          class="text-left group focus:outline-none">
          <div class="relative w-full aspect-video bg-neutral-200 rounded-md overflow-hidden mb-3 shadow-sm">
            <img v-if="thumbForCard(sIdx, cIdx)" :src="thumbForCard(sIdx, cIdx)" :alt="card.title"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div v-else class="w-full h-full bg-neutral-300 animate-pulse"></div>
            <div class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-md">
                <span class="material-symbols-outlined text-2xl text-black translate-x-[1px]">play_arrow</span>
              </div>
            </div>
          </div>
          <h3 class="font-display font-bold text-sm uppercase tracking-wide text-neutral-900 mb-1.5">{{ card.title }}</h3>
          <p class="text-xs text-neutral-600 leading-relaxed">{{ card.description }}</p>
        </button>
      </div>

      <!-- ===== DEVELOPMENT: horizontal carousel (shows 3, scroll to 4th) ===== -->
      <div v-else class="relative">
        <div ref="devScrollRef"
          class="flex gap-8 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-1 px-1 custom-scrollbar-h">
          <button v-for="(card, cIdx) in section.cards" :key="card.title"
            data-card
            type="button"
            @click="openModal(sIdx, cIdx)"
            class="text-left group focus:outline-none snap-start shrink-0"
            style="width: calc((100% - 4rem) / 3);">
            <div class="relative w-full aspect-video bg-neutral-200 rounded-md overflow-hidden mb-3 shadow-sm">
              <img v-if="thumbForCard(sIdx, cIdx)" :src="thumbForCard(sIdx, cIdx)" :alt="card.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div v-else class="w-full h-full bg-neutral-300 animate-pulse"></div>
              <div class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div class="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-md">
                  <span class="material-symbols-outlined text-2xl text-black translate-x-[1px]">play_arrow</span>
                </div>
              </div>
            </div>
            <h3 class="font-display font-bold text-sm uppercase tracking-wide text-neutral-900 mb-1.5">{{ card.title }}</h3>
            <p class="text-xs text-neutral-600 leading-relaxed">{{ card.description }}</p>
          </button>
        </div>

        <!-- Left arrow -->
        <button type="button" @click="scrollDev(-1)"
          class="absolute top-1/2 -translate-y-1/2 left-0 z-10 w-11 h-11 rounded-full bg-white shadow-lg ring-1 ring-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-50 focus:outline-none">
          <span class="material-symbols-outlined text-2xl">chevron_left</span>
        </button>

        <!-- Right arrow -->
        <button type="button" @click="scrollDev(1)"
          class="absolute top-1/2 -translate-y-1/2 right-0 z-10 w-11 h-11 rounded-full bg-white shadow-lg ring-1 ring-neutral-200 flex items-center justify-center text-neutral-700 hover:bg-neutral-50 focus:outline-none">
          <span class="material-symbols-outlined text-2xl">chevron_right</span>
        </button>
      </div>
    </section>

    <!-- ===== MODAL: white card, main video + playlist row ===== -->
    <div v-if="modalOpen"
      class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 md:p-6"
      @click.self="closeModal">

      <div class="bg-white rounded-lg w-full max-w-[1000px] shadow-2xl relative">

        <!-- Close button -->
        <button type="button" @click="closeModal"
          class="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white shadow ring-1 ring-neutral-200 flex items-center justify-center text-neutral-700">
          <span class="material-symbols-outlined text-xl">close</span>
        </button>

        <!-- Main video -->
        <div class="p-4">
          <VideoPlayer :player-state="playerState" />
        </div>

        <!-- Playlist row -->
        <div class="px-4 pb-4">
          <div class="flex gap-3 overflow-x-auto pb-2 custom-scrollbar-h">
            <button v-for="(video, idx) in modalVideos" :key="video.vimeoId"
              type="button"
              @click="playerState.changeVideo(idx)"
              class="relative shrink-0 w-44 aspect-video rounded-md overflow-hidden group focus:outline-none"
              :class="playerState.currentIndex.value === idx ? 'ring-2 ring-[#1b3d36]' : 'ring-1 ring-neutral-200'">
              <img :src="video.thumbnail" :alt="video.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <span class="absolute bottom-1 right-1 text-[10px] bg-black/75 text-white px-1 rounded font-semibold">
                {{ video.duration }}
              </span>
              <div v-if="playerState.currentIndex.value !== idx"
                class="absolute inset-0 bg-black/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div class="w-9 h-9 rounded-full bg-white/95 flex items-center justify-center shadow-md">
                  <span class="material-symbols-outlined text-lg text-black translate-x-[1px]">play_arrow</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading / error toast -->
    <div v-if="isLoading" class="fixed bottom-4 right-4 bg-neutral-900/85 text-white text-xs px-3 py-2 rounded-md">
      Loading showcase…
    </div>
    <div v-if="errorMsg" class="fixed bottom-4 right-4 bg-red-600 text-white text-xs px-3 py-2 rounded-md">
      {{ errorMsg }}
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar-h::-webkit-scrollbar { height: 6px; }
.custom-scrollbar-h::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar-h::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; }
.custom-scrollbar-h::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
</style>
