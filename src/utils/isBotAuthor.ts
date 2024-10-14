import {Message, Partialize} from "discord.js/typings";

export function isBotAuthor(message: Message | Partialize<Message, "type" | "tts" | "pinned" | "system", "author" | "content" | "cleanContent">): boolean {
  if (message.author) {
    return message.author.id === message.client.user.id;
  }
  return false;
}
