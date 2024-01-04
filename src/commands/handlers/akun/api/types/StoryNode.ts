import {BaseNode} from "./BaseNode";
import {ChapterMeta} from "./ChapterMeta";
import {ChatNode} from "./ChatNode";

export interface StoryNode extends BaseNode {
  /**
   * List of the chapters
   */
  chapters: ChapterMeta[];

  /**
   * TODO
   */
  // cht: number;

  /**
   * Number of user comments on the story
   */
  commentCount: number;

  /**
   * The story's content rating
   */
  contentRating: 'teen' | 'mature' | 'nsfw' | 'unrated';

  /**
   * The story's cover image
   * Unclear to me why it's an array as I've only observed it with a single element
   */
  coverImages: string[];

  /**
   * The story's description
   */
  description: string;

  /**
   * TODO
   */
  // dn: string;

  /**
   * TODO
   */
  // init: boolean;

  /**
   * Whether the story is currently live
   */
  isLive: boolean;

  /**
   * Last reply node
   */
  lastReply: ChatNode | null;

  /**
   * The number of "likes" a story has received
   */
  likeCount: number;

  /**
   * TODO
   */
  // mcOff: boolean;

  /**
   * TODO
   */
  // mod: unknown[];

  /**
   * Timestamp of scheduled live session
   */
  nextLive?: Date;

  /**
   * Node type is always 'story'
   */
  nodeType: 'story';

  /**
   * "Level of Voting Control"
   */
  readerInput?: 'none' | 'light' | 'medium' | 'heavy';

  /**
   * "Story Interactivity"
   */
  readerInteractivity?: 'none' | 'light' | 'medium' | 'heavy';

  /**
   * TODO
   */
  // rt: number;

  /**
   * The story's current status
   */
  storyStatus: 'active' | 'finished' | 'hiatus' | 'discontinued';

  /**
   * List of tags, including spoiler tags
   */
  tagsAll: string[];

  /**
   * List of spoiler tags
   */
  tagsSpoiler: string[];

  /**
   * The story's title
   */
  title: string;

  /**
   * Whether the story is hidden
   */
  unpublished: boolean;

  /**
   * TODO
   */
  // u2: unknown[];

  /**
   * Word count
   */
  wordCount: number;
}
