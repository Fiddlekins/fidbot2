import {Client, Guild, GuildMember} from "discord.js";
import {setTimeout} from 'node:timers/promises'
import {lockedUserCache} from "../commands/handlers/nickname/config";
import {getGuildSettings} from "../settings";
import {Feature, GuildMemberUpdateHandler} from "../types";
import {getRandomIntInRange} from "../utils/random";

async function setNickname(guildMember: GuildMember, nickname: string) {
  try {
    await guildMember.setNickname(nickname, `Changed from ${guildMember.nickname} to ${nickname}. Why? Ask yourself that question`);
  } catch (err) {
    console.error(err);
    // Swallow error
  }
}

async function init(client: Client<true>) {
  for (const guildId of lockedUserCache.keys()) {
    const existingGuildTargets = lockedUserCache.get(guildId) || {};
    if (Object.keys(existingGuildTargets).length > 0) {
      let guild: Guild | null = null;
      try {
        guild = await client.guilds.fetch(guildId);
      } catch (err) {
        console.error(err);
      }
      if (guild) {
        for (const userId of Object.keys(existingGuildTargets)) {
          const lockedName = existingGuildTargets[userId];
          if (lockedName) {
            try {
              const guildMember = await guild.members.fetch(userId);
              if (guildMember.nickname !== lockedName) {
                await setNickname(guildMember, lockedName);
              }
            } catch (err) {
              console.error(err);
            }
          }
        }
      }
    }
  }
}

async function guildMemberUpdate(oldMember: Parameters<GuildMemberUpdateHandler>[0], newMember: Parameters<GuildMemberUpdateHandler>[1]) {
  const isFeatureEnabled = getGuildSettings(newMember.guild.id).nickname;
  if (isFeatureEnabled) {
    const existingGuildTargets = lockedUserCache.get(newMember.guild.id) || {};
    const lockedName = existingGuildTargets[newMember.id] as string | undefined;
    if (lockedName) {
      await setTimeout(getRandomIntInRange(3 * 1000, 5 * 60 * 1000));
      if (newMember.nickname !== lockedName) {
        await setNickname(newMember, lockedName);
      }
    }
  }
}

export const nickname: Feature = {
  data: {
    name: 'nickname',
  },
  init,
  guildMemberUpdate,
};
