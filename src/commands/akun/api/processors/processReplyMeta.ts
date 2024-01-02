import {ReplyMeta} from "../types";
import {ReplyMetaRaw} from "../typesRaw";
import {processUsers} from "./processUsers";

export function processReplyMeta(replyMetaRaw: ReplyMetaRaw): ReplyMeta {
  return {
    id: replyMetaRaw._id,
    body: replyMetaRaw.b,
    users: processUsers(replyMetaRaw.u),
  };
}
