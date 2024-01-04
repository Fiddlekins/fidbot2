import {ChapterNode} from "../types/ChapterNode";
import {ChapterNodeRaw} from "../types/ChapterNodeRaw";
import {processUsers} from "./processUsers";

export function processChapterNode(chapterNodeRaw: ChapterNodeRaw): ChapterNode {
  return {
    id: chapterNodeRaw._id,
    timeCreated: new Date(chapterNodeRaw.ct),
    timeUpdated: new Date(chapterNodeRaw.ut),
    users: processUsers(chapterNodeRaw.u),

    body: chapterNodeRaw.b,
    fanclubExclusive: !!chapterNodeRaw.fanclubExclusive,
    nodeType: chapterNodeRaw.nt,
    storyNodeId: chapterNodeRaw.sid,
    wordCount: chapterNodeRaw.w,
  };
}
