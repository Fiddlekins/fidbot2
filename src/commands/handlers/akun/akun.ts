import {AutocompleteInteraction, ChatInputCommandInteraction} from "discord.js";
import {CommandHandlers} from "./../../types";
import {executeDice} from "./dice";
import {executeLive} from "./live";
import {autocompleteQuery, executeQuery} from "./query";

async function execute(interaction: ChatInputCommandInteraction) {
  switch (interaction.options.getSubcommand()) {
    case 'live':
      await executeLive(interaction);
      break;
    case 'query':
      await executeQuery(interaction);
      break;
    case 'dice':
      await executeDice(interaction);
      break;
    default:
      await interaction.reply(`You've discovered a terrible secret...`);
  }
}

async function autocomplete(interaction: AutocompleteInteraction) {
  switch (interaction.options.getSubcommand()) {
    case 'query':
      await autocompleteQuery(interaction);
      break;
    default:
      await interaction.respond([]);
  }
}

export const akunHandlers: CommandHandlers = {
  execute,
  autocomplete
};
