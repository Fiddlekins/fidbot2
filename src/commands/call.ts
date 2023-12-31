import {ChatInputCommandInteraction, Collection, GuildMember, SlashCommandBuilder, userMention} from "discord.js";
import {config} from "../config";
import {extractUserNamesOrTagsFromText} from "../utils/extractUserNamesOrTagsFromText";
import {getRandomInt, getRandomIntInRange} from "../utils/random";
import {Command} from "./types";

const data = new SlashCommandBuilder()
  .setName('call')
  .setDescription(`Make ${config.botName} accuse <subject> of being a <descriptor>.`)
  .addStringOption(option =>
    option.setName('subject')
      .setDescription('The target of your affection')
      .setRequired(true)
  )
  .addStringOption(option =>
    option.setName('descriptor')
      .setDescription('The sweet nothings you wish to convey')
      .setRequired(true)
  );

function isSubjectSelf(subject: string, interaction: ChatInputCommandInteraction): boolean {
  const subjectTransformed = subject.toLowerCase();
  const guildMember = interaction.guild?.members.me;
  if (guildMember) {
    if (subjectTransformed.includes(guildMember.id)
      || subjectTransformed.includes(guildMember.displayName.toLowerCase())) {
      return true;
    }
  }
  const clientUser = interaction.client.user;
  if (clientUser) {
    if (subjectTransformed.includes(clientUser.id)
      || subjectTransformed.includes(clientUser.username.toLowerCase())
      || (clientUser.globalName && subjectTransformed.includes(clientUser.globalName.toLowerCase()))
      || subjectTransformed.includes(clientUser.displayName.toLowerCase())) {
      return true;
    }
  }
  return false;
}

function makeYelled(slur: string): string {
  let slurYelled = slur.toUpperCase();
  slurYelled = slurYelled.replace(/[AEIOUＡＥＩＯＵ⛎]/g, function (char: string) {
    return ''.padEnd(getRandomIntInRange(2, 5), char);
  });
  const trailingExclamationMarks = ''.padEnd(getRandomIntInRange(1, 3), '!');
  return `${slurYelled}${trailingExclamationMarks}`;
}

function getDeterminer(descriptor: string): string {
  if (/[aeiou]/i.test(descriptor.charAt(0))) {
    return 'an';
  }
  return 'a';
}



async function execute(interaction: ChatInputCommandInteraction) {
  console.log(interaction.toString());
  const subject = interaction.options.getString('subject');
  let descriptor = interaction.options.getString('descriptor');
  if (!subject || !descriptor) {
    await interaction.reply('That was a malformed accusation!');
  } else {
    if (isSubjectSelf(subject, interaction)) {
      descriptor = 'wonderful creation';
    }
    const determiner = getDeterminer(descriptor);
    const slurYelled = makeYelled(descriptor);

    let processedSubject = subject;
    if (interaction.guild) {
      const {text, possibleUserNamesOrTags} = extractUserNamesOrTagsFromText(subject);
      // Use a map to dedupe queries
      const queryMap = new Map<string, Promise<Collection<string, GuildMember> | null>>();
      const possibleUsers = await Promise.all(possibleUserNamesOrTags.map(({username}) => {
        if (queryMap.has(username)) {
          return queryMap.get(username);
        }
        // Limit the number of times it'll query a potential username
        if (queryMap.size >= 5) {
          return Promise.resolve(null);
        }
        const query = interaction?.guild?.members.search({
          query: username,
          cache: true,
          limit: 10
        }) || Promise.resolve(null);
        queryMap.set(username, query);
        return query;
      }));
      const [firstChunk, ...chunks] = text;
      processedSubject = firstChunk;
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const possibleUserNamesOrTag = possibleUserNamesOrTags[i];
        const possibleUser = possibleUsers[i];
        const user = possibleUser?.at(getRandomInt(possibleUser?.size));
        if (user) {
          processedSubject += userMention(user.id);
        } else {
          processedSubject += possibleUserNamesOrTag.removedText;
        }
        processedSubject += chunk;
      }
    }
    await interaction.reply(`${processedSubject} is ${determiner} ${descriptor}! ${determiner.toUpperCase()} ${slurYelled}`);
  }
}

export const call: Command = {
  data,
  execute
};
