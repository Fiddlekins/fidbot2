import {UserRaw} from "./UserRaw";

export interface ReplyMetaRaw {
  /**
   * Unique ID of the chat node
   */
  _id: string;

  /**
   * The chat node body
   */
  b: string;

  /**
   * Whether the node being replied to should be displayed in the reply
   * This is false when the reply is to a story content node
   */
  hide: boolean;

  /**
   * The chat node owners
   */
  u?: string | UserRaw[]
}
