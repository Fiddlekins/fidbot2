import {ChatInputCommandInteraction} from "discord.js";
import {CommandHandlers} from "../../../types";
import {executeCreate} from "./create";
import {executeList} from "./list";
import {executeRemove} from "./remove";

async function execute(interaction: ChatInputCommandInteraction) {
  switch (interaction.options.getSubcommand()) {
    case 'create':
      await executeCreate(interaction);
      break;
    case 'list':
      await executeList(interaction);
      break;
    case 'remove':
      await executeRemove(interaction);
      break;
    default:
      await interaction.reply(`You've discovered a terrible secret...`);
  }
}

export const autoreplyHandlers: CommandHandlers = {
  execute,
};
