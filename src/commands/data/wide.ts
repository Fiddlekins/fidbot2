import {SlashCommandBuilder} from "discord.js";
import {config} from "../../config";

export const wideData = new SlashCommandBuilder()
  .setName('wide')
  .setDescription(`Make ${config.botName} say <ｔｅｘｔ>`)
  .addStringOption(option =>
    option.setName('text')
      .setDescription('The input text')
      .setRequired(true)
  );
