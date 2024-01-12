import {ButtonBuilder, ButtonStyle, ChatInputCommandInteraction} from "discord.js";
import {clipText, discordLimits} from "../../../discordLimits";
import {executePaginatedButtons, PaginatedButtonsState} from "../../../paginatedButtons";
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
    await executePaginatedButtons<PartialStoryNode>(
      interaction,
      async () => {
        return stories;
      },
      async (state: PaginatedButtonsState, error?: unknown) => {
        switch (state) {
          case "active":
            return null;
          case "finished":
            return null;
          case "timedout":
            return null;
          case "error":
            return 'Something went wrong...';
          default:
            return 'Something went wrong...';
        }
      },
      partialStoryNodeButtonBuilder,
      {
        wasDeferred: true,
        ephemeral,
        initialPage: initialPage ? initialPage - 1 : 0,
      },
    );
  } else {
    await interaction.editReply(`It's as silent as the grave...`);
  }
}
