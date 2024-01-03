import {ChatInputCommandInteraction} from "discord.js";
import {CommandHandlers} from "../../../types";
import {executeFree} from "./free";
import {executeLock} from "./lock";

async function execute(interaction: ChatInputCommandInteraction) {
  switch (interaction.options.getSubcommand()) {
    case 'lock':
      await executeLock(interaction);
      break;
    case 'free':
      await executeFree(interaction);
      break;
    default:
      await interaction.reply(`You've discovered a terrible secret...`);
  }
}

export const nicknameHandlers: CommandHandlers = {
  execute,
};
