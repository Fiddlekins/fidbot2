import {ChannelPresence} from "./ChannelPresence";
import {PartialStoryNodeRaw} from "./PartialStoryNodeRaw";

export interface LiveResponse {
  stories: PartialStoryNodeRaw[]
}

export interface StoriesResponse {
  stories: PartialStoryNodeRaw[]
  storiesByHype: PartialStoryNodeRaw[]
}

export type ActivesCountResponse = ChannelPresence[];
