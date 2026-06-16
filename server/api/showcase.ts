import { defineEventHandler, getQuery, createError } from 'h3'
import type { EventHandler } from 'h3'

const handler: EventHandler<any, any> = defineEventHandler(async (event): Promise<any> => {
  const vimeoToken = process.env.VIMEO_ACCESS_TOKEN || 'd1df873c006bbbc171977e3140b82754'
  const query = getQuery(event)
  const showcaseId = String(query.showcaseId || '').trim()

  if (!showcaseId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'showcaseId is required'
    })
  }

  // Helper function to format timestamp as relative time
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    const months = Math.floor(days / 30)
    if (months < 12) return `${months}mo ago`
    const years = Math.floor(months / 12)
    return `${years}y ago`
  }

  // Helper function to format duration in seconds to MM:SS or HH:MM:SS
  const formatDuration = (secs: number) => {
    if (!secs || isNaN(secs)) return '00:00'
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = Math.floor(secs % 60)
    
    const mStr = m.toString().padStart(2, '0')
    const sStr = s.toString().padStart(2, '0')
    
    if (h > 0) {
      return `${h}:${mStr}:${sStr}`
    }
    return `${mStr}:${sStr}`
  }

  try {
    // We also fetch Showcase details to get the banner title and description!
    let showcaseTitle = 'Showcase Series'
    let showcaseDesc = 'Explore this collection of curated videos.'
    try {
      const showcaseInfo = await $fetch<any>(`https://api.vimeo.com/albums/${showcaseId}`, {
        headers: {
          Authorization: `Bearer ${vimeoToken}`,
          Accept: 'application/vnd.vimeo.album+json;version=3.4'
        }
      })
      if (showcaseInfo) {
        showcaseTitle = showcaseInfo.name || showcaseTitle
        showcaseDesc = showcaseInfo.description || showcaseDesc
      }
    } catch (infoErr: any) {
      console.warn(`Could not fetch metadata for showcase ${showcaseId}:`, infoErr.message)
    }

    const response = await $fetch<any>(`https://api.vimeo.com/albums/${showcaseId}/videos`, {
      headers: {
        Authorization: `Bearer ${vimeoToken}`,
        Accept: 'application/vnd.vimeo.video+json;version=3.4'
      }
    })

    const videosList = (response.data || []).map((video: any) => {
      const vimeoId = video.uri.split('/').pop() || ''
      
      // Get best size thumbnail
      let thumbnail = ''
      if (video.pictures?.sizes?.length > 0) {
        // Find a size close to 640 width
        const targetWidth = 640
        let bestSize = video.pictures.sizes[0]
        let bestDiff = Math.abs(bestSize.width - targetWidth)
        
        for (const size of video.pictures.sizes) {
          const diff = Math.abs(size.width - targetWidth)
          if (diff < bestDiff) {
            bestDiff = diff
            bestSize = size
          }
        }
        thumbnail = bestSize.link
      }

      // Get creator avatar
      let creatorAvatar = 'https://vimeo.com/assets/images/default_avatar.png'
      if (video.user?.pictures?.sizes?.length > 0) {
        creatorAvatar = video.user.pictures.sizes[0].link
      }

      return {
        id: vimeoId,
        vimeoId: vimeoId,
        title: video.name || 'Untitled Video',
        creator: video.user?.name || 'Unknown Creator',
        creatorAvatar: creatorAvatar,
        subscribers: 'Vimeo Channel',
        views: video.stats?.plays !== undefined ? `${video.stats.plays.toLocaleString()} views` : '0 views',
        timeAgo: video.release_time ? formatTimeAgo(video.release_time) : 'unknown',
        duration: formatDuration(video.duration || 0),
        description: video.description || 'No description available.',
        thumbnail: thumbnail
      }
    })

    return {
      success: true,
      showcaseTitle,
      showcaseDesc,
      total: response.total || 0,
      data: videosList
    }
  } catch (error: any) {
    console.error(`Error fetching showcase ${showcaseId} from Vimeo API:`, error)
    return {
      success: false,
      total: 0,
      data: [],
      error: error.data?.error || error.message || 'Failed to fetch showcase videos'
    }
  }
})

export default handler
