import {SlashCommandBuilder} from "discord.js";

export const rollData = new SlashCommandBuilder()
  .setName('roll')
  .setDescription(`Roll dice`)
  .addStringOption(option => option
    .setName('input')
    .setDescription('The dice command to execute, or `help` for usage instructions')
    .setRequired(true)
  );
