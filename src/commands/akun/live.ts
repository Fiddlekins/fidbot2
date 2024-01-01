import {ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction} from "discord.js";
import {getLive} from "./api/getLive";
import {getCleanTitle} from "./utils/getCleanTitle";
import {getStoryUrl} from "./utils/getStoryUrl";

function to2DArray<Type>(array: Type[], subArrayLength: number): Type[][] {
  const output: Type[][] = [];
  for (let i = 0; i < array.length; i += subArrayLength) {
    output.push(array.slice(i, i + subArrayLength));
  }
  return output;
}

export async function executeLive(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const stories = await getLive();
  if (stories.length) {
    // Discord only accepts 5 rows of 5 elements
    const rows = to2DArray(stories, 5).slice(0, 5).map((rowStories) => {
      return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(...rowStories.map((liveStoryMeta) => {
          return new ButtonBuilder()
            .setLabel(getCleanTitle(liveStoryMeta.title))
            .setStyle(ButtonStyle.Link)
            .setURL(getStoryUrl(liveStoryMeta.id, liveStoryMeta.title));
        }));
    });
    await interaction.editReply({
      components: rows
    });
  } else {
    await interaction.editReply(`It's as silent as the grave...`);
  }
}
