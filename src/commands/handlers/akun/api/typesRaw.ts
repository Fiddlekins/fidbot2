export interface BaseNodeRaw {
  /**
   * Unique ID of the node
   */
  _id: string;

  /**
   * Timestamp of node creation
   */
  ct: number;

  /**
   * Node type
   */
  nt: 'chat' | 'chapter' | 'choice' | 'story';

  /**
   * The node owners
   */
  u: string | UserRaw[]

  /**
   * Timestamp of latest node update
   */
  ut: number;
}

export interface UserRaw {
  /**
   * Unique ID of the user
   * Absent if the user is anon
   */
  _id?: string;

  /**
   * Avatar image URL
   */
  a?: string;

  /**
   * Username
   */
  n: string;
}

export interface ReplyMetaRaw {
  /**
   * Unique ID of the chat node
   */
  _id: string;

  /**
   * The chat node body
   */
  b: string;

  /**
   * Whether the node being replied to should be displayed in the reply
   * This is false when the reply is to a story content node
   */
  hide: boolean;

  /**
   * The chat node owners
   */
  u?: string | UserRaw[]
}

export interface ChatNodeRaw extends BaseNodeRaw {
  /**
   * The chat node body
   * Missing if the chat node was an image post
   */
  b?: string;

  /**
   * The image URL
   * Missing if the chat node was a text post
   */
  i?: string;

  /**
   * Node type is always 'chat'
   */
  nt: 'chat';

  /**
   * IDs of nodes this chat node is a "reply" to
   * In stories this includes the story node ID, and potentially a chat node ID if it was a direct reply
   */
  r: string[];

  /**
   * Data about the chat node being replied to
   */
  ra?: ReplyMetaRaw;

  /**
   * Time reply was created
   */
  rt: number;
}

export interface ChapterMetaRaw {
  /**
   * Time of chapter node creation
   */
  ct: number;

  /**
   * Unique ID of the chapter node
   */
  id: string;

  /**
   * The title given to the chapter
   */
  title: string;
}

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

export interface PartialStoryNodeRaw extends Pick<StoryNodeRaw, 'd' | 'i' | 'likeCount' | 'ta' | 'cht' | 'p' | 'isLive' | 't' | 'u' | 'w' | 'contentRating' | 'ut' | '_id'> {
  /**
   * TODO
   */
  hype?: number;
}

export interface LiveResponse {
  stories: PartialStoryNodeRaw[]
}

export interface StoriesResponse {
  stories: PartialStoryNodeRaw[]
  storiesByHype: PartialStoryNodeRaw[]
}

export interface ChannelPresence {
  /**
   * The channel ID
   */
  id: string;

  /**
   * The number of users present
   */
  count: number;
}

export type ActivesCountResponse = ChannelPresence[];
