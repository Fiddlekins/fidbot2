import {ReplyMeta} from "../types/ReplyMeta";
import {ReplyMetaRaw} from "../types/ReplyMetaRaw";
import {processUsers} from "./processUsers";

export function processReplyMeta(replyMetaRaw: ReplyMetaRaw): ReplyMeta {
  return {
    id: replyMetaRaw._id,
    body: replyMetaRaw.b,
    users: processUsers(replyMetaRaw.u),
  };
}
