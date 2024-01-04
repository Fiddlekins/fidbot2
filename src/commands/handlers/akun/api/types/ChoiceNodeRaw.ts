import {BaseNodeRaw} from "./BaseNodeRaw";
import {ReplyMetaRaw} from "./ReplyMetaRaw";

export interface ChoiceNodeRaw extends BaseNodeRaw {
  /**
   * The chat node body
   * Missing if the chat node was an image post
   */
  b?: string;

  /**
   * The image URL
   * Missing if the chat node was a text post
   */
  i?: string;

  /**
   * Node type is always 'chat'
   */
  nt: 'chat';

  /**
   * IDs of nodes this chat node is a "reply" to
   * In stories this includes the story node ID, and potentially a chat node ID if it was a direct reply
   */
  r: string[];

  /**
   * Data about the chat node being replied to
   */
  ra?: ReplyMetaRaw;

  /**
   * Time reply was created
   */
  rt: number;
}
