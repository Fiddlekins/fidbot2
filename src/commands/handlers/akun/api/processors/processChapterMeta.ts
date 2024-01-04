import {ChapterMeta} from "../types/ChapterMeta";
import {ChapterMetaRaw} from "../types/ChapterMetaRaw";

export function processChapterMeta(chapterMetaRaw: ChapterMetaRaw): ChapterMeta {
  return {
    id: chapterMetaRaw.id,
    timeCreated: new Date(chapterMetaRaw.ct),
    title: chapterMetaRaw.title,
  };
}
