import {SlashCommandBuilder} from "discord.js";

export const magic8ballData = new SlashCommandBuilder()
  .setName('8ball')
  .setDescription('Seek great wisdom')
  .addStringOption(option => option
    .setName('question')
    .setDescription('The query you have for Fidbot')
    .setRequired(true)
  );
