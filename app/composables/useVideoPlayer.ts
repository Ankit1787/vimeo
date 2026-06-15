import { ref, computed, watch } from 'vue'

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

export const useVideoPlayer = (videos: VideoItem[]) => {
  const containerRef = ref<HTMLDivElement | null>(null)
  let player: any = null

  const currentIndex = ref(0)
  const autoplayNext = ref(true)
  const isPlayerReady = ref(false)

  const currentVideo = computed(() => {
    return videos[currentIndex.value]
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
        responsive: true
      }

      // If video has a privacy hash, use full url format
      if (currentVideo.value.hash) {
        options.url = `https://player.vimeo.com/video/${currentVideo.value.vimeoId}?h=${currentVideo.value.hash}`
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
    if (index < 0 || index >= videos.length) return

    currentIndex.value = index
    isPlayerReady.value = false

    if (player) {
      try {
        if (currentVideo.value.hash) {
          await player.loadVideo(`https://player.vimeo.com/video/${currentVideo.value.vimeoId}?h=${currentVideo.value.hash}`)
        } else {
          await player.loadVideo(Number(currentVideo.value.vimeoId))
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
    let nextIndex = currentIndex.value + 1
    if (nextIndex >= videos.length) {
      nextIndex = 0
    }
    await changeVideo(nextIndex)
  }

  const previous = async () => {
    let prevIndex = currentIndex.value - 1
    if (prevIndex < 0) {
      prevIndex = videos.length - 1
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