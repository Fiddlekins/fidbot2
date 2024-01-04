import {post} from "./post";
import {tryParseJson} from "./tryParseJson";
import {ActivesCountResponse} from "./types/responses";

// TODO
// This currently fails with a cloudflare timeout for unclear reasons
// More perplexingly, even running this in an akun tab dev console context with identical req and res headers as the site
//   initiated requests gets empty responses unlike the site initiated ones.
export async function getStoryActiveCount(id: string): Promise<number> {
  const response = await post(`api/realtime/activesCount`, {'channels[]': [`presence-chat-${id}-latest`]});
  if (!response || response === 'null') {
    return 0;
  }
  const activesCountResponse = tryParseJson(response) as ActivesCountResponse;
  try {
    const desiredChannelPresence = activesCountResponse.find((channelPresence) => {
      return channelPresence.id === `presence-chat-${id}-latest`;
    });
    return desiredChannelPresence?.count || 0;
  } catch (err) {
    console.error(err);
    throw new Error('getStoryActiveCount failed');
  }
}
