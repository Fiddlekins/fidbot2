import {BaseNodeRaw} from "./BaseNodeRaw";
import {UUID} from "./ids";

export interface ChapterNodeRaw extends BaseNodeRaw {
  /**
   * The chapter node body
   * HTML formatted
   */
  b: string;

  /**
   * Whether only fanclub members can vote
   */
  fanclubExclusive?: boolean;

  /**
   * Node type is always 'chapter'
   */
  nt: 'chapter';

  /**
   * TODO
   */
  rt: number;

  /**
   * StoryNode ID
   */
  sid: UUID;

  /**
   * Word count for this node
   */
  w: number;
}
