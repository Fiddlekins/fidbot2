import {ChapterMeta} from "../types";
import {ChapterMetaRaw} from "../typesRaw";

export function processChapterMeta(chapterMetaRaw: ChapterMetaRaw): ChapterMeta {
  return {
    id: chapterMetaRaw.id,
    timeCreated: new Date(chapterMetaRaw.ct),
    title: chapterMetaRaw.title,
  };
}
