import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  EmbedAuthorOptions,
  EmbedBuilder,
  escapeMarkdown,
  inlineCode,
  spoiler
} from "discord.js";
import {clipArray, clipText, discordLimits} from "../../../discordLimits";
import {getGuildSettings} from "../../../settings";
import {getStoryNode} from "./api/getStoryNode";
import {StoryNode} from "./api/types";
import {storyNameToIdCache} from "./config";
import {getCleanBody} from "./utils/getCleanBody";
import {getReadTime} from "./utils/getReadTime";
import {getStoryUrl} from "./utils/getStoryUrl";
import {getUserProfileUrl} from "./utils/getUserProfileUrl";
import {isId} from "./utils/isId";

function simplifyStoryTitle(title: string): string {
  return title.replaceAll(/[^A-z0-9]/g, '').toLowerCase();
}

function formatTags(tagsAll: string[], tagsSpoiler: string[], maxCharacterCount?: number): string {
  const formattedNonSpoilerTags: string[] = [];
  const formattedSpoilerTags: string[] = [];
  let nonSpoilerTagCharCount = 0;
  let spoilerTagCharCount = 0;
  for (const tag of tagsAll) {
    let wrappedTag: string = inlineCode(escapeMarkdown(tag));
    if (tagsSpoiler.includes(tag)) {
      wrappedTag = spoiler(wrappedTag);
      formattedSpoilerTags.push(wrappedTag);
      spoilerTagCharCount += wrappedTag.length + 1;
    } else {
      formattedNonSpoilerTags.push(wrappedTag);
      nonSpoilerTagCharCount += wrappedTag.length + 1;
    }
  }
  // If there's no limit just join them all and return
  if (!maxCharacterCount) {
    return `${formattedNonSpoilerTags.join(' ')} ${formattedSpoilerTags.join(' ')}`;
  }
  // Otherwise we need to keep only whole tags that collectively fit within the total limits
  // Whilst also splitting using the ratio of spoiler to non-spoiler so that we get a healthy blend
  const clippedFormattedNonSpoilerTags: string[] = [];
  const clippedFormattedSpoilerTags: string[] = [];
  let remainingNonSpoilerTagCharCount = Math.floor(maxCharacterCount * (nonSpoilerTagCharCount / (nonSpoilerTagCharCount + spoilerTagCharCount)));
  let remainingSpoilerTagCharCount = Math.floor(maxCharacterCount * (spoilerTagCharCount / (nonSpoilerTagCharCount + spoilerTagCharCount)));
  for (const tag of formattedNonSpoilerTags) {
    // +1 to account for joining space
    remainingNonSpoilerTagCharCount -= tag.length + 1;
    if (remainingNonSpoilerTagCharCount >= 0) {
      clippedFormattedNonSpoilerTags.push(tag);
    } else {
      break;
    }
  }
  for (const tag of formattedSpoilerTags) {
    remainingSpoilerTagCharCount -= tag.length + 1;
    if (remainingSpoilerTagCharCount >= 0) {
      clippedFormattedSpoilerTags.push(tag);
    } else {
      break;
    }
  }
  return `${clippedFormattedNonSpoilerTags.join(' ')} ${clippedFormattedSpoilerTags.join(' ')}`;
}

function formatDescription(storyNode: StoryNode): string {
  let descriptionBody = escapeMarkdown(getCleanBody(storyNode.description));
  let descriptionTags = formatTags(storyNode.tagsAll, storyNode.tagsSpoiler);
  const spareCharacterCount = 10;
  // Recreate them but clipped to an amount based on their relative size
  descriptionBody = clipText(
    descriptionBody,
    Math.floor(
      (discordLimits.embed.descriptionLength - spareCharacterCount)
      * (descriptionBody.length / (descriptionBody.length + descriptionTags.length))
    )
  );
  descriptionTags = formatTags(
    storyNode.tagsAll, storyNode.tagsSpoiler,
    Math.floor(
      (discordLimits.embed.descriptionLength - spareCharacterCount)
      * (descriptionTags.length / (descriptionBody.length + descriptionTags.length))
    )
  );
  return [
    descriptionBody,
    '',
    descriptionTags,
  ].join('\n');
}

export async function executeQuery(interaction: ChatInputCommandInteraction) {
  const ephemeral = interaction.guildId ? !getGuildSettings(interaction.guildId).akun : false;
  const potentialIdOrTitle = interaction.options.getString('title');
  if (potentialIdOrTitle) {
    await interaction.deferReply({ephemeral});
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
        .setTitle(clipText(escapeMarkdown(storyNode.title), discordLimits.embed.titleLength))
        .setURL(getStoryUrl(storyNode.id, storyNode.title))
        .setDescription(clipText(formatDescription(storyNode), discordLimits.embed.descriptionLength))
        .addFields({name: 'Word count', value: storyNode.wordCount.toString(), inline: true})
        .addFields({name: 'Read time', value: getReadTime(storyNode.wordCount), inline: true})
        .addFields({name: 'Comments', value: storyNode.commentCount.toString(), inline: true})
      const [author] = storyNode.users;
      if (author) {
        const embedAuthorOptions: EmbedAuthorOptions = {
          name: clipText(author.username, discordLimits.embed.authorNameLength),
          url: getUserProfileUrl(author.username)
        };
        if (author.avatar) {
          embedAuthorOptions.iconURL = author.avatar;
        }
        embed = embed.setAuthor(embedAuthorOptions);
      }
      const [coverImage] = storyNode.coverImages;
      if (coverImage) {
        // embed = embed.setImage(coverImage)
        embed = embed.setThumbnail(coverImage)
      }
      if (storyNode.lastReply?.nodeType === 'chat' && storyNode.lastReply.body) {
        // Less tested and more optional, so wrap in try-catch
        try {
          const [author] = storyNode.lastReply.users;
          const [firstParagraph] = storyNode.lastReply.body.split('\n');
          // Footer limit is a lot larger than desired quote length, so clip some more
          const text = `${author?.username || 'Anon'}: "${clipText(firstParagraph, 240)}"`;
          embed = embed.setFooter({
            text: clipText(text, discordLimits.embed.footerLength),
            iconURL: author?.avatar
          });
        } catch (err) {
          console.error(err);
          console.error(JSON.stringify(storyNode));
        }
      }
      await interaction.editReply({embeds: [embed]});
    } else {
      await interaction.editReply('Failed to find the quest');
    }
  } else {
    await interaction.reply({
      content: `You've discovered a terrible secret...`,
      ephemeral
    });
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
  const filtered = choices
    // Test for position of input value
    .map(choice => {
      return {...choice, position: choice.simplifiedTitle.indexOf(partialTitle)};
    })
    // If input value isn't present the remove candidate
    .filter(choice => choice.position >= 0)
    // Sort those that have it so that priority is given to matches closer to the start of the title
    // The sub-sort lexicographically
    .sort((a, b) => {
      if (a.position === b.position) {
        return a.title > b.title ? 1 : -1;
      }
      return a.position - b.position;
    });
  const options = clipArray(filtered, discordLimits.autocomplete.choiceCount)
    .map(choice => {
      // If the title is lacking, give up
      if (choice.title.length < 1) {
        return null;
      }
      if (choice.title.length > discordLimits.autocomplete.choiceNameLength) {
        // Truncate the label, and use the ID for the value
        //   (not ideal because it's gibberish in the final command preview, but it works around the length limit)
        return {
          name: clipText(choice.title, discordLimits.autocomplete.choiceNameLength),
          value: storyNameToIdCache.get(choice.title)
        }
      }
      // Desired behaviour, use the full title as label and value
      return {
        name: clipText(choice.title, discordLimits.autocomplete.choiceNameLength),
        value: clipText(choice.title, discordLimits.autocomplete.choiceNameLength),
      };
    })
    .filter((choice): choice is { name: string, value: string } => choice !== null);
  await interaction.respond(options);
}
