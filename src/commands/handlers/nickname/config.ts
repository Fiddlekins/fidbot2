import {Cache} from "../../../Cache";

export interface GuildLockedNicknameTargets {
  [userId: string]: string;
}

export const lockedUserCache = new Cache<GuildLockedNicknameTargets>({
  id: 'lockedUserCache',
  maxSize: 0,
  persist: true,
  saveInterval: 2000,
});
