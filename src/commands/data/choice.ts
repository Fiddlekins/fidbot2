import {SlashCommandBuilder} from "discord.js";
import {config} from "../../config";

export const choiceData = new SlashCommandBuilder()
  .setName('choice')
  .setDescription(`Make ${config.botName} tell you how to live your life`)
  .addStringOption(option => option
    .setName('choices')
    .setDescription('Enumerate the outcomes, separated by `;`')
    .setRequired(true)
  );
