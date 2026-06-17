import { defineEventHandler, createError } from 'h3'
import type { EventHandler } from 'h3'

// Known passwords for showcases whose owners have given us the password out-of-band.
// Vimeo's public API will not list videos in a password-protected album with a server
// PAT alone; we have to mint a viewer JWT from the showcase embed page and pass the
// password as a query parameter on the album/videos endpoints.
const SHOWCASE_PASSWORDS: Record<string, string> = {
  '12107219': process.env.VIMEO_SHOWCASE_PASSWORD_12107219 || 'SBux_C0L'
}

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

const formatDuration = (secs: number) => {
  if (!secs || isNaN(secs)) return '00:00'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = Math.floor(secs % 60)
  const mStr = m.toString().padStart(2, '0')
  const sStr = s.toString().padStart(2, '0')
  if (h > 0) return `${h}:${mStr}:${sStr}`
  return `${mStr}:${sStr}`
}

// Scrape a short-lived viewer JWT out of the showcase embed page. Vimeo's embed
// player ships one in inline JS (`jwtToken = "..."`); it's scoped to `public` and
// valid for ~1 hour, which is what the password-aware album endpoints expect.
const fetchEmbedJwt = async (showcaseId: string): Promise<string | null> => {
  try {
    const html = await $fetch<string>(`https://vimeo.com/showcase/${showcaseId}/embed`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    const m = html.match(/jwtToken\s*=\s*"([^"]+)"/)
    return m?.[1] || null
  } catch (e) {
    return null
  }
}

const fetchProtectedAlbum = async (showcaseId: string, password: string) => {
  const jwt = await fetchEmbedJwt(showcaseId)
  if (!jwt) return null

  const auth = { Authorization: `jwt ${jwt}`, Accept: 'application/vnd.vimeo.*+json;version=3.4' }
  const qs = `password=${encodeURIComponent(password)}`

  const album = await $fetch<any>(`https://api.vimeo.com/albums/${showcaseId}?${qs}`, { headers: auth })
  const videos = await $fetch<any>(
    `https://api.vimeo.com/albums/${showcaseId}/videos?${qs}&page=1&per_page=100`,
    { headers: auth }
  )

  return { albumInfo: album, videosData: videos?.data || [] }
}

const handler: EventHandler<any, any> = defineEventHandler(async (event): Promise<any> => {
  const vimeoToken = process.env.VIMEO_ACCESS_TOKEN || 'd1df873c006bbbc171977e3140b82754'
  const showcaseId = event.context.params?.id

  if (!showcaseId) {
    throw createError({ statusCode: 400, statusMessage: 'showcaseId parameter is required' })
  }

  try {
    // 1. Try the standard PAT path first.
    let albumInfo: any = null
    let videosData: any[] = []

    try {
      albumInfo = await $fetch<any>(`https://api.vimeo.com/albums/${showcaseId}`, {
        headers: {
          Authorization: `Bearer ${vimeoToken}`,
          Accept: 'application/vnd.vimeo.album+json;version=3.4'
        }
      })
    } catch (err: any) {
      console.warn(`PAT album fetch failed for ${showcaseId}:`, err.message)
    }

    if (albumInfo) {
      const userId = albumInfo.user?.uri?.split('/').pop() || ''
      try {
        const videosResponse = await $fetch<any>(
          `https://api.vimeo.com/users/${userId}/albums/${showcaseId}/videos?page=1&per_page=100`,
          { headers: { Authorization: `Bearer ${vimeoToken}` } }
        )
        videosData = videosResponse?.data || []
      } catch (vErr: any) {
        console.warn(`PAT videos fetch failed for ${showcaseId}:`, vErr.message)
      }
    }

    // 2. Password fallback. If the PAT path returned empty videos and we have a
    // password on file for this showcase, mint a viewer JWT and retry.
    const password = SHOWCASE_PASSWORDS[showcaseId]
    if (videosData.length === 0 && password) {
      const unlocked = await fetchProtectedAlbum(showcaseId, password)
      if (unlocked) {
        albumInfo = unlocked.albumInfo || albumInfo
        videosData = unlocked.videosData
      }
    }

    if (!albumInfo) {
      return { success: false, error: 'Showcase not found' }
    }

    const userId = albumInfo.user?.uri?.split('/').pop() || ''
    const privacyView = albumInfo.privacy?.view || 'anybody'

    if (videosData.length === 0) {
      return {
        success: false,
        isPasswordProtected: true,
        error: 'This showcase is password-protected and the API returned no videos.',
        showcase: {
          id: showcaseId,
          name: albumInfo.name || 'Password Protected Showcase',
          description: albumInfo.description || '',
          privacy: privacyView
        },
        owner: { id: userId, name: albumInfo.user?.name || 'Vimeo Creator' },
        videos: []
      }
    }

    let ownerAvatar = 'https://vimeo.com/assets/images/default_avatar.png'
    if (albumInfo.user?.pictures?.sizes?.length > 0) {
      ownerAvatar = albumInfo.user.pictures.sizes.at(-1)?.link || ownerAvatar
    }

    const playlist = videosData.map((video: any) => {
      // Album video URIs look like `/users/X/albums/Y/videos/{id}:{hash}` for
      // password-protected/unlisted clips. The hash is required to play them.
      const tail = video.uri.split('/').pop() || ''
      const [vimeoId, hash] = tail.split(':')

      let thumbnail = ''
      if (video.pictures?.sizes?.length > 0) {
        thumbnail = video.pictures.sizes.at(-1)?.link || ''
      }

      let creatorAvatar = ownerAvatar
      if (video.user?.pictures?.sizes?.length > 0) {
        creatorAvatar = video.user.pictures.sizes[0].link || creatorAvatar
      }

      return {
        id: Number(vimeoId) || vimeoId,
        vimeoId: vimeoId,
        hash: hash || undefined,
        title: video.name || 'Untitled Video',
        description: video.description || 'No description available.',
        creator: albumInfo.user?.name || video.user?.name || 'Unknown Creator',
        creatorAvatar: creatorAvatar,
        subscribers: 'Vimeo Channel',
        views: video.stats?.plays != null ? `${video.stats.plays.toLocaleString()} views` : '0 views',
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
      owner: { id: userId, name: albumInfo.user?.name || 'Vimeo Creator', avatar: ownerAvatar },
      videos: playlist
    }
  } catch (error: any) {
    console.error(`Critical error fetching showcase ${showcaseId}:`, error)
    return {
      success: false,
      error: error.data?.error || error.message || 'An unexpected error occurred'
    }
  }
})

export default handler
