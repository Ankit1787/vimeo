import { defineEventHandler, getQuery, readBody, createError } from 'h3'
import type { EventHandler } from 'h3'

const handler: EventHandler<any, any> = defineEventHandler(async (event): Promise<any> => {
  const vimeoToken = process.env.VIMEO_ACCESS_TOKEN || '9351566291671b41973dde5d2d1e90ab'
  const ytApiKey = process.env.YOUTUBE_API_KEY

  const method = event.node.req.method
  const query = getQuery(event)
  const videoId = String(query.videoId || '')

  if (!videoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'videoId is required'
    })
  }

  // Detect platform based on videoId (Vimeo is numeric, YouTube is alphanumeric string)
  const isYoutube = isNaN(Number(videoId))

  // console.log("isYoutube", isYoutube,videoId,method,ytApiKey)


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
    return `${days}d ago`
  }

  if (method === 'GET') {
    if (isYoutube) {
      if (ytApiKey) {
        try {
          const response = await $fetch<any>(`https://www.googleapis.com/youtube/v3/commentThreads`, {
            query: {
              part: 'snippet',
              videoId: videoId,
              maxResults: 20,
              key: ytApiKey
            }
          })

          const commentsList = (response.items || []).map((item: any) => {
            const snippet = item.snippet.topLevelComment.snippet
            return {
              id: item.id,
              author: snippet.authorDisplayName,
              avatar: snippet.authorProfileImageUrl,
              content: snippet.textDisplay,
              timeAgo: formatTimeAgo(snippet.publishedAt),
              likes: snippet.likeCount || 0,
              hasLiked: false,
              showReplyInput: false,
              replyText: '',
              replies: []
            }
          })
          return { comments: commentsList }
        } catch (error: any) {
          console.error('Error fetching YouTube comments:', error)
          return { comments: [], error: error.message }
        }
      } else {
        // Fallback Mock YouTube Comments
        return {
          comments: [
            {
              id: 'yt-mock-1',
              author: 'Banco E-AMAZÔNIA',
              avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDm68foQp4UiyghE-pSOq6X59D5zh55RHpLzL8yCcOY79n0foGxd3QuB7EEiOz1_w6VhCp6AfLRMqml-JQ91_IsHPRWQ97AwbMazMdYNW-Lt9RRs6flFNYpEViNlBo7tJrTa_bHgFq672A8pjD0QMaP5h3gfUaBWubJoBx6iiAaTOgV25xCOPKXkS2IG2Ts_yJfrqwjTFDoIigLOoMamSHAceXHyn7zHvXY9Gn5RQejVW-1r84spTJeo70No2V7ZPacpLkV3elN9CM',
              content: 'So informative! Learned so much.',
              timeAgo: '2 hours ago',
              likes: 24,
              hasLiked: false,
              showReplyInput: false,
              replyText: '',
              replies: []
            },
            {
              id: 'yt-mock-2',
              author: 'alzareef company',
              avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHLuMbtDLbgiBO2ZBsybapbldsm4ewOVf_EsHYB9Io0wQ4ghGQeU2bDj6oNZM79msoc2irVBneTH6hBAGlZcc7aQaqnQgPci7nGORxwcQJvjIgZUVtNDDyjGQyPxEmnru0N1yXZ_JskKyaktoq_3hoMCcgEfxTFreWKBiLU0rID2wwIHaXwgm0QNNmCfFwxO2lGnhM4_HmrRxH9YWnCLzS6TJuXqHj1ytmNHefSFNheZpiSKYUW30kG89CUW4mSzWhVY_7E7TlS5I',
              content: 'great info',
              timeAgo: '2 hours ago',
              likes: 8,
              hasLiked: false,
              showReplyInput: false,
              replyText: '',
              replies: []
            },
            {
              id: 'yt-mock-3',
              author: 'Zofia',
              avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_i0LD4aGGTlyCVrdi2LUoM9IkRgvYqTbDivktQRQy0kV34LyBlVRFWC9salCknHM2DOA8eNJDXcBFpQbH5Vudjzlztl70xVeoWAJdXScdIzTAVysak7mT0oUsulYMzA8ADqW62kF2gYlQbOYC6jzGQTAJ6YTMTJSMqRKV0OZzehPhHwpRsjFCIJKAePkJchyDvGA476r7NFJ_ZerHSHwUiUr6thl7h1sU2Xi11pxwlwLGSwxPjOzMxsX_ZdEsmiE0Lm7peJGWhJE',
              content: 'Perfectly explained. Now I have something to show my clients.',
              timeAgo: '4 hours ago',
              likes: 56,
              hasLiked: false,
              showReplyInput: false,
              replyText: '',
              replies: []
            },
            {
              id: 'yt-mock-4',
              author: 'Artis Film',
              avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCH-l4eC9A4-wUXfrhUreqRtH7UB0fizc1AwJfazOWUG6iQJYzcEtUrrWEdnFYSJGwXCLGgwEXGcEInU4PfV0numRuJnPyIk6s08BYmansZs3Hs3r5Eg0ltnLmocg2st_l5ArdfiZaoLTf-7PJVhu1JUlivnNhe8-nDNI_okkVEPOSklUIPHUV4LCWvDl3ssbCa8jlPw9onrFEGjh-oWGkPIBrs_w3JWnbxPm-8TL4PF2QovuVDQNPqq3tGm8oCuDnCfFy0vVWwAcQ',
              content: 'Really like this series',
              timeAgo: '8 hours ago',
              likes: 12,
              hasLiked: false,
              showReplyInput: false,
              replyText: '',
              replies: []
            }
          ]
        }
      }
    } else {
      // Vimeo comments
      try {
        const response = await $fetch<any>(`https://api.vimeo.com/videos/${videoId}/comments`, {
          headers: {
            Authorization: `Bearer ${vimeoToken}`,
            Accept: 'application/vnd.vimeo.comment+json;version=3.4'
          }
        })

        const commentsList = (response.data || []).map((c: any) => {
          let avatar = ''
          if (c.user && c.user.pictures && c.user.pictures.sizes && c.user.pictures.sizes.length > 0) {
            const sizes = c.user.pictures.sizes
            avatar = sizes[Math.min(2, sizes.length - 1)].link
          }

          return {
            id: c.uri.split('/').pop() || String(Math.random()),
            author: c.user?.name || 'Anonymous',
            avatar: avatar,
            content: c.text,
            timeAgo: formatTimeAgo(c.created_time),
            likes: 0,
            hasLiked: false,
            showReplyInput: false,
            replyText: '',
            replies: []
          }
        })

        return { comments: commentsList }
      } catch (error: any) {
        console.error('Error fetching Vimeo comments:', error)
        return { comments: [], error: error.message }
      }
    }
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const text = body.text
      //  console.log("this in post")
    if (!text) {
            //  console.log("this in error")

      throw createError({
        statusCode: 400,
        statusMessage: 'text is required'
      })
    }

    if (isYoutube) {
      // YouTube write requires OAuth 2.0, so we return success with a local mock response.
      return {
        success: true,
        comment: {
          id: String(Date.now()),
          author: 'You (Viewer)',
          avatar: '',
          content: text,
          timeAgo: 'Just now',
          likes: 0,
          hasLiked: false,
          showReplyInput: false,
          replyText: '',
          replies: []
        }
      }
    } else {
      // Vimeo comment post
      try {
        const response = await $fetch<any>(`https://api.vimeo.com/videos/${videoId}/comments`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${vimeoToken}`,
            'Content-Type': 'application/json',
            Accept: 'application/vnd.vimeo.comment+json;version=3.4'
          },
          body: {
            text: text
          }
        })

        let avatar = ''
        if (response.user && response.user.pictures && response.user.pictures.sizes && response.user.pictures.sizes.length > 0) {
          const sizes = response.user.pictures.sizes
          avatar = sizes[Math.min(2, sizes.length - 1)].link
        }
        console.log(response,"response")

        return {
          success: true,
          comment: {
            id: response.uri.split('/').pop() || String(Math.random()),
            author: response.user?.name || 'You',
            avatar: avatar,
            content: response.text,
            timeAgo: 'Just now',
            likes: 0,
            hasLiked: false,
            showReplyInput: false,
            replyText: '',
            replies: []
          }
        }
      } catch (error: any) {
        console.error('Error adding Vimeo comment:', error)
        throw createError({
          statusCode: error.statusCode || 500,
          statusMessage: error.data?.error || error.message || 'Failed to add comment'
        })
      }
    }
  }
})

export default handler
