import querystring from "querystring";
import {storyNameToIdCache} from "../config";
import {get} from "./get";
import {processPartialStoryNode} from "./processors/processPartialStoryNode";
import {tryParseJson} from "./tryParseJson";
import {PartialStoryNode} from "./types";
import {StoriesResponse} from "./typesRaw";

export async function getStories(page: number): Promise<PartialStoryNode[]> {
  const queryParams = {
    contentRating: 'mature,nsfw,teen,unrated',
    storyStatus: 'active,finished,hiatus,discontinued',
    sort: 'new',
    page
  }
  const queryString = querystring.encode(queryParams);
  const response = await get(`api/anonkun/board/stories?${queryString}`);
  const storiesResponse = tryParseJson(response) as StoriesResponse;
  try {
    const partialStoryNodes = storiesResponse.stories.map(processPartialStoryNode);
    for (const partialStoryNode of partialStoryNodes) {
      storyNameToIdCache.set(partialStoryNode.title, partialStoryNode.id);
    }
    return partialStoryNodes;
  } catch (err) {
    console.error(err);
    throw new Error('getLive failed');
  }
}
