import {Message, Partialize} from "discord.js";
import {Cache} from "../Cache";
import {clipText, discordLimits} from "../discordLimits";
import {getGuildSettings} from "../settings";
import {
  Feature,
  MessageBulkDeleteHandler,
  MessageCreateHandler,
  MessageDeleteHandler,
  MessageUpdateHandler
} from "../types";
import {dedupe} from "../utils/dedupe";
import {extractSpoileredContent} from "../utils/extractSpoileredContent";

function isBotAuthor(message: Message | Partialize<Message, "type" | "tts" | "pinned" | "system", "author" | "content" | "cleanContent">): boolean {
  if (message.author) {
    return message.author.id === message.client.user.id;
  }
  return false;
}

function extractTwitterUrls(content: string): string[] {
  return Array.from(content.matchAll(
      /(https?:\/\/(?:twitter|x)\.com[^\s]+?)(\s|$)/ig),
    m => m[1]
  );
}

function removeUnembeddedUrls(content: string): string {
  // Not exactly sure what discord `<url>` detection logic is, but `<url url>` is not unembedded by discord and
  //   we don't care here about false positives because we only want the twitter URLs at the end
  return content.replaceAll(/<\S+>/g, '');
}

function isTwitterUrlEmbeddable(twitterUrl: string): boolean {
  // Twitter posts that get embedded are of the format `https://<domain>/<username>/status/<tweetId>`
  return /https?:\/\/[^\\]+\/[^\\]+\/status\/\d+/.test(twitterUrl);
}

function fixTwitterUrl(url: string): string {
  return url.replace(/^https?:\/\/(?:twitter|x)\.com/, 'https://fxtwitter.com');
}

function getFixedTwitterUrls(content: string): string[] {
  const twitterUrls = extractSpoileredContent(content).displayed
    .map(removeUnembeddedUrls)
    .map(extractTwitterUrls)
    .reduce((acc, curr) => {
      return [...acc, ...curr];
    }, [])
    .filter(isTwitterUrlEmbeddable);
  return dedupe(twitterUrls);
}

function getResponse(twitterUrls: string[]): string {
  return clipText(twitterUrls.map(fixTwitterUrl).join(' '), discordLimits.contentLength)
}

const cache = new Cache<Message>({id: 'twitterEmbedCache', maxSize: 400});

async function messageCreate(message: Parameters<MessageCreateHandler>[0]) {
  if (isBotAuthor(message)) {
    return;
  }
  const isFeatureEnabled = message.guildId ? getGuildSettings(message.guildId).twitterEmbed : false;
  if (isFeatureEnabled && message.content.length) {
    const twitterUrls = getFixedTwitterUrls(message.content);
    if (twitterUrls.length) {
      const response = await message.channel.send(getResponse(twitterUrls));
      cache.set(message.id, response);
    }
  }
}

async function messageUpdate(oldMessage: Parameters<MessageUpdateHandler>[0], newMessage: Parameters<MessageUpdateHandler>[1]) {
  if (isBotAuthor(newMessage)) {
    return;
  }
  const isFeatureEnabled = newMessage.guildId ? getGuildSettings(newMessage.guildId).twitterEmbed : false;
  if (isFeatureEnabled && newMessage.content?.length) {
    const twitterUrls = getFixedTwitterUrls(newMessage.content);
    const priorResponse = cache.get(newMessage.id);
    if (twitterUrls.length) {
      const newResponseContent = getResponse(twitterUrls);
      if (priorResponse) {
        await priorResponse.edit(newResponseContent);
      } else {
        const response = await newMessage.channel.send(newResponseContent);
        cache.set(newMessage.id, response);
      }
    } else {
      if (priorResponse) {
        cache.delete(newMessage.id);
        await priorResponse.delete();
      }
    }
  }
}

async function checkAndDelete(messageId: string) {
  const priorResponse = cache.get(messageId);
  if (priorResponse) {
    cache.delete(messageId);
    await priorResponse.delete();
  }
}

async function messageDelete(message: Parameters<MessageDeleteHandler>[0]) {
  if (isBotAuthor(message)) {
    return;
  }
  await checkAndDelete(message.id);
}

async function messageBulkDelete(messages: Parameters<MessageBulkDeleteHandler>[0]) {
  for (const message of messages.values()) {
    if (isBotAuthor(message)) {
      return;
    }
    await checkAndDelete(message.id);
  }
}

export const twitterEmbed: Feature = {
  data: {
    name: 'twitterEmbed',
  },
  messageCreate,
  messageUpdate,
  messageDelete,
  messageBulkDelete,
};
