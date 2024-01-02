import {imageURLParser} from "../../utils/imageURLParser";
import {LiveStoryMeta} from "../types";
import {LiveStoryMetaRaw} from "../typesRaw";
import {processUsers} from "./processUsers";

export function processLiveStoryMeta(liveStoryMetaRaw: LiveStoryMetaRaw): LiveStoryMeta {
  return {
    id: liveStoryMetaRaw._id,
    timeUpdated: new Date(liveStoryMetaRaw.ut),
    users: processUsers(liveStoryMetaRaw.u),

    commentCount: liveStoryMetaRaw.p,
    contentRating: liveStoryMetaRaw.contentRating,
    coverImages: liveStoryMetaRaw.i
        ?.map(imageUrl => imageURLParser(imageUrl))
        .filter((parsedUrl): parsedUrl is string => !!parsedUrl)
      || [],
    description: liveStoryMetaRaw.d,
    isLive: liveStoryMetaRaw.isLive,
    likeCount: liveStoryMetaRaw.likeCount,
    tagsAll: liveStoryMetaRaw.ta,
    title: liveStoryMetaRaw.t,
    wordCount: liveStoryMetaRaw.w,
  };
}
