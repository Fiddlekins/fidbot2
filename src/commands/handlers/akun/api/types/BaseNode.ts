import {UUID} from "./ids";
import {User} from "./User";

export interface BaseNode {
  /**
   * Unique ID of the node
   */
  id: UUID;

  /**
   * Node type
   */
  nodeType: 'chapter' | 'chat' | 'choice' | 'readerPost' | 'story';

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
