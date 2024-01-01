import {ChatInputCommandInteraction} from "discord.js";

export async function executeDice(interaction: ChatInputCommandInteraction) {
  await interaction.reply(`You've discovered a terrible secret...`);
}
