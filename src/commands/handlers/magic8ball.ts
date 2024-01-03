import {ChatInputCommandInteraction} from "discord.js";
import {Cache} from "../../Cache";
import {getGuildSettings} from "../../settings";
import {getRandomElement} from "../../utils/random";
import {CommandHandlers} from "../../types";

function isValidQuestion(question: string): boolean {
  // Must end with a question mark in some capacity
  if (!/\?!*$/.test(question)) {
    return false;
  }
  // Must comprise two words
  if (!/[^\s]\s+[^\s]/.test(question)) {
    return false;
  }
  return true;
}

enum OutcomeType {
  Positive,
  Neutral,
  Negative
}

const OUTCOME_TYPES = [OutcomeType.Positive, OutcomeType.Neutral, OutcomeType.Negative];

const OUTCOMES: Record<OutcomeType, string[]> = {
  [OutcomeType.Negative]: [
    `Don't count on it`,
    `My reply is no`,
    `My sources say no`,
    `Outlook not so good`,
    `Very doubtful`
  ],
  [OutcomeType.Neutral]: [
    `Reply hazy try again`,
    `Ask again later`,
    `Better not tell you now`,
    `Cannot predict now`,
    `Concentrate and ask again`
  ],
  [OutcomeType.Positive]: [
    `It is certain`,
    `It is decidedly so`,
    `Without a doubt`,
    `Yes, definitely`,
    `You may rely on it`,
    `As I see it, yes`,
    `Most likely`,
    `Outlook good`,
    `Yes`,
    `Signs point to yes`
  ]
};

const cache = new Cache<OutcomeType>({
  id: 'magic8ballCache',
  maxSize: 10000,
  persist: true,
  saveInterval: 10000,
});

function getOutcome(question: string): string {
  const outcomeType = cache.get(question) ?? getRandomElement(OUTCOME_TYPES);
  cache.set(question, outcomeType);
  return getRandomElement(OUTCOMES[outcomeType]);
}

async function execute(interaction: ChatInputCommandInteraction) {
  const ephemeral = interaction.guildId ? !getGuildSettings(interaction.guildId)["8ball"] : false;
  const question = interaction.options.getString('question');
  let reply = question ? `You asked "${question}"` : `You asked... NOTHING!`;
  if (question) {
    if (isValidQuestion(question)) {
      reply += `\n${getOutcome(question)}`;
    } else {
      reply += `\nPlease ask a valid question!`;
    }
  }
  await interaction.reply({content: reply, ephemeral});
}

export const magic8ballHandlers: CommandHandlers = {
  execute
};
