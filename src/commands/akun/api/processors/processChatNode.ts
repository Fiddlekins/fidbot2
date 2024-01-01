import {ChatNode} from "../types";
import {ChatNodeRaw} from "../typesRaw";
import {processReplyMeta} from "./processReplyMeta";
import {processUser} from "./processUser";

export function processChatNode(chatNodeRaw: ChatNodeRaw): ChatNode {
  return {
    id: chatNodeRaw._id,
    timeCreated: new Date(chatNodeRaw.ct),
    timeUpdated: new Date(chatNodeRaw.ut),
    users: chatNodeRaw.u.map(processUser),

    body: chatNodeRaw.b,
    nodeType: chatNodeRaw.nt,
    replyIds: chatNodeRaw.r,
    replyMeta: chatNodeRaw.ra ? processReplyMeta(chatNodeRaw.ra) : undefined,
    timestampReply: new Date(chatNodeRaw.rt),
  };
}
