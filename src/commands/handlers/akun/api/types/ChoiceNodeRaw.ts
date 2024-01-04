import {BaseNodeRaw} from "./BaseNodeRaw";
import {ChatNodeRaw} from "./ChatNodeRaw";
import {ChoiceId, UserSessionId, UUID,} from "./ids";

export interface ChoiceNodeRaw extends BaseNodeRaw {
  /**
   * The timestamp that the vote is configured to automatically close at
   */
  autoClose?: string;

  /**
   * Poll description
   */
  b?: string;

  /**
   * The number of chat replies each choice has received
   */
  choiceReplies?: Record<ChoiceId, { count: number }>;

  /**
   * List of choice descriptions
   */
  choices: string[];

  /**
   * Undefined if the choice is open
   */
  closed?: 'closed';

  /**
   * Whether users can submit custom choices
   */
  custom?: boolean;

  /**
   * Whether only fanclub members can vote
   */
  fanclubExclusive?: boolean;

  /**
   * Last reply node
   */
  lr?: ChatNodeRaw;

  /**
   * Whether users can vote for multiple choices
   */
  multiple?: boolean;

  /**
   * Node type is always 'choice'
   */
  nt: 'choice';

  /**
   * TODO
   */
  NUT?: number;

  /**
   * TODO
   */
  o: string;

  /**
   * TODO
   */
  p: number;

  /**
   * TODO
   */
  rt: number;

  /**
   * StoryNode ID
   */
  sid: UUID;

  /**
   * Maps session ID at time of voting to userId
   */
  uidUser: Record<UserSessionId, UUID>;

  /**
   * Maps userId to votes cast
   * Only includes votes from non-anon users
   */
  userVotes: Record<UUID, ChoiceId[]>;

  /**
   * Maps session ID to votes cast
   * Includes all votes
   */
  votes: Record<UserSessionId, ChoiceId[]>;

  /**
   * TODO
   */
  w: number;
}
