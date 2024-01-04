import {ChannelPresence} from "./ChannelPresence";
import {ChapterNodeRaw} from "./ChapterNodeRaw";
import {ChatNodeRaw} from "./ChatNodeRaw";
import {ChoiceNodeRaw} from "./ChoiceNodeRaw";
import {PartialStoryNodeRaw} from "./PartialStoryNodeRaw";

export interface LiveResponse {
  stories: PartialStoryNodeRaw[]
}

export interface StoriesResponse {
  stories: PartialStoryNodeRaw[]
  storiesByHype: PartialStoryNodeRaw[]
}

export type ActivesCountResponse = ChannelPresence[];

export type ChaptersResponse = (ChapterNodeRaw | ChoiceNodeRaw)[];

export type ChatResponse = ChatNodeRaw[];
