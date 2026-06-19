// Cloudflare Pages Function: Get Latest Video from YouTube
import { jsonResponse, errorResponse } from './_utils.js';

export async function onRequest(context) {
    try {
        var { request, env } = context;
        if (request.method !== 'POST') return errorResponse('Method not allowed', 405);

        var { channels } = await request.json();
        var apiKey = env.YOUTUBE_API_KEY;

        if (!channels || !Array.isArray(channels)) {
            return errorResponse('No channels provided', 400);
        }

        if (!apiKey) {
            return jsonResponse({
                thumbnails: channels.map(function() { return null; }),
                message: 'YouTube API key not configured'
            });
        }

        var thumbnails = [];
        for (var i = 0; i < channels.length; i++) {
            try {
                var handle = channels[i];
                var searchRes = await fetch(
                    'https://www.googleapis.com/youtube/v3/search?part=snippet&q=' + encodeURIComponent(handle) + '&type=channel&key=' + apiKey
                );
                var searchData = await searchRes.json();

                if (!searchData.items || searchData.items.length === 0) {
                    thumbnails.push(null);
                    continue;
                }

                var channelId = searchData.items[0].snippet.channelId;
                var videosRes = await fetch(
                    'https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=' + channelId + '&order=date&maxResults=1&type=video&key=' + apiKey
                );
                var videosData = await videosRes.json();

                if (!videosData.items || videosData.items.length === 0) {
                    thumbnails.push(null);
                    continue;
                }

                var thumb = videosData.items[0].snippet.thumbnails;
                var thumbnail = (thumb.high && thumb.high.url) || (thumb.medium && thumb.medium.url) || (thumb.default && thumb.default.url) || null;
                thumbnails.push(thumbnail);

            } catch (err) {
                console.error('YouTube fetch error:', err.message);
                thumbnails.push(null);
            }
        }

        return jsonResponse({ thumbnails: thumbnails });

    } catch (error) {
        console.error('get-latest-video error:', error);
        return errorResponse(error.message);
    }
}
