import {Client, Guild, GuildMember} from "discord.js";
import {setTimeout} from 'node:timers/promises'
import {Cache} from "../Cache";
import {GuildLockedNicknameTargets, lockedUserCache} from "../commands/handlers/nickname/config";
import {getGuildSettings} from "../settings";
import {Feature, GuildMemberUpdateHandler} from "../types";
import {getRandomIntInRange} from "../utils/random";

const inflightSetNicknamesCache = new Cache({
  id: 'inflightSetNicknamesCache'
})

async function setNickname(guildMember: GuildMember, nickname: string) {
  try {
    await guildMember.setNickname(nickname, `Changed from ${guildMember.nickname || guildMember.displayName} to ${nickname}. Why? Ask yourself that question`);
  } catch (err) {
    console.error(err);
    // Swallow error
  }
}

function getLockedName(guildTargets: GuildLockedNicknameTargets, userId: string): string | null {
  const lock = guildTargets[userId] as GuildLockedNicknameTargets[string] | undefined;
  if (lock) {
    if (typeof lock === 'string') {
      return lock;
    } else {
      return lock.lockedName;
    }
  }
  return null;
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
          const lockedName = getLockedName(existingGuildTargets, userId);
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
    const inflightCacheKey = `${newMember.guild.id}-${newMember.id}`;
    if (inflightSetNicknamesCache.get(inflightCacheKey)) {
      // Avoid multiple concurrent delayed nickname updates by returning early if one is already inflight
      return;
    }
    let existingGuildTargets = lockedUserCache.get(newMember.guild.id) || {};
    let lockedName = getLockedName(existingGuildTargets, newMember.id);
    if (lockedName) {
      inflightSetNicknamesCache.set(inflightCacheKey, true);
      await setTimeout(getRandomIntInRange(3 * 1000, 5 * 60 * 1000));
      // Refresh the target name
      existingGuildTargets = lockedUserCache.get(newMember.guild.id) || {};
      lockedName = getLockedName(existingGuildTargets, newMember.id);
      if (lockedName && newMember.nickname !== lockedName) {
        await setNickname(newMember, lockedName);
      }
      inflightSetNicknamesCache.set(inflightCacheKey, false);
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
