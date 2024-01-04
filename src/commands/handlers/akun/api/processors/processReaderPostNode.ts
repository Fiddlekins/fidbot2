import {ReaderPostNode} from "../types/ReaderPostNode";
import {ReaderPostNodeRaw} from "../types/ReaderPostNodeRaw";
import {processChatNode} from "./processChatNode";
import {processUsers} from "./processUsers";

export function processReaderPostNode(readerPostNodeRaw: ReaderPostNodeRaw): ReaderPostNode {
  return {
    id: readerPostNodeRaw._id,
    timeCreated: new Date(readerPostNodeRaw.ct),
    timeUpdated: new Date(readerPostNodeRaw.ut),
    users: processUsers(readerPostNodeRaw.u),

    active: readerPostNodeRaw.closed !== 'closed',
    autoCloseDate: readerPostNodeRaw.autoClose ? new Date(parseInt(readerPostNodeRaw.autoClose, 10)) : undefined,
    description: readerPostNodeRaw.b || '',
    fanclubExclusive: !!readerPostNodeRaw.fanclubExclusive,
    lastReply: readerPostNodeRaw.lr ? processChatNode(readerPostNodeRaw.lr) : null,
    nodeType: 'readerPost',
    storyNodeId: readerPostNodeRaw.sid,
  };
}
