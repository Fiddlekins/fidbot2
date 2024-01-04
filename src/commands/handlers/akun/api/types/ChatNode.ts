import {BaseNode} from "./BaseNode";
import {ReplyMeta} from "./ReplyMeta";

export interface ChatNode extends BaseNode {
  /**
   * The chat node body
   * Missing if the chat node was an image post
   */
  body?: string;

  /**
   * The image URL
   * Missing if the chat node was a text post
   */
  image?: string;

  /**
   * Node type is always 'chat'
   */
  nodeType: 'chat';

  /**
   * IDs of nodes this chat node is a "reply" to
   * In stories this includes the story node ID, and potentially a chat node ID if it was a direct reply
   */
  replyIds: string[];

  /**
   * Data about the chat node being replied to
   */
  replyMeta?: ReplyMeta;

  /**
   * Time reply was created
   */
  timestampReply: Date;
}
