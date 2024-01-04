import {UUID} from "./ids";

export interface ChapterMetaRaw {
  /**
   * Time of chapter node creation
   */
  ct: number;

  /**
   * Unique ID of the chapter node
   */
  id: UUID;

  /**
   * The title given to the chapter
   */
  title: string;
}
