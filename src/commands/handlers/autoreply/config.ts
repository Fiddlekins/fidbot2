import {Cache} from "../../../Cache";

export interface AutoreplyConfig {
  id: number;
  created: number;
  match?: string;
  response: string;
}

export interface GuildAutoreplyConfigs {
  nextId: number;
  anyUser: AutoreplyConfig[];
  specificUser: {
    [userId: string]: AutoreplyConfig[];
  };
}

export const autoreplyCache = new Cache<GuildAutoreplyConfigs>({
  id: 'autoreplyCache',
  maxSize: 0,
  persist: true,
  saveInterval: 2000,
});
