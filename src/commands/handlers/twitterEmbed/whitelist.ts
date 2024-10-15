import {ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, userMention} from "discord.js";
import {PaginatedButtonsState} from "../../../paginatedButtons";
import {executePaginatedButtonsWithButtonElements} from "../../../paginatedButtonsWithButtonElements";
import {getGuildSettings} from "../../../settings";
import {twitterEmbedWhitelistCache, TwitterEmbedListMember} from "./config";

function targetButtonBuilder({userId, username}: TwitterEmbedListMember, isActive: boolean) {
  return new ButtonBuilder()
    .setCustomId(userId)
    .setLabel(username)
    .setDisabled(!isActive)
    .setStyle(ButtonStyle.Secondary);
}

export async function executeWhitelist(interaction: ChatInputCommandInteraction) {
  if (interaction.guildId) {
    const enabled = getGuildSettings(interaction.guildId).twitterEmbed;
    if (enabled) {
      let guildWhitelist = twitterEmbedWhitelistCache.get(interaction.guildId) || {};
      const user = interaction.options.getUser('user');
      if (user) {
        if (guildWhitelist[user.id]) {
          delete guildWhitelist[user.id];
          twitterEmbedWhitelistCache.set(interaction.guildId, guildWhitelist);
          await interaction.reply({
            content: `${userMention(user.id)} removed from twitter embed whitelist`,
            ephemeral: true
          });
        } else {
          guildWhitelist[user.id] = user.username;
          twitterEmbedWhitelistCache.set(interaction.guildId, guildWhitelist);
          await interaction.reply({
            content: `${userMention(user.id)} added to twitter embed whitelist`,
            ephemeral: true
          });
        }
      } else {
        await executePaginatedButtonsWithButtonElements<TwitterEmbedListMember>(
          interaction,
          async () => {
            if (interaction.guildId) {
              const guildWhitelist = twitterEmbedWhitelistCache.get(interaction.guildId) || {};
              return Object.keys(guildWhitelist).map((userId) => {
                const username = guildWhitelist[userId];
                return {
                  userId,
                  username,
                }
              });
            }
            return [];
          },
          targetButtonBuilder,
          {
            handleButton: async (customId: string, setStatus) => {
              if (interaction.guildId) {
                const guildWhitelist = twitterEmbedWhitelistCache.get(interaction.guildId) || {};
                delete guildWhitelist[customId];
                twitterEmbedWhitelistCache.set(interaction.guildId, guildWhitelist);
                if (Object.keys(guildWhitelist).length <= 0) {
                  setStatus('finished');
                }
              }
            },
            getContent: async (state: PaginatedButtonsState) => {
              switch (state.status) {
                case "active":
                  return 'Click the buttons to remove the user from the twitter embed whitelist';
                case "finished":
                  return 'Finished removing users'
                case "timedout":
                  return 'Finished removing users'
                case "error":
                  return 'Something went wrong...';
                default:
                  return 'Something went wrong...';
              }
            },
          }
        );
      }
    } else {
      await interaction.reply({content: 'This feature is disabled', ephemeral: true});
    }
  } else {
    await interaction.reply({content: 'This feature is not available here', ephemeral: true});
  }
}
