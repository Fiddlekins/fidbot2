import {UUID} from "./ids";
import {User} from "./User";

export interface ReplyMeta {
  /**
   * Unique ID of the chat node
   */
  id: UUID;

  /**
   * The chat node body
   */
  body: string;

  /**
   * The chat node owners
   */
  users: User[]
}
