import {ChatInputCommandInteraction} from "discord.js";
import RE2 from 're2';
import {discordLimits} from "../../../discordLimits";
import {getGuildSettings} from "../../../settings";
import {autoreplyCache, AutoreplyConfig, GuildAutoreplyConfigs} from "./config";

export async function executeCreate(interaction: ChatInputCommandInteraction) {
  if (interaction.guildId && interaction.guild) {
    const enabled = getGuildSettings(interaction.guildId).autoreply;
    if (enabled) {
      const user = interaction.options.getUser('user');
      const match = interaction.options.getString('match');
      const response = interaction.options.getString('response');
      let isMatchInvalid = false;
      if (match) {
        try {
          new RE2(match, 'ui');
        } catch (err) {
          console.log(err);
          isMatchInvalid = true;
        }
      }
      if (isMatchInvalid) {
        await interaction.reply({
          content: `The match parameter uses regex syntax that is not permitted due to risk of ReDoS`,
          ephemeral: true
        });
      } else if (response) {
        if (response.length >= discordLimits.contentLength) {
          await interaction.reply({
            content: `Response exceeds the ${discordLimits.contentLength} character length limit imposed by Discord`,
            ephemeral: true
          });
        } else if (response.length === 0) {
          await interaction.reply({
            content: `Response cannot be empty`,
            ephemeral: true
          });
        } else {
          let autoreplyConfigs: GuildAutoreplyConfigs | undefined = autoreplyCache.get(interaction.guildId);
          if (!autoreplyConfigs) {
            autoreplyConfigs = {
              nextId: 0,
              anyUser: [],
              specificUser: {},
            };
            autoreplyCache.set(interaction.guildId, autoreplyConfigs);
          }
          const autoreplyConfig: AutoreplyConfig = {
            id: autoreplyConfigs.nextId,
            created: Date.now(),
            response,
          }
          if (match) {
            autoreplyConfig.match = match;
          }
          autoreplyConfigs.nextId++;
          if (user) {
            let userAutoreplyConfigs = autoreplyConfigs.specificUser[user.id];
            if (!userAutoreplyConfigs) {
              userAutoreplyConfigs = [];
              autoreplyConfigs.specificUser[user.id] = userAutoreplyConfigs;
            }
            userAutoreplyConfigs.push(autoreplyConfig);
          } else {
            autoreplyConfigs.anyUser.push(autoreplyConfig);
          }
          autoreplyCache.set(interaction.guildId, autoreplyConfigs);
          await interaction.reply({
            content: `Autoreply created with ID ${autoreplyConfig.id}`,
            ephemeral: true
          });
        }
      } else {
        await interaction.reply({content: `Something went wrong`, ephemeral: true});
      }
    } else {
      await interaction.reply({content: 'This feature is disabled', ephemeral: true});
    }
  } else {
    await interaction.reply({content: 'This feature is not available here', ephemeral: true});
  }
}
