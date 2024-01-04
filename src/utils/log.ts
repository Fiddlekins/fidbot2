import {Message, PartialMessage} from "discord.js";

export function log(message: Message | PartialMessage, operation: 'create' | 'update' | 'delete') {
  let messageData: Object = {
    operation,
    createdTimestamp: message.createdTimestamp,
    editedTimestamp: message.editedTimestamp,
    id: message.id,
    content: message.content,
    cleanContent: message.cleanContent,
    attachments: message.attachments.map(attachment => attachment.toJSON()),
    embeds: message.embeds.map(embed => embed.toJSON())
  };
  if (message.author) {
    const {id, username, tag, globalName, avatar, bot, system} = message.author;
    messageData = {
      ...messageData,
      author: {
        id,
        username,
        tag,
        globalName,
        avatar,
        bot,
        system
      },
    }
  }
  if (message.inGuild()) {
    messageData = {
      ...messageData,
      author: {
        ...message.author,
        nickname: message.member?.nickname,
      },
      guild: {
        id: message.guild.id,
        name: message.guild.name
      },
      channel: {id: message.channel.id, name: message.channel.name}
    }
  } else {
    messageData = {
      ...messageData,
      channel: {id: message.channel.id}
    }
  }
  console.log(JSON.stringify(messageData));
}
