import {ButtonBuilder, ButtonStyle, ChatInputCommandInteraction} from "discord.js";
import {clipText, discordLimits} from "../../../discordLimits";
import {executePaginatedButtonsWithButtonElements} from "../../../paginatedButtonsWithButtonElements";
import {getGuildSettings} from "../../../settings";
import {getLive} from "./api/getLive";
import {PartialStoryNode} from "./api/types/PartialStoryNode";
import {getCleanTitle} from "./utils/getCleanTitle";
import {getStoryUrl} from "./utils/getStoryUrl";

function partialStoryNodeButtonBuilder(partialStoryNode: PartialStoryNode) {
  return new ButtonBuilder()
    .setLabel(clipText(getCleanTitle(partialStoryNode.title), discordLimits.component.buttonLabelLength))
    .setStyle(ButtonStyle.Link)
    .setURL(getStoryUrl(partialStoryNode.id, partialStoryNode.title));
}

export async function executeLive(interaction: ChatInputCommandInteraction) {
  const ephemeral = interaction.guildId ? !getGuildSettings(interaction.guildId).akun : false;
  await interaction.deferReply({ephemeral});
  const stories = (await getLive())
    .sort((a, b) => {
      return a.title > b.title ? 1 : -1;
    });
  if (stories.length) {
    const initialPage = interaction.options.getInteger('page');
    await executePaginatedButtonsWithButtonElements<PartialStoryNode>(
      interaction,
      async () => {
        return stories;
      },
      partialStoryNodeButtonBuilder,
      {
        wasDeferred: true,
        ephemeral,
        initialPageIndex: initialPage ? initialPage - 1 : 0,
      },
    );
  } else {
    await interaction.editReply(`It's as silent as the grave...`);
  }
}
