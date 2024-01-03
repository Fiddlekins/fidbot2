export interface BaseNode {
  /**
   * Unique ID of the node
   */
  id: string;

  /**
   * Node type
   */
  nodeType: 'chat' | 'chapter' | 'choice' | 'story';

  /**
   * Timestamp of node creation
   */
  timeCreated: Date;

  /**
   * Timestamp of latest node update
   */
  timeUpdated: Date;

  /**
   * The node owners
   */
  users: User[]
}

export interface User {
  /**
   * Unique ID of the user
   * Absent if the user is anon
   */
  id?: string;

  /**
   * Avatar image URL
   */
  avatar?: string;

  /**
   * Username
   */
  username: string;
}

export interface ReplyMeta {
  /**
   * Unique ID of the chat node
   */
  id: string;

  /**
   * The chat node body
   */
  body: string;

  /**
   * The chat node owners
   */
  users: User[]
}

export interface ChatNode extends BaseNode {
  /**
   * The chat node body
   * Missing if the chat node was an image post
   */
  body?: string;

  /**
   * The image URL
   * Missing if the chat node was a text post
   */
  image?: string;

  /**
   * Node type is always 'chat'
   */
  nodeType: 'chat';

  /**
   * IDs of nodes this chat node is a "reply" to
   * In stories this includes the story node ID, and potentially a chat node ID if it was a direct reply
   */
  replyIds: string[];

  /**
   * Data about the chat node being replied to
   */
  replyMeta?: ReplyMeta;

  /**
   * Time reply was created
   */
  timestampReply: Date;
}

export interface ChapterMeta {
  /**
   * Unique ID of the chapter node
   */
  id: string;

  /**
   * Time of chapter node creation
   */
  timeCreated: Date;

  /**
   * The title given to the chapter
   */
  title: string;
}

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

export interface PartialStoryNode extends Pick<StoryNode, 'description' | 'coverImages' | 'likeCount' | 'tagsAll' | 'commentCount' | 'isLive' | 'title' | 'users' | 'wordCount' | 'contentRating' | 'timeUpdated' | 'id'> {
  /**
   * TODO
   */
  // hype?: number;
}
