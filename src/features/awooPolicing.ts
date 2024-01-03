import {setTimeout} from 'node:timers/promises'
import {getGuildSettings} from "../settings";
import {Feature, MessageCreateHandler} from "../types";

// TODO add stats tracking number of times and total amount fined in a server over a given timeframe?

async function messageCreate(message: Parameters<MessageCreateHandler>[0]) {
  const isFeatureEnabled = message.guildId ? getGuildSettings(message.guildId).awooPolicing : false;
  if (isFeatureEnabled && message.content.length) {
    if (/a+\s*w+\s*o\s*o+/i.test(message.content)) {
      const response = await message.channel.send({content: 'http://i.imgur.com/f7ipWKn.jpg'});
      await setTimeout(2000);
      await response.delete();
    }
  }
}

export const awooPolicing: Feature = {
  data: {
    name: 'awooPolicing',
  },
  messageCreate,
};
