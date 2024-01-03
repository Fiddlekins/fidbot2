import {ButtonBuilder, ButtonStyle, ChatInputCommandInteraction} from "discord.js";
import {executePaginatedButtons, PaginatedButtonsState} from "../../../paginatedButtons";
import {getGuildSettings} from "../../../settings";
import {GuildLockedNicknameTargets, lockedUserCache} from "./config";

interface Target {
  userId: string;
  lockedName: string;
}

function getTargets(guildTargets: GuildLockedNicknameTargets): Target[] {
  return Object.keys(guildTargets)
    .map((userId) => {
      const lockedName = guildTargets[userId];
      return {
        userId,
        lockedName,
      }
    })
    .sort((a, b) => {
      return a.lockedName > b.lockedName ? 1 : -1;
    });
}

function targetButtonBuilder(target: Target, isActive: boolean) {
  return new ButtonBuilder()
    .setCustomId(target.userId)
    .setLabel(target.lockedName)
    .setDisabled(!isActive)
    .setStyle(ButtonStyle.Secondary);
}

export async function executeFree(interaction: ChatInputCommandInteraction) {
  if (interaction.guildId) {
    const enabled = getGuildSettings(interaction.guildId).nickname;
    if (enabled) {
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
        async (customId: string) => {
          if (interaction.guildId) {
            // Update value in case it has been changed by some other async process
            const existingGuildTargets = lockedUserCache.get(interaction.guildId) || {};
            const validKeys = Object.keys(existingGuildTargets);
            if (validKeys.includes(customId)) {
              const newGuildTargets = {...existingGuildTargets};
              delete newGuildTargets[customId];
              lockedUserCache.set(interaction.guildId, newGuildTargets);
            }
          }
        },
        true,
      );
    } else {
      await interaction.reply({content: 'This feature is disabled', ephemeral: true});
    }
  } else {
    await interaction.reply({content: 'This feature is not available here', ephemeral: true});
  }
}
