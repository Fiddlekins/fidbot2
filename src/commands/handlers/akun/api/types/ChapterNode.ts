import {BaseNode} from "./BaseNode";
import {UUID} from "./ids";

export interface ChapterNode extends BaseNode {
  /**
   * The chapter node body
   * HTML formatted
   */
  body: string;

  /**
   * Whether only fanclub members can vote
   */
  fanclubExclusive: boolean;

  /**
   * Node type is always 'chapter'
   */
  nodeType: 'chapter';

  /**
   * StoryNode ID
   */
  storyNodeId: UUID;

  /**
   * Word count for this node
   */
  wordCount: number;
}
