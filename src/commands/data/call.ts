import {SlashCommandBuilder} from "discord.js";
import {config} from "../../config";

export const callData = new SlashCommandBuilder()
  .setName('call')
  .setDescription(`Make ${config.botName} accuse <subject> of being a <descriptor>`)
  .addStringOption(option => option
    .setName('subject')
    .setDescription('The target of your affection')
    .setRequired(true)
  )
  .addStringOption(option => option
    .setName('descriptor')
    .setDescription('The sweet nothings you wish to convey')
    .setRequired(true)
  );
