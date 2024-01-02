import {imageURLParser} from "../../utils/imageURLParser";
import {StoryNode} from "../types";
import {StoryNodeRaw} from "../typesRaw";
import {processChapterMeta} from "./processChapterMeta";
import {processChatNode} from "./processChatNode";
import {processUsers} from "./processUsers";

export function processStoryNode(storyNodeRaw: StoryNodeRaw): StoryNode {
  return {
    id: storyNodeRaw._id,
    timeCreated: new Date(storyNodeRaw.ct),
    timeUpdated: new Date(storyNodeRaw.ut),
    users: processUsers(storyNodeRaw.u),

    chapters: storyNodeRaw.bm.map(processChapterMeta),
    commentCount: storyNodeRaw.p,
    contentRating: storyNodeRaw.contentRating,
    coverImages: storyNodeRaw.i
        ?.map(imageUrl => imageURLParser(imageUrl))
        .filter((parsedUrl): parsedUrl is string => !!parsedUrl)
      || [],
    description: storyNodeRaw.d,
    isLive: storyNodeRaw.isLive,
    lastReply: processChatNode(storyNodeRaw.lr),
    likeCount: storyNodeRaw.likeCount,
    nextLive: storyNodeRaw.nextLive ? new Date(storyNodeRaw.nextLive) : undefined,
    nodeType: storyNodeRaw.nt,
    readerInput: storyNodeRaw.rInput,
    readerInteractivity: storyNodeRaw.rInteract,
    storyStatus: storyNodeRaw.storyStatus,
    tagsAll: storyNodeRaw.ta,
    tagsSpoiler: storyNodeRaw.spoilerTags,
    title: storyNodeRaw.t,
    unpublished: storyNodeRaw.trash,
    wordCount: storyNodeRaw.w,
  };
}
