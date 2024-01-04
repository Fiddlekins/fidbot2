import {User} from "./User";

export interface BaseNode {
  /**
   * Unique ID of the node
   */
  id: string;

  /**
   * Node type
   */
  nodeType: 'chat' | 'chapter' | 'choice' | 'story';

  /**
   * Timestamp of node creation
   */
  timeCreated: Date;

  /**
   * Timestamp of latest node update
   */
  timeUpdated: Date;

  /**
   * The node owners
   */
  users: User[]
}
