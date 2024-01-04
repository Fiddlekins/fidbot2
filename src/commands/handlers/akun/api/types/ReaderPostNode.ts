import {BaseNode} from "./BaseNode";
import {ChatNode} from "./ChatNode";
import {UUID} from "./ids";

export interface ReaderPostNode extends BaseNode {
  /**
   * Whether users can interact with the poll
   */
  active: boolean;

  /**
   * The date that the vote is configured to automatically close at
   */
  autoCloseDate?: Date;

  /**
   * Poll description
   */
  description: string;

  /**
   * Whether only fanclub members can vote
   */
  fanclubExclusive: boolean;

  /**
   * Last reply node
   */
  lastReply: ChatNode | null;

  /**
   * Node type is always 'readerPost'
   */
  nodeType: 'readerPost';

  /**
   * StoryNode ID
   */
  storyNodeId: UUID;
}
