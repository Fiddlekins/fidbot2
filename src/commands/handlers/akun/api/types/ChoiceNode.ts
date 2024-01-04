import {BaseNode} from "./BaseNode";
import {ChatNode} from "./ChatNode";
import {ChoiceId, UserSessionId, UUID} from "./ids";

export interface Voter {
  userSessionId: UserSessionId;
  userId?: UUID;
}

export interface ChoiceNode extends BaseNode {
  /**
   * Whether users can interact with the poll
   */
  active: boolean;

  /**
   * The date that the vote is configured to automatically close at
   */
  autoCloseDate?: Date;

  /**
   * The number of chat replies each choice has received
   */
  choiceReplyCount: Record<ChoiceId, number>;

  /**
   * Maps choiceId to the choice description
   */
  choices: Record<ChoiceId, string>;

  /**
   * Whether users can submit custom choices
   */
  custom: boolean;

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
   * Whether users can vote for multiple choices
   */
  multiple: boolean;

  /**
   * Node type is always 'choice'
   */
  nodeType: 'choice';

  /**
   * StoryNode ID
   */
  storyNodeId: UUID;

  /**
   * Maps session ID to votes cast
   * Includes all votes
   */
  votes: Record<UserSessionId, ChoiceId[]>;

  /**
   * Maps session ID to voter data
   */
  voters: Record<UserSessionId, Voter>;
}
