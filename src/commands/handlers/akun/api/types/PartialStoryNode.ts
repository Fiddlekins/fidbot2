import {StoryNode} from "./StoryNode";

export interface PartialStoryNode extends Pick<
  StoryNode,
  'description' | 'coverImages' | 'likeCount' | 'tagsAll' | 'commentCount' | 'isLive' | 'title'
  | 'users' | 'wordCount' | 'contentRating' | 'timeUpdated' | 'id'
> {
  /**
   * TODO
   */
  // hype?: number;
}
