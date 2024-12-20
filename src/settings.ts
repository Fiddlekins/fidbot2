import {Cache} from "./Cache";

export interface GuildSettings {
  // slash commands
  akun: boolean;
  autoreply: boolean;
  call: boolean;
  choice: boolean;
  nickname: boolean;
  roll: boolean;
  wide: boolean;
  '8ball': boolean;

  // private commands

  // misc features
  awooPolicing: boolean;
  twitterEmbed: boolean;

  [key: string]: boolean;
}

export const defaultGuildSettings: GuildSettings = {
  akun: true,
  autoreply: false,
  call: true,
  choice: true,
  nickname: false,
  roll: true,
  wide: false,
  '8ball': true,
  awooPolicing: false,
  twitterEmbed: false,
};

export const settingsCache = new Cache<GuildSettings>({
  id: 'settingsCache',
  maxSize: 10000,
  persist: true,
  saveInterval: 1000,
});

export function getGuildSettings(guildId: string) {
  const loadedSettings = settingsCache.get(guildId);
  if (!loadedSettings) {
    return defaultGuildSettings;
  }
  const mergedSettings: GuildSettings = {...defaultGuildSettings};
  const validKeys = Object.keys(defaultGuildSettings);
  const loadedSettingsKeys = Object.keys(loadedSettings);
  for (const key of validKeys) {
    if (loadedSettingsKeys.includes(key)) {
      mergedSettings[key] = loadedSettings[key];
    }
  }
  return mergedSettings;
}

export function setGuildSettings(guildId: string, guildSettings: GuildSettings) {
  settingsCache.set(guildId, guildSettings);
}

export function toggleSetting(guildId: string, name: string) {
  const guildSettings = getGuildSettings(guildId);
  guildSettings[name] = !guildSettings[name];
  setGuildSettings(guildId, guildSettings);
}
