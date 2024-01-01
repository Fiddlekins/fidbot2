import {AutocompleteInteraction, ChatInputCommandInteraction, EmbedBuilder, inlineCode, spoiler} from "discord.js";
import {getStoryNode} from "./api/getStoryNode";
import {StoryNode} from "./api/types";
import {storyNameToIdCache} from "./config";
import {getCleanBody} from "./utils/getCleanBody";
import {getReadTime} from "./utils/getReadTime";
import {getStoryUrl} from "./utils/getStoryUrl";
import {getUserProfileUrl} from "./utils/getUserProfileUrl";

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
  const title = interaction.options.getString('title');
  if (title) {
    await interaction.deferReply();
    const id = storyNameToIdCache.get(title);
    let responseTitle: StoryNode | null = null;
    let responseId: StoryNode | null = null;
    if (id) {
      // If we have both a title and a story ID that matches it, check as if both were the story ID
      // This is because someone could try to prank the bot by giving one story the ID of another
      // If this happens, the response for the title used as an ID is given priority
      [
        responseTitle,
        responseId,
      ] = await Promise.all([
        getStoryNode(title),
        getStoryNode(id),
      ]);
    } else {
      // If no cache hits for the title then assume title is ID
      responseTitle = await getStoryNode(title);
    }
    const storyNode = responseTitle || responseId;
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
      // .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
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

      interaction.channel?.send({embeds: [embed]});
      await interaction.deleteReply();
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
    value: storyNameToIdCache.get(choice.title) || choice.title
  }));
  await interaction.respond(options);
}
