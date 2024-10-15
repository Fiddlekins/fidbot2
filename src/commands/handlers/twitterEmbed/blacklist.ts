import {ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, userMention} from "discord.js";
import {PaginatedButtonsState} from "../../../paginatedButtons";
import {executePaginatedButtonsWithButtonElements} from "../../../paginatedButtonsWithButtonElements";
import {getGuildSettings} from "../../../settings";
import {twitterEmbedBlacklistCache, TwitterEmbedListMember} from "./config";

function targetButtonBuilder({userId, username}: TwitterEmbedListMember, isActive: boolean) {
  return new ButtonBuilder()
    .setCustomId(userId)
    .setLabel(username)
    .setDisabled(!isActive)
    .setStyle(ButtonStyle.Secondary);
}

export async function executeBlacklist(interaction: ChatInputCommandInteraction) {
  if (interaction.guildId) {
    const enabled = getGuildSettings(interaction.guildId).twitterEmbed;
    if (enabled) {
      let guildBlacklist = twitterEmbedBlacklistCache.get(interaction.guildId) || {};
      const user = interaction.options.getUser('user');
      if (user) {
        if (guildBlacklist[user.id]) {
          delete guildBlacklist[user.id];
          twitterEmbedBlacklistCache.set(interaction.guildId, guildBlacklist);
          await interaction.reply({
            content: `${userMention(user.id)} removed from twitter embed blacklist`,
            ephemeral: true
          });
        } else {
          guildBlacklist[user.id] = user.username;
          twitterEmbedBlacklistCache.set(interaction.guildId, guildBlacklist);
          await interaction.reply({
            content: `${userMention(user.id)} added to twitter embed blacklist`,
            ephemeral: true
          });
        }
      } else {
        await executePaginatedButtonsWithButtonElements<TwitterEmbedListMember>(
          interaction,
          async () => {
            if (interaction.guildId) {
              const guildBlacklist = twitterEmbedBlacklistCache.get(interaction.guildId) || {};
              return Object.keys(guildBlacklist).map((userId) => {
                const username = guildBlacklist[userId];
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
                const guildBlacklist = twitterEmbedBlacklistCache.get(interaction.guildId) || {};
                delete guildBlacklist[customId];
                twitterEmbedBlacklistCache.set(interaction.guildId, guildBlacklist);
                if (Object.keys(guildBlacklist).length <= 0) {
                  setStatus('finished');
                }
              }
            },
            getContent: async (state: PaginatedButtonsState) => {
              switch (state.status) {
                case "active":
                  return 'Click the buttons to remove the user from the twitter embed blacklist';
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
