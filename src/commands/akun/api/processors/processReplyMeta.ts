import {ReplyMeta} from "../types";
import {ReplyMetaRaw} from "../typesRaw";
import {processUser} from "./processUser";

export function processReplyMeta(replyMetaRaw: ReplyMetaRaw): ReplyMeta {
  return {
    id: replyMetaRaw._id,
    body: replyMetaRaw.b,
    users: replyMetaRaw.u?.map(processUser) || []
  };
}
