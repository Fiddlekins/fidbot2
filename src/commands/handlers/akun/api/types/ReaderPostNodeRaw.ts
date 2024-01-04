import {BaseNodeRaw} from "./BaseNodeRaw";
import {ChatNodeRaw} from "./ChatNodeRaw";
import {UserSessionId, UUID} from "./ids";

export interface ReaderPostNodeRaw extends BaseNodeRaw {
  /**
   * The timestamp that the vote is configured to automatically close at
   */
  autoClose?: string;

  /**
   * Poll description
   */
  b?: string;

  /**
   * Undefined if the choice is open
   */
  closed?: 'closed';

  /**
   * Maps session ID to HTML formatted dice output
   */
  dice?: Record<UserSessionId, string>;

  /**
   * Whether only fanclub members can vote
   */
  fanclubExclusive?: boolean;

  /**
   * Last reply node
   */
  lr?: ChatNodeRaw;

  /**
   * Node type is always 'readerPost'
   */
  nt: 'readerPost';

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
   * TODO
   */
  staticReaderPosts?: boolean;

  /**
   * TODO
   */
  w: number;
}
