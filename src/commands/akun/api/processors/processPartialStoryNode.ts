import {imageURLParser} from "../../utils/imageURLParser";
import {PartialStoryNode} from "../types";
import {PartialStoryNodeRaw} from "../typesRaw";
import {processUsers} from "./processUsers";

export function processPartialStoryNode(partialStoryNodeRaw: PartialStoryNodeRaw): PartialStoryNode {
  return {
    id: partialStoryNodeRaw._id,
    timeUpdated: new Date(partialStoryNodeRaw.ut),
    users: processUsers(partialStoryNodeRaw.u),

    commentCount: partialStoryNodeRaw.p || 0,
    contentRating: partialStoryNodeRaw.contentRating,
    coverImages: partialStoryNodeRaw.i
        ?.map(imageUrl => imageURLParser(imageUrl))
        .filter((parsedUrl): parsedUrl is string => !!parsedUrl)
      || [],
    description: partialStoryNodeRaw.d,
    isLive: partialStoryNodeRaw.isLive || false,
    likeCount: partialStoryNodeRaw.likeCount || 0,
    tagsAll: partialStoryNodeRaw.ta,
    title: partialStoryNodeRaw.t,
    wordCount: partialStoryNodeRaw.w,
  };
}
