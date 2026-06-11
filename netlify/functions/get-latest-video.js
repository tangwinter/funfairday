// Netlify Function: Get Latest Video Thumbnail from YouTube Channel
// Requires YOUTUBE_API_KEY environment variable set in Netlify
// Get a free API key: https://console.cloud.google.com/apis/library/youtube.googleapis.com

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { channels } = JSON.parse(event.body);
        const apiKey = process.env.YOUTUBE_API_KEY;

        if (!channels || !Array.isArray(channels)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No channels provided' })
            };
        }

        if (!apiKey) {
            // Return empty thumbnails as fallback
            return {
                statusCode: 200,
                body: JSON.stringify({
                    thumbnails: channels.map(() => null),
                    message: 'YouTube API key not configured. Set YOUTUBE_API_KEY env variable.'
                })
            };
        }

        const thumbnails = [];

        for (const handle of channels) {
            try {
                // Step 1: Get channel ID from handle
                const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(handle)}&type=channel&key=${apiKey}`;
                const searchRes = await fetch(searchUrl);
                const searchData = await searchRes.json();

                if (!searchData.items || searchData.items.length === 0) {
                    thumbnails.push(null);
                    continue;
                }

                const channelId = searchData.items[0].snippet.channelId;

                // Step 2: Get latest video from channel
                const videosUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=1&type=video&key=${apiKey}`;
                const videosRes = await fetch(videosUrl);
                const videosData = await videosRes.json();

                if (!videosData.items || videosData.items.length === 0) {
                    thumbnails.push(null);
                    continue;
                }

                // Get the high-quality thumbnail of the latest video
                const thumbnail = videosData.items[0].snippet.thumbnails.high?.url
                    || videosData.items[0].snippet.thumbnails.medium?.url
                    || videosData.items[0].snippet.thumbnails.default?.url;

                thumbnails.push(thumbnail || null);

            } catch (err) {
                console.error('Error fetching channel:', handle, err.message);
                thumbnails.push(null);
            }
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ thumbnails })
        };

    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
