import {UserRaw} from "./UserRaw";

export interface BaseNodeRaw {
  /**
   * Unique ID of the node
   */
  _id: string;

  /**
   * Timestamp of node creation
   */
  ct: number;

  /**
   * Node type
   */
  nt: 'chat' | 'chapter' | 'choice' | 'story';

  /**
   * The node owners
   */
  u: string | UserRaw[]

  /**
   * Timestamp of latest node update
   */
  ut: number;
}
