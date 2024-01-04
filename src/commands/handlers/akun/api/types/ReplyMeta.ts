import {User} from "./User";

export interface ReplyMeta {
  /**
   * Unique ID of the chat node
   */
  id: string;

  /**
   * The chat node body
   */
  body: string;

  /**
   * The chat node owners
   */
  users: User[]
}
