import {storyNameToIdCache} from "../config";
import {get} from "./get";
import {processLiveStoryMeta} from "./processors/processLiveStoryMeta";
import {tryParseJson} from "./tryParseJson";
import {LiveStoryMeta} from "./types";
import {LiveResponse} from "./typesRaw";

export async function getLive(): Promise<LiveStoryMeta[]> {
  const response = await get('api/anonkun/board/live');
  const liveResponse = tryParseJson(response) as LiveResponse;
  try {
    const liveStoryMetas = liveResponse.stories.map(processLiveStoryMeta);
    for (const liveStoryMeta of liveStoryMetas) {
      storyNameToIdCache.set(liveStoryMeta.title, liveStoryMeta.id);
    }
    return liveStoryMetas;
  } catch (err) {
    console.error(err);
    throw new Error('getLive failed');
  }
}
