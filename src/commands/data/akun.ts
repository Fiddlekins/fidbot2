import {SlashCommandBuilder} from "discord.js";

export const akunData = new SlashCommandBuilder()
  .setName('akun')
  .setDescription(`Handy tools for the quest connoisseur`)
  .addSubcommand(subcommand => subcommand
    .setName('live')
    .setDescription('View a list of currently live quests')
    .addIntegerOption(option => option
      .setName('page')
      .setDescription('Start on the given page')
    )
  )
  .addSubcommand(subcommand => subcommand
    .setName('query')
    .setDescription('Get an overview of a given quest')
    .addStringOption(option => option
      .setName('title')
      .setDescription('The title of the quest (or its ID)')
      .setAutocomplete(true)
      .setRequired(true)
    )
  )
  .addSubcommand(subcommand => subcommand
    .setName('dice')
    .setDescription('Roll dice like you were on Anonkun')
    .addStringOption(option => option
      .setName('input')
      .setDescription('The dice command')
      .setRequired(true)
    )
  );
