import {AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {Command} from "./../types";
import {executeDice} from "./dice";
import {executeLive} from "./live";
import {autocompleteQuery, executeQuery} from "./query";

const data = new SlashCommandBuilder()
  .setName('akun')
  .setDescription(`Handy tools for the quest connoisseur`)
  .addSubcommand(subcommand =>
    subcommand
      .setName('live')
      .setDescription('View a list of currently live quests')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('query')
      .setDescription('Get an overview a given quest')
      .addStringOption(option =>
        option.setName('title')
          .setDescription('The title of the quest (or its ID)')
          .setAutocomplete(true)
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('dice')
      .setDescription('Roll dice like you were on Anonkun')
      .addStringOption(option =>
        option.setName('input')
          .setDescription('The dice command')
          .setRequired(true)
      )
  );

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

export const akun: Command = {
  data,
  execute,
  autocomplete
};
