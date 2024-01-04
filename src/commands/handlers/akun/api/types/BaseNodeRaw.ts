import {UUID} from "./ids";
import {UserRaw} from "./UserRaw";

export interface BaseNodeRaw {
  /**
   * Unique ID of the node
   */
  _id: UUID;

  /**
   * Timestamp of node creation
   */
  ct: number;

  /**
   * Node type
   */
  nt: 'chapter' | 'chat' | 'choice' | 'readerPost' | 'story';

  /**
   * The node owners
   */
  u: string | UserRaw[]

  /**
   * Timestamp of latest node update
   */
  ut: number;
}
