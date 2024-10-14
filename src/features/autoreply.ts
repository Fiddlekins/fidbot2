import {userMention} from "discord.js";
import {setTimeout} from 'node:timers/promises'
import {RE2} from 're2-wasm';
import {autoreplyCache, AutoreplyConfig} from "../commands/handlers/autoreply/config";
import {getGuildSettings} from "../settings";
import {Feature, MessageCreateHandler} from "../types";
import {isBotAuthor} from "../utils/isBotAuthor";

async function messageCreate(message: Parameters<MessageCreateHandler>[0]) {
  if (isBotAuthor(message)) {
    return;
  }
  const isFeatureEnabled = message.guildId ? getGuildSettings(message.guildId).autoreply : false;
  if (isFeatureEnabled && message.guildId) {
    const guildAutoreplyConfigs = autoreplyCache.get(message.guildId);
    if (guildAutoreplyConfigs) {

      let autoreplyConfigs: AutoreplyConfig[] = guildAutoreplyConfigs.anyUser;
      if (guildAutoreplyConfigs.specificUser[message.member?.user?.id || '']) {
        autoreplyConfigs = autoreplyConfigs.concat(guildAutoreplyConfigs.specificUser[message.member?.user?.id || '']);
      }
      const matchedAutoreplyConfigs = autoreplyConfigs.filter(({match}) => {
        if (match) {
          const re = new RE2(match, 'ui');
          return re.test(message.content);
        }
        return true;
      });
      // Prioritise most recently created user specific, limit of 3 replies to one message
      const prioritisedAutoreplyConfigs = matchedAutoreplyConfigs.reverse().slice(0, 3);
      for (const {response} of prioritisedAutoreplyConfigs) {
        const content = response.replaceAll(/<user>/ig, userMention(message?.member?.user?.id || ''));
        await message.channel.send({content});
        await setTimeout(100);
      }
    }
  }
}

export const autoreply: Feature = {
  data: {
    name: 'autoreply',
  },
  messageCreate,
};
