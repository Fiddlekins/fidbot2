import {storyNameToIdCache} from "../config";
import {get} from "./get";
import {processStoryNode} from "./processors/processStoryNode";
import {tryParseJson} from "./tryParseJson";
import {StoryNode} from "./types";
import {StoryNodeRaw} from "./typesRaw";

export async function getStoryNode(id: string): Promise<StoryNode | null> {
  const response = await get(`api/node/${id}`);
  if (response === 'null') {
    return null;
  }
  const storyNodeRaw = tryParseJson(response) as StoryNodeRaw;
  try {
    const storyNode = processStoryNode(storyNodeRaw);
    storyNameToIdCache.set(storyNode.title, storyNode.id);
    return storyNode;
  } catch (err) {
    console.error(err);
    throw new Error('getStoryNode failed');
  }
}
