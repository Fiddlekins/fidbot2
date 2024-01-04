import {UUID} from "./ids";

export interface ChapterMeta {
  /**
   * Unique ID of the chapter node
   */
  id: UUID;

  /**
   * Time of chapter node creation
   */
  timeCreated: Date;

  /**
   * The title given to the chapter
   */
  title: string;
}
