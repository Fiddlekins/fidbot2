import {ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction} from "discord.js";
import {clipArray, discordLimits} from "../../../discordLimits";
import {getGuildSettings} from "../../../settings";
import {to2DArray} from "../../../utils/to2DArray";
import {getLive} from "./api/getLive";
import {getCleanTitle} from "./utils/getCleanTitle";
import {getStoryUrl} from "./utils/getStoryUrl";

export async function executeLive(interaction: ChatInputCommandInteraction) {
  const ephemeral = interaction.guildId ? !getGuildSettings(interaction.guildId).akun : false;
  await interaction.deferReply({ephemeral});
  const stories = await getLive();
  if (stories.length) {
    const rows = clipArray(to2DArray(stories, discordLimits.component.elementCount), discordLimits.component.rowCount)
      .map((rowStories) => {
        return new ActionRowBuilder<ButtonBuilder>()
          .addComponents(...rowStories.map((liveStoryMeta) => {
            return new ButtonBuilder()
              .setLabel(getCleanTitle(liveStoryMeta.title))
              .setStyle(ButtonStyle.Link)
              .setURL(getStoryUrl(liveStoryMeta.id, liveStoryMeta.title));
          }));
      });
    await interaction.editReply({
      components: rows,
    });
  } else {
    await interaction.editReply(`It's as silent as the grave...`);
  }
}
