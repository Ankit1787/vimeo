import { ref, computed } from 'vue'

export interface YoutubeVideoItem {
  id: string | number
  youtubeId: string
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

// Dynamic script loader for YouTube iFrame API
const loadYoutubeScript = (): Promise<void> => {
  return new Promise((resolve) => {
    if (import.meta.server) return resolve()
    if ((window as any).YT && (window as any).YT.Player) {
      return resolve()
    }
    
    // Setup callback
    const existingCallback = (window as any).onYouTubeIframeAPIReady
    (window as any).onYouTubeIframeAPIReady = () => {
      if (existingCallback) existingCallback()
      resolve()
    }

    // Check if script is already injected
    const scripts = document.getElementsByTagName('script')
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src === 'https://www.youtube.com/iframe_api') {
        return // Already loading, callback will resolve
      }
    }

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
  })
}

export const useYoutubePlayer = (videos: YoutubeVideoItem[]) => {
  const containerRef = ref<HTMLDivElement | null>(null)
  let player: any = null

  const currentIndex = ref(0)
  const autoplayNext = ref(true)
  const isPlayerReady = ref(false)

  const currentVideo = computed(() => {
    return videos[currentIndex.value]
  })

  // Initialize YouTube Player inside container element
  const initPlayer = async (container: HTMLDivElement) => {
    if (!import.meta.client || !container) return
    containerRef.value = container

    try {
      // Ensure the YouTube script is loaded
      await loadYoutubeScript()

      // Clean the container HTML to prevent multiple nested players
      container.innerHTML = ""

      // Create a nested target element for YouTube Player to replace
      const playerTarget = document.createElement('div')
      playerTarget.id = 'yt-iframe-player'
      container.appendChild(playerTarget)

      const YT = (window as any).YT

      player = new YT.Player('yt-iframe-player', {
        videoId: currentVideo.value.youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 1, // Native YouTube controls
          rel: 0,
          modestbranding: 1
        },
        events: {
          onReady: () => {
            isPlayerReady.value = true
            // Grab duration from player dynamically if not already set
            const durationSec = player.getDuration()
            if (durationSec && (!currentVideo.value.duration || currentVideo.value.duration === '00:00')) {
              const mins = Math.floor(durationSec / 60)
              const secs = Math.floor(durationSec % 60)
              currentVideo.value.duration = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.ENDED is 0
            if (event.data === 0) {
              if (autoplayNext.value) {
                next()
              }
            }
          }
        }
      })
    } catch (err) {
      console.error('Failed to initialize YouTube Player:', err)
    }
  }

  const changeVideo = async (index: number) => {
    if (index < 0 || index >= videos.length) return

    currentIndex.value = index
    isPlayerReady.value = false

    if (player && typeof player.loadVideoById === 'function') {
      try {
        player.loadVideoById({
          videoId: currentVideo.value.youtubeId
        })
      } catch (e) {
        console.error('Error changing video via loadVideoById:', e)
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
