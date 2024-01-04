import {storyNameToIdCache} from "../config";
import {get} from "./get";
import {processPartialStoryNode} from "./processors/processPartialStoryNode";
import {tryParseJson} from "./tryParseJson";
import {PartialStoryNode} from "./types/PartialStoryNode";
import {LiveResponse} from "./types/responses";

export async function getLive(): Promise<PartialStoryNode[]> {
  const response = await get('api/anonkun/board/live');
  const liveResponse = tryParseJson(response) as LiveResponse;
  try {
    const partialStoryNodes = liveResponse.stories.map(processPartialStoryNode);
    for (const partialStoryNode of partialStoryNodes) {
      storyNameToIdCache.set(partialStoryNode.title, partialStoryNode.id);
    }
    return partialStoryNodes;
  } catch (err) {
    console.error(err);
    throw new Error('getLive failed');
  }
}
