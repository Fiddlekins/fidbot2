import {DiceRoll} from "@dice-roller/rpg-dice-roller";
import {ChatInputCommandInteraction, escapeMarkdown, hideLinkEmbed} from "discord.js";
import {discordLimits} from "../../discordLimits";
import {getGuildSettings} from "../../settings";
import {CommandHandlers} from "../../types";

async function execute(interaction: ChatInputCommandInteraction) {
  let ephemeral = interaction.guildId ? !getGuildSettings(interaction.guildId).roll : false;
  const input = interaction.options.getString('input');
  let reply = 'Something is amiss...';
  if (input) {
    if (input.trim() === 'help') {
      ephemeral = true;
      reply = `Please refer to ${hideLinkEmbed('https://dice-roller.github.io/documentation/guide/notation/')} for instructions on usage syntax`;
    } else {
      try {
        const roll = new DiceRoll(input);
        reply = escapeMarkdown(roll.output);
      } catch (err) {
        reply = escapeMarkdown(`${input}\n${err}`);
      }
    }
  }
  if (reply.length > discordLimits.contentLength) {
    reply = 'Output exceeded discord message size limit of 2000 characters';
    ephemeral = true;
  }
  await interaction.reply({content: reply, ephemeral});
}

export const rollHandlers: CommandHandlers = {
  execute
};
