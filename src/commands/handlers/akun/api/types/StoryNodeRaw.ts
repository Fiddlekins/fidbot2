import {BaseNodeRaw} from "./BaseNodeRaw";
import {ChapterMetaRaw} from "./ChapterMetaRaw";
import {ChatNodeRaw} from "./ChatNodeRaw";

export interface StoryNodeRaw extends BaseNodeRaw {
  /**
   * List of the chapters
   * Missing if the author has never created a new chapter
   */
  bm?: ChapterMetaRaw[];

  /**
   * TODO
   */
  cht: number;

  /**
   * The story's content rating
   */
  contentRating: 'teen' | 'mature' | 'nsfw' | 'unrated';

  /**
   * Time of story node creation
   */
  ct: number;

  /**
   * The story's description
   */
  d: string;

  /**
   * TODO
   */
  dn?: string;

  /**
   * The story's cover image
   * Unclear to me why it's an array as I've only observed it with a single element
   */
  i?: string[];

  /**
   * TODO
   */
  init: boolean;

  /**
   * Whether the story is currently live
   */
  isLive?: boolean;

  /**
   * The number of "likes" a story has received
   */
  likeCount?: number;

  /**
   * Last reply node
   */
  lr?: ChatNodeRaw;

  /**
   * TODO
   */
  mcOff: boolean;

  /**
   * TODO
   */
  mod?: unknown[];

  /**
   * Timestamp of scheduled live session
   */
  nextLive?: number | null;

  /**
   * Node type is always 'story'
   */
  nt: 'story';

  /**
   * Number of user comments on the story
   */
  p?: number;

  /**
   * "Level of Voting Control"
   */
  rInput?: 'none' | 'light' | 'medium' | 'heavy';

  /**
   * "Story Interactivity"
   */
  rInteract?: 'none' | 'light' | 'medium' | 'heavy';

  /**
   * TODO
   */
  rt: number;

  /**
   * List of spoiler tags
   */
  spoilerTags: string[];

  /**
   * The story's current status
   */
  storyStatus: 'active' | 'finished' | 'hiatus' | 'discontinued';

  /**
   * The story's title
   */
  t: string;

  /**
   * List of tags, including spoiler tags
   */
  ta: string[];

  /**
   * Whether the story is hidden
   */
  trash: boolean;

  /**
   * TODO
   */
  u2?: unknown[];

  /**
   * Whether only users that are "verified" can interact with the story
   */
  verifiedOnly?: boolean;

  /**
   * Word count
   */
  w: number;
}
