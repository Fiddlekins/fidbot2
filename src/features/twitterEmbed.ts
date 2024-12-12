import {EmbedAssetData, Message} from "discord.js";
import {setTimeout} from 'node:timers/promises'
import {Cache} from "../Cache";
import {twitterEmbedBlacklistCache, twitterEmbedWhitelistCache} from "../commands/handlers/twitterEmbed/config";
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
import {isBotAuthor} from "../utils/isBotAuthor";

function isUserHandled(guildId: string, userId: string) {
  const guildWhitelist = twitterEmbedWhitelistCache.get(guildId) || {};
  if (Object.keys(guildWhitelist).length && !guildWhitelist[userId]) {
    return false;
  }
  const guildBlacklist = twitterEmbedBlacklistCache.get(guildId) || {};
  return !guildBlacklist[userId];
}

function isValidEmbedImage(image: EmbedAssetData | null): boolean {
  if (!image) {
    return false;
  }
  // For some reason some twitter embeds now have iamges attached that are invalid URLs starting with:
  if (/https?:\/\/abs.twimg.com\/responsive-web/i.test(image.url)) {
    return false;
  }
  return true;
}

function getEmbedUrls(message: Parameters<MessageUpdateHandler>[1]): string[] {
  const embedUrls = message.embeds
    .map((embed) => {
      if (embed.title === 'X'
        && /^https?:\/\/(?:twitter|x)\.com/i.test(embed.url || '')
        && !embed.description
        && !isValidEmbedImage(embed.image)
      ) {
        // The Discord native embed is lacking all tweet content and thus considered to be failed
        return null;
      }
      // Bluesky can be embedded in a way that has thumbnail data but not image data, which Discord renders as text only embed
      if (/^https?:\/\/bsky\.app/i.test(embed.url || '')
        && embed.thumbnail
        && !embed.image
      ) {
        return null;
      }
      return embed.url;
    })
    .filter((url): url is string => url !== null);
  return embedUrls;
}

function extractTwitterUrls(content: string): string[] {
  return Array.from(content.matchAll(
      /(https?:\/\/(?:twitter\.com|x\.com|bsky\.app)[^\s]+?)(\s|$)/ig),
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
  return /https?:\/\/(?:twitter|x)\.com\/[^\/]+\/status\/\d+/.test(twitterUrl)
    // Bluesky profiles that get embedded are of the format `https://<domain>/profile/<username>`
    // Bluesky posts that get embedded are of the format `https://<domain>/profile/<username>/post/<postId>`
    || /https?:\/\/bsky\.app\/profile\/[^\/]+(?:\/?$|\/post\/[A-z0-9]+)/.test(twitterUrl);
}

function fixTwitterUrl(url: string): string {
  return url
    .replace(/^https?:\/\/(?:twitter|x)\.com/, 'https://fxtwitter.com')
    .replace(/^https?:\/\/bsky\.app/, 'https://bskyx.app');
}

function normaliseTwitterUrl(url: string): string {
  const [nonQueryString] = url.split('?');
  return fixTwitterUrl(nonQueryString);
}

function removeAlreadyEmbeddedUrls(twitterUrls: string[], embeddedUrls: string[]): string[] {
  return twitterUrls.filter((url) => {
    const normalisedUrl = normaliseTwitterUrl(url);
    return embeddedUrls.every((embeddedUrl) => {
      return normaliseTwitterUrl(embeddedUrl) !== normalisedUrl;
    });
  });
}

function getFixedTwitterUrls(content: string, embeddedUrls: string[]): string[] {
  const twitterUrls = extractSpoileredContent(content).displayed
    .map(removeUnembeddedUrls)
    .map(extractTwitterUrls)
    .reduce((acc, curr) => {
      return [...acc, ...curr];
    }, [])
    .filter(isTwitterUrlEmbeddable);
  return removeAlreadyEmbeddedUrls(dedupe(twitterUrls), embeddedUrls);
}

function getResponse(twitterUrls: string[]): string {
  return clipText(twitterUrls.map(fixTwitterUrl).join(' '), discordLimits.contentLength)
}

class TwitterEmbedMonitor {
  message: Parameters<MessageUpdateHandler>[1];
  previouslyEmbeddedUrls: string[] = [];
  lastResponseContent: string | null = null;
  response: Message | null = null;
  action: Promise<void>;
  isDeleted: boolean = false;

  constructor(message: Parameters<MessageUpdateHandler>[1]) {
    this.message = message;
    this.action = setTimeout(250);
    this.respond();
  }

  respond() {
    const handledMessage = this.message;
    this.action = this.action
      .then(async () => {
        if (!this.isDeleted) {
          // Is this respond instance still handling the latest message
          if (this.message === handledMessage) {
            // Message updates don't contain unchanged embeds or something
            this.previouslyEmbeddedUrls = this.previouslyEmbeddedUrls.concat(getEmbedUrls(handledMessage));
            const twitterUrls = handledMessage.content ? getFixedTwitterUrls(handledMessage.content, this.previouslyEmbeddedUrls) : [];
            const priorResponse = this.response;
            if (twitterUrls.length) {
              const newResponseContent = getResponse(twitterUrls);
              if (newResponseContent !== this.lastResponseContent) {
                this.lastResponseContent = newResponseContent;
                if (priorResponse) {
                  try {
                    this.response = await priorResponse.edit(newResponseContent);
                  } catch (err) {
                    // ignore error, it's possible that multiple async interactions cause a timing issue where the priorResponse should now be a new message
                  }
                } else {
                  try {
                    this.response = await handledMessage.channel.send(newResponseContent);
                  } catch (err) {
                    // log error if it happens, though I've not observed it before
                    console.error(err);
                  }
                }
              }
            } else {
              if (priorResponse) {
                try {
                  this.response = null;
                  await priorResponse.delete();
                } catch (err) {
                  // ignore error, typically means post has already been deleted by something
                }
              }
            }
          }
        }
      });
  }

  delete() {
    if (!this.isDeleted) {
      this.isDeleted = true;
      this.action = this.action
        .then(async () => {
          await this.response?.delete();
        })
        .catch(() => {
          // ignore error, typically means post has already been deleted by something
        });
    }
  }

  setLatestMessage(message: Parameters<MessageUpdateHandler>[1]) {
    if (!this.isDeleted) {
      this.message = message;
      this.respond();
    }
  }
}

const cache = new Cache<TwitterEmbedMonitor>({id: 'twitterEmbedCache', maxSize: 1000});

async function messageCreate(message: Parameters<MessageCreateHandler>[0]) {
  if (isBotAuthor(message)) {
    return;
  }
  const isFeatureEnabled = message.guildId ? getGuildSettings(message.guildId).twitterEmbed : false;
  if (!isFeatureEnabled) {
    return;
  }
  if (!isUserHandled(message.guildId || '', message.member?.user.id || '')) {
    return;
  }
  if (message.content.length) {
    const twitterUrls = getFixedTwitterUrls(message.content, getEmbedUrls(message));
    if (twitterUrls.length) {
      cache.set(message.id, new TwitterEmbedMonitor(message));
    }
  }
}

async function messageUpdate(oldMessage: Parameters<MessageUpdateHandler>[0], newMessage: Parameters<MessageUpdateHandler>[1]) {
  if (isBotAuthor(newMessage)) {
    return;
  }
  const isFeatureEnabled = newMessage.guildId ? getGuildSettings(newMessage.guildId).twitterEmbed : false;
  if (!isFeatureEnabled) {
    return;
  }
  if (!isUserHandled(newMessage.guildId || '', newMessage.member?.user.id || '')) {
    return;
  }
  if (newMessage.content?.length) {
    const twitterEmbedMonitor = cache.get(newMessage.id);
    if (twitterEmbedMonitor) {
      twitterEmbedMonitor.setLatestMessage(newMessage);
    }
  }
}

async function checkAndDelete(messageId: string) {
  const twitterEmbedMonitor = cache.get(messageId);
  if (twitterEmbedMonitor) {
    cache.delete(messageId);
    twitterEmbedMonitor.delete();
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
