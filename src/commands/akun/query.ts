import {AutocompleteInteraction, ChatInputCommandInteraction, EmbedBuilder, inlineCode, spoiler} from "discord.js";
import {getStoryNode} from "./api/getStoryNode";
import {StoryNode} from "./api/types";
import {storyNameToIdCache} from "./config";
import {getCleanBody} from "./utils/getCleanBody";
import {getReadTime} from "./utils/getReadTime";
import {getStoryUrl} from "./utils/getStoryUrl";
import {getUserProfileUrl} from "./utils/getUserProfileUrl";
import {isId} from "./utils/isId";

function simplifyStoryTitle(title: string): string {
  return title.replaceAll(/[^A-z]/g, '').toLowerCase();
}

function formatTags(tagsAll: string[], tagsSpoiler: string[]): string {
  return tagsAll.map((tag) => {
    let wrappedTag: string = inlineCode(tag);
    if (tagsSpoiler.includes(tag)) {
      wrappedTag = spoiler(wrappedTag);
    }
    return wrappedTag;
  }).join(' ');
}

export async function executeQuery(interaction: ChatInputCommandInteraction) {
  const potentialIdOrTitle = interaction.options.getString('title');
  if (potentialIdOrTitle) {
    await interaction.deferReply();
    let storyNode: StoryNode | null = null;
    // If the input matches the ID pattern then try to retrieve a story with it
    // We check as raw ID first to avoid funny pranks where someone creates a story with the title set to another story's ID
    if (isId(potentialIdOrTitle)) {
      storyNode = await getStoryNode(potentialIdOrTitle);
    }
    // If the input used as a raw ID didn't retrieve anything, then see if the cache recognises it as a title
    const cachedId = storyNameToIdCache.get(potentialIdOrTitle);
    if (!storyNode && cachedId) {
      storyNode = await getStoryNode(cachedId);
    }
    // If we still couldn't find a storyNode then the input is either invalid or the cache is incomplete
    if (storyNode) {
      let embed = new EmbedBuilder()
        .setTitle(storyNode.title)
        .setURL(getStoryUrl(storyNode.id, storyNode.title))
        .setDescription(
          [
            getCleanBody(storyNode.description),
            '',
            formatTags(storyNode.tagsAll, storyNode.tagsSpoiler),
          ].join('\n')
        )
        .addFields({name: 'Word count', value: storyNode.wordCount.toString(), inline: true})
        .addFields({name: 'Read time', value: getReadTime(storyNode.wordCount), inline: true})
        .addFields({name: 'Comments', value: storyNode.commentCount.toString(), inline: true})
      const [author] = storyNode.users;
      if (author) {
        if (author.avatar) {
          embed = embed.setAuthor({
            name: author.username,
            iconURL: author.avatar,
            url: getUserProfileUrl(author.username)
          })
        } else {
          embed = embed.setAuthor({
            name: author.username,
            url: getUserProfileUrl(author.username)
          })
        }
      }
      const [coverImage] = storyNode.coverImages;
      if (coverImage) {
        // embed = embed.setImage(coverImage)
        embed = embed.setThumbnail(coverImage)
      }
      if (storyNode.lastReply?.nodeType === 'chat') {
        try {
          const [author] = storyNode.lastReply.users;
          const [firstParagraph] = storyNode.lastReply.body.split('\n');
          const quote = firstParagraph.length > 120 ? `${firstParagraph.slice(0, 117)}...` : firstParagraph;
          const text = `${author?.username || 'Anon'}: "${quote}"`;
          embed = embed.setFooter({text, iconURL: author?.avatar});
        } catch (err) {
          console.error(err);
          console.error(JSON.stringify(storyNode));
        }
      }

      interaction.channel?.send({embeds: [embed]});
      await interaction.editReply('Quest located!');
    } else {
      await interaction.editReply('Failed to find the quest');
    }
  } else {
    await interaction.reply(`You've discovered a terrible secret...`);
  }
}

export async function autocompleteQuery(interaction: AutocompleteInteraction) {
  const focusedValue = interaction.options.getFocused();
  const partialTitle = simplifyStoryTitle(focusedValue);
  const choices = [...storyNameToIdCache.keys()].sort().map((title) => {
    return {
      title,
      simplifiedTitle: simplifyStoryTitle(title)
    };
  });
  // Discord caps autocomplete to 25 entries
  const filtered = choices.filter(choice => choice.simplifiedTitle.startsWith(partialTitle)).slice(0, 25);
  const options = filtered.map(choice => ({
    name: choice.title,
    value: choice.title
  }));
  await interaction.respond(options);
}
