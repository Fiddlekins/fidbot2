import {StoryNodeRaw} from "./StoryNodeRaw";

export interface PartialStoryNodeRaw extends Pick<
  StoryNodeRaw,
  'd' | 'i' | 'likeCount' | 'ta' | 'cht' | 'p' | 'isLive' | 't' | 'u' | 'w' | 'contentRating' | 'ut' | '_id'
> {
  /**
   * TODO
   */
  hype?: number;
}
