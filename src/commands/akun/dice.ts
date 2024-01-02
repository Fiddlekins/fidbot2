import evaluate from 'akun-dice';
import {ChatInputCommandInteraction} from "discord.js";

function convertHtmlToMarkdown(input: string): string {
  return input
    .replaceAll(/<\/?i>/g, '*')
    .replaceAll(/<\/?b>/g, '**')
    .replaceAll(/<\/?br( \/)?>/g, '\n')
}

export async function executeDice(interaction: ChatInputCommandInteraction) {
  const input = interaction.options.getString('input');
  if (input) {
    await interaction.reply(convertHtmlToMarkdown(evaluate(input)));
  } else {
    await interaction.reply(`You've discovered a terrible secret...`);
  }
}
