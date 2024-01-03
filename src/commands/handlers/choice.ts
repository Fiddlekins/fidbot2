import {ChatInputCommandInteraction, inlineCode} from "discord.js";
import {getGuildSettings} from "../../settings";
import {CommandHandlers} from "../../types";
import {getRandomElement} from "../../utils/random";

async function execute(interaction: ChatInputCommandInteraction) {
  const ephemeral = interaction.guildId ? !getGuildSettings(interaction.guildId).choice : false;
  const choicesRaw = interaction.options.getString('choices');
  const choices = choicesRaw?.split(';').map(choice => choice.trim()).filter(choice => choice.length) || [];
  let reply = `C'mon, gimme something to work with here...`;
  if (choices.length >= 2) {
    const formattedChoices = choices.map(choice => inlineCode(choice));
    const finalChoice = formattedChoices.pop();
    reply = `You couldn't decide between ${formattedChoices.join(', ')} or ${finalChoice}. My answer:\n${getRandomElement(choices)}`;
  }
  await interaction.reply({content: reply, ephemeral});
}

export const choiceHandlers: CommandHandlers = {
  execute
};
