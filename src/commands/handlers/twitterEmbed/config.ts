import {Cache} from "../../../Cache";

export interface TwitterEmbedListMember {
  userId: string;
  username: string;
}

export interface TwitterEmbedList {
  // Record the user's ID and username to save having to dynamically fetch the username later
  [userId: string]: string;
}

export const twitterEmbedBlacklistCache = new Cache<TwitterEmbedList>({
  id: 'twitterEmbedBlacklistCache',
  maxSize: 0,
  persist: true,
  saveInterval: 2000,
});

export const twitterEmbedWhitelistCache = new Cache<TwitterEmbedList>({
  id: 'twitterEmbedWhitelistCache',
  maxSize: 0,
  persist: true,
  saveInterval: 2000,
});
