import { defineEventHandler, createError } from 'h3'
import type { EventHandler } from 'h3'

const handler: EventHandler<any, any> = defineEventHandler(async (event): Promise<any> => {
  const vimeoToken = process.env.VIMEO_ACCESS_TOKEN || 'd1df873c006bbbc171977e3140b82754'
  const showcaseId = event.context.params?.id

  if (!showcaseId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'showcaseId parameter is required'
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
  console.log("this is new")
  try {
    // 1. Fetch Album Details
    let albumInfo: any = null
    try {
      albumInfo = await $fetch<any>(`https://api.vimeo.com/albums/${showcaseId}`, {
        headers: {
          Authorization: `Bearer ${vimeoToken}`,
          Accept: 'application/vnd.vimeo.album+json;version=3.4'
        }
      })
    } catch (err: any) {
      console.error(`Error fetching album metadata for ${showcaseId}:`, err)
      return {
        success: false,
        error: err.data?.error || err.message || 'Failed to fetch showcase details',
        isPasswordProtected: showcaseId === '12107219' || String(err.message).toLowerCase().includes('password')
      }
    }

    if (!albumInfo) {
      return {
        success: false,
        error: 'Showcase not found'
      }
    }

    const userId = albumInfo.user?.uri?.split('/').pop() || ''
    const privacyView = albumInfo.privacy?.view || 'anybody'
    console.log(albumInfo.metadata?.connections?.videos?.uri, "albuminfo")
    // 2. Fetch Album Videos using the connection URI
    // const videosUri = albumInfo.metadata?.connections?.videos?.uri || `/albums/${showcaseId}/videos`
    const videosUri = `users/${userId}/albums/${showcaseId}/videos`
    let videosResponse: any = null
    let videosData: any[] = []

    try {
      videosResponse = await $fetch<any>(`https://api.vimeo.com/${videosUri}?page=1&per_page=100`, {
        headers: {
          Authorization: `Bearer ${vimeoToken}`,
          // Accept: 'application/vnd.vimeo.video+json;version=3.4'
        }
      })

      videosData = videosResponse?.data || []
    } catch (vErr: any) {
      console.warn(`Error fetching videos for album ${showcaseId}:`, vErr.message)
      // If we fail fetching videos but album view is password, flag it
      // if (privacyView === 'password' || showcaseId === '12107219') {
      //   return {
      //     success: false,
      //     isPasswordProtected: true,
      //     error: 'This showcase is password-protected.',
      //     showcase: {
      //       id: showcaseId,
      //       name: albumInfo.name || 'Password Protected Showcase',
      //       description: albumInfo.description || '',
      //       privacy: privacyView
      //     },
      //     owner: {
      //       id: userId,
      //       name: albumInfo.user?.name || 'Vimeo Creator'
      //     },
      //     videos: []
      //   }
      // }
      // throw vErr
    }
    console.log("this is inside videosResponse", videosResponse)
    console.log(videosData.length)
    // 3. Handle password protection when API returns 200 OK but empty videos array
    if ( videosData.length === 0) {
      return {
        success: false,
        isPasswordProtected: true,
        error: 'This showcase is password-protected and empty via API access.',
        showcase: {
          id: showcaseId,
          name: albumInfo.name || 'Password Protected Showcase',
          description: albumInfo.description || '',
          privacy: privacyView
        },
        owner: {
          id: userId,
          name: albumInfo.user?.name || 'Vimeo Creator'
        },
        videos: []
      }
    }

    // 4. Map owner info
    let ownerAvatar = 'https://vimeo.com/assets/images/default_avatar.png'
    if (albumInfo.user?.pictures?.sizes?.length > 0) {
      ownerAvatar = albumInfo.user.pictures.sizes.at(-1)?.link || ownerAvatar
    }
    console.log("this is inside videosData", videosData[0])
    // 5. Transform video objects to match frontend VideoItem contract
    const playlist = videosData.map((video: any) => {
      const vimeoId = video.uri.split('/').pop() || ''

      // Get best size thumbnail
      let thumbnail = ''
      if (video.pictures?.sizes?.length > 0) {
        thumbnail = video.pictures.sizes.at(-1)?.link || ''
      }

      // Get creator avatar
      let creatorAvatar = ownerAvatar
      if (video.user?.pictures?.sizes?.length > 0) {
        creatorAvatar = video.user.pictures.sizes[0].link || creatorAvatar
      }

      return {
        id: Number(vimeoId) || vimeoId,
        vimeoId: vimeoId,
        title: video.name || 'Untitled Video',
        description: video.description || 'No description available.',
        creator: albumInfo.user?.name || video.user?.name || 'Unknown Creator',
        creatorAvatar: creatorAvatar,
        subscribers: 'Vimeo Channel',
        views: video.stats?.plays !== undefined ? `${video.stats.plays.toLocaleString()} views` : '0 views',
        timeAgo: video.release_time ? formatTimeAgo(video.release_time) : 'unknown',
        duration: formatDuration(video.duration || 0),
        thumbnail: thumbnail,
        canPlay: true
      }
    })

    return {
      success: true,
      showcase: {
        id: showcaseId,
        name: albumInfo.name || 'Showcase Playlist',
        description: albumInfo.description || '',
        privacy: privacyView
      },
      owner: {
        id: userId,
        name: albumInfo.user?.name || 'Vimeo Creator',
        avatar: ownerAvatar
      },
      videos: playlist
    }
  } catch (error: any) {
    console.error(`Critical error fetching showcase ${showcaseId}:`, error)
    return {
      success: false,
      error: error.data?.error || error.message || 'An unexpected error occurred',
      isPasswordProtected: showcaseId === '12107219'
    }
  }
})

export default handler
