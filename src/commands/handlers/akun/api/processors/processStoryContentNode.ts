import {StoryContentNode} from "../types/StoryContentNode";
import {StoryContentNodeRaw} from "../types/StoryContentNodeRaw";
import {processChapterNode} from "./processChapterNode";
import {processChoiceNode} from "./processChoiceNode";
import {processReaderPostNode} from "./processReaderPostNode";

export function processStoryContentNode(storyContentNodeRaw: StoryContentNodeRaw): StoryContentNode | null {
  switch (storyContentNodeRaw.nt) {
    case 'chapter':
      return processChapterNode(storyContentNodeRaw);
    case 'choice':
      return processChoiceNode(storyContentNodeRaw);
    case 'readerPost':
      return processReaderPostNode(storyContentNodeRaw);
    default:
      console.error(`Unrecognised storyContentNode type: ${JSON.stringify(storyContentNodeRaw)}'`);
      return null;
  }
}
