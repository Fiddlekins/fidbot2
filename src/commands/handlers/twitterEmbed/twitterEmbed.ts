import {ChatInputCommandInteraction} from "discord.js";
import {CommandHandlers} from "../../../types";
import {executeBlacklist} from "./blacklist";
import {executeWhitelist} from "./whitelist";

async function execute(interaction: ChatInputCommandInteraction) {
  switch (interaction.options.getSubcommand()) {
    case 'blacklist':
      await executeBlacklist(interaction);
      break;
    case 'whitelist':
      await executeWhitelist(interaction);
      break;
    default:
      await interaction.reply(`You've discovered a terrible secret...`);
  }
}

export const twitterEmbedHandlers: CommandHandlers = {
  execute,
};
