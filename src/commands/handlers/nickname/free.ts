import {ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, userMention} from "discord.js";
import {executePaginatedButtons, PaginatedButtonsState} from "../../../paginatedButtons";
import {getGuildSettings} from "../../../settings";
import {GuildLockedNicknameTargets, lockedUserCache} from "./config";

interface Target {
  userId: string;
  lockedName: string;
  username?: string;
}

function getTargets(guildTargets: GuildLockedNicknameTargets): Target[] {
  return Object.keys(guildTargets)
    .map((userId) => {
      const lock = guildTargets[userId];
      let lockedName;
      let username;
      if (typeof lock === 'string') {
        lockedName = lock;
      } else {
        lockedName = lock.lockedName;
        username = lock.username;
      }
      return {
        userId,
        lockedName,
        username,
      }
    })
    .sort((a, b) => {
      return a.lockedName > b.lockedName ? 1 : -1;
    });
}

function targetButtonBuilder(target: Target, isActive: boolean) {
  const label = target.username ? `${target.username} | ${target.lockedName}` : target.lockedName;
  return new ButtonBuilder()
    .setCustomId(target.userId)
    .setLabel(label)
    .setDisabled(!isActive)
    .setStyle(ButtonStyle.Secondary);
}

function freeUser(guildId: string, userId: string): boolean {
  // Update value in case it has been changed by some other async process
  const existingGuildTargets = lockedUserCache.get(guildId) || {};
  const lockedUserIds = Object.keys(existingGuildTargets);
  if (lockedUserIds.includes(userId)) {
    const newGuildTargets = {...existingGuildTargets};
    delete newGuildTargets[userId];
    lockedUserCache.set(guildId, newGuildTargets);
    return true;
  }
  return false;
}

export async function executeFree(interaction: ChatInputCommandInteraction) {
  if (interaction.guildId) {
    const enabled = getGuildSettings(interaction.guildId).nickname;
    if (enabled) {
      if (Object.keys(lockedUserCache.get(interaction.guildId) || {}).length === 0) {
        await interaction.reply({content: 'There are no locked nicknames', ephemeral: true});
      } else {
        const user = interaction.options.getUser('user');
        if (user) {
          const freed = freeUser(interaction.guildId, user.id);
          if (freed) {
            await interaction.reply({
              content: `${userMention(user.id)} has been freed from nickname jail`,
              ephemeral: true
            });
          } else {
            await interaction.reply({
              content: `${userMention(user.id)} did not have a locked nickname`,
              ephemeral: true
            });
          }
        } else {
          await executePaginatedButtons<Target>(
            interaction,
            async () => {
              if (interaction.guildId) {
                const existingGuildTargets = lockedUserCache.get(interaction.guildId) || {};
                return getTargets(existingGuildTargets)
              }
              return [];
            },
            async (state: PaginatedButtonsState, error?: unknown) => {
              switch (state) {
                case "active":
                  return 'Click the buttons to remove the nickname lock from the given user. Removing the lock does not reset the nickname';
                case "finished":
                  return 'Finished freeing users'
                case "timedout":
                  return 'Finished freeing users'
                case "error":
                  return 'Something went wrong...';
                default:
                  return 'Something went wrong...';
              }
            },
            targetButtonBuilder,
            {
              handleButton: async (customId: string, setState) => {
                if (interaction.guildId) {
                  freeUser(interaction.guildId, customId);
                  const existingGuildTargets = lockedUserCache.get(interaction.guildId) || {};
                  if (Object.keys(existingGuildTargets).length <= 0) {
                    setState('finished');
                  }
                }
              },
            }
          );
        }
      }
    } else {
      await interaction.reply({content: 'This feature is disabled', ephemeral: true});
    }
  } else {
    await interaction.reply({content: 'This feature is not available here', ephemeral: true});
  }
}
