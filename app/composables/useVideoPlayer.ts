import { ref, computed, watch, isRef, type Ref } from 'vue'

export interface VideoItem {
  id: string | number
  vimeoId: string
  hash?: string
  title: string
  creator: string
  creatorAvatar: string
  subscribers: string
  views: string
  timeAgo: string
  duration: string
  description: string
  thumbnail: string
}

// Dynamic script loader for Vimeo API
const loadVimeoScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (import.meta.server) return resolve()
    if ((window as any).Vimeo) {
      return resolve()
    }
    const existing = document.querySelector('script[src="https://player.vimeo.com/api/player.js"]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', (e) => reject(e))
      return
    }
    const script = document.createElement('script')
    script.src = 'https://player.vimeo.com/api/player.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = (e) => reject(e)
    document.head.appendChild(script)
  })
}

export const useVideoPlayer = (videos: VideoItem[] | Ref<VideoItem[]>) => {
  const containerRef = ref<HTMLDivElement | null>(null)
  let player: any = null

  const currentIndex = ref(0)
  const autoplayNext = ref(true)
  const isPlayerReady = ref(false)

  const getVideosList = (): VideoItem[] => {
    return isRef(videos) ? videos.value : videos
  }

  const currentVideo = computed(() => {
    const list = getVideosList()
    return list[currentIndex.value] || null
  })

  // Initialize Vimeo Player inside container element
  const initPlayer = async (container: HTMLDivElement) => {
    if (!import.meta.client || !container) return
    containerRef.value = container

    try {
      // Ensure the Vimeo script is loaded
      await loadVimeoScript()
      
      const VimeoLib = (window as any).Vimeo

      // Clean the container HTML to prevent multiple nested iframes
      container.innerHTML = ""

      // If there's an existing player, destroy it
      if (player) {
        try {
          await player.destroy()
        } catch (e) {
          console.error('Error destroying player:', e)
        }
      }

      const options: any = {
        loop: false,
        autoplay: true,
        responsive: false
      }

      // Private/unlisted videos need the hash inline on the URL; passing it
      // separately via `hash:` has been unreliable on recent player.js builds.
      if (!currentVideo.value) return
      if (currentVideo.value.hash) {
        options.url = `https://vimeo.com/${currentVideo.value.vimeoId}/${currentVideo.value.hash}`
      } else {
        options.id = Number(currentVideo.value.vimeoId)
      }

      // Initialize the native player
      player = new VimeoLib.Player(container, options)

      player.on('loaded', () => {
        isPlayerReady.value = true
      })

      player.on('ended', () => {
        if (autoplayNext.value) {
          next()
        }
      })
    } catch (err) {
      console.error('Failed to initialize Vimeo Player:', err)
    }
  }

  const changeVideo = async (index: number) => {
    const list = getVideosList()
    if (index < 0 || index >= list.length) return

    currentIndex.value = index
    isPlayerReady.value = false

    if (player) {
      try {
        if (currentVideo.value) {
          if (currentVideo.value.hash) {
            // Load private/unlisted videos dynamically using the URL options format with the h parameter
            await player.loadVideo({
              url: `https://vimeo.com/${currentVideo.value.vimeoId}?h=${currentVideo.value.hash}`
            })
          } else {
            await player.loadVideo(Number(currentVideo.value.vimeoId))
          }
        }
        
        // Explicitly trigger play after loading the new video
        try {
          await player.play()
        } catch (playErr) {
          console.log('Autoplay blocked or play failed:', playErr)
        }
      } catch (e) {
        console.error('Error loading video:', e)
        // Fallback to full player re-initialization if loadVideo fails
        if (containerRef.value) {
          await initPlayer(containerRef.value)
        }
      }
    } else if (containerRef.value) {
      await initPlayer(containerRef.value)
    }
  }

  const next = async () => {
    const list = getVideosList()
    let nextIndex = currentIndex.value + 1
    if (nextIndex >= list.length) {
      nextIndex = 0
    }
    await changeVideo(nextIndex)
  }

  const previous = async () => {
    const list = getVideosList()
    let prevIndex = currentIndex.value - 1
    if (prevIndex < 0) {
      prevIndex = list.length - 1
    }
    await changeVideo(prevIndex)
  }

  return {
    containerRef,
    currentIndex,
    currentVideo,
    autoplayNext,
    isPlayerReady,
    initPlayer,
    next,
    previous,
    changeVideo
  }
}