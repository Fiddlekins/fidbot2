import {ChatInputCommandInteraction} from "discord.js";
import {getGuildSettings} from "../../../settings";
import {autoreplyCache} from "./config";

export async function executeRemove(interaction: ChatInputCommandInteraction) {
  if (interaction.guildId && interaction.guild) {
    const enabled = getGuildSettings(interaction.guildId).autoreply;
    if (enabled) {
      const id = interaction.options.getInteger('id');
      if (id !== null) {
        let autoreplyConfigs = autoreplyCache.get(interaction.guildId);
        if (autoreplyConfigs) {
          let configRemoved = false;
          const anyUserNew = autoreplyConfigs.anyUser.filter(({id: candidateId}) => {
            return candidateId !== id;
          });
          configRemoved = anyUserNew.length < autoreplyConfigs.anyUser.length;
          if (configRemoved) {
            autoreplyConfigs.anyUser = anyUserNew;
          } else {
            for (const userId of Object.keys(autoreplyConfigs.specificUser)) {
              const specificUserNew = autoreplyConfigs.specificUser[userId].filter(({id: candidateId}) => {
                return candidateId !== id;
              });
              configRemoved = specificUserNew.length < autoreplyConfigs.specificUser[userId].length;
              if (configRemoved) {
                autoreplyConfigs.specificUser[userId] = specificUserNew;
                break;
              }
            }
          }
          if (configRemoved) {
            autoreplyCache.set(interaction.guildId, autoreplyConfigs);
            await interaction.reply({
              content: `Removed autoreply with ID ${id}`,
              ephemeral: true
            });
            return;
          }
        }
        await interaction.reply({
          content: `Unable to find autoreply with ID ${id}`,
          ephemeral: true
        });
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
