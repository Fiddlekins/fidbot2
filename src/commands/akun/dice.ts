import evaluate from 'akun-dice';
import {ChatInputCommandInteraction} from "discord.js";
import {getGuildSettings} from "../../settings";

function convertHtmlToMarkdown(input: string): string {
  return input
    .replaceAll(/<\/?i>/g, '*')
    .replaceAll(/<\/?b>/g, '**')
    .replaceAll(/<\/?br( \/)?>/g, '\n')
}

export async function executeDice(interaction: ChatInputCommandInteraction) {
  const ephemeral = interaction.guild ? !getGuildSettings(interaction.guild.id).akun : false;
  const input = interaction.options.getString('input');
  if (input) {
    await interaction.reply({
      content: convertHtmlToMarkdown(evaluate(input)),
      ephemeral
    });
  } else {
    await interaction.reply({
      content: `You've discovered a terrible secret...`,
      ephemeral
    });
  }
}
