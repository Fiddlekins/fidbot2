import {ChatNode} from "../types/ChatNode";
import {ChatNodeRaw} from "../types/ChatNodeRaw";
import {processReplyMeta} from "./processReplyMeta";
import {processUsers} from "./processUsers";

export function processChatNode(chatNodeRaw: ChatNodeRaw): ChatNode | null {
  if (chatNodeRaw.nt !== 'chat') {
    return null;
  }
  return {
    id: chatNodeRaw._id,
    timeCreated: new Date(chatNodeRaw.ct),
    timeUpdated: new Date(chatNodeRaw.ut),
    users: processUsers(chatNodeRaw.u),

    body: chatNodeRaw.b,
    nodeType: chatNodeRaw.nt,
    replyIds: chatNodeRaw.r,
    replyMeta: chatNodeRaw.ra ? processReplyMeta(chatNodeRaw.ra) : undefined,
    timestampReply: new Date(chatNodeRaw.rt),
  };
}
