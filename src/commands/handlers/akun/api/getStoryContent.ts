import {get} from "./get";
import {processStoryContentNode} from "./processors/processStoryContentNode";
import {tryParseJson} from "./tryParseJson";
import {ChaptersResponse} from "./types/responses";
import {StoryContentNode} from "./types/StoryContentNode";

export interface GetStoryContentOptions {
  timeStart?: number;
  timeEnd?: number;
}

export async function getStoryContent(storyNodeId: string, options?: GetStoryContentOptions): Promise<StoryContentNode[]> {
  let queryUrl = `api/anonkun/chapters/${storyNodeId}`;
  if (options?.timeStart !== undefined) {
    queryUrl = `${queryUrl}/${options.timeStart}/${options.timeEnd || '9999999999999998'}`;
  }
  const response = await get(queryUrl);
  const chaptersResponse = tryParseJson(response) as ChaptersResponse;
  try {
    const storyContentNodes = chaptersResponse.map(processStoryContentNode);
    return storyContentNodes.filter((storyContentNode): storyContentNode is StoryContentNode => storyContentNode !== null);
  } catch (err) {
    console.error(err);
    throw new Error('getLive failed');
  }
}
