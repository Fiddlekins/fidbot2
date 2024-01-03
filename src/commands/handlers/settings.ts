import {ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction} from "discord.js";
import {defaultGuildSettings, getGuildSettings, GuildSettings, toggleSetting} from "../../settings";
import {CommandHandlers} from "../../types";

function getSettingToggleButton(name: string, label: string, enabled: boolean, active: boolean) {
  return new ButtonBuilder()
    .setCustomId(name)
    .setLabel(label)
    .setStyle(ButtonStyle.Secondary)
    .setEmoji(enabled ? '✅' : '🚫')
    .setDisabled(!active)
}

function getSettingComponents(guildSettings: GuildSettings, active: boolean) {
  const firstRow = new ActionRowBuilder<ButtonBuilder>();
  firstRow.addComponents(
    getSettingToggleButton('akun', 'akun', guildSettings.akun, active),
    getSettingToggleButton('call', 'call', guildSettings.call, active),
    getSettingToggleButton('choice', 'choice', guildSettings.choice, active),
    getSettingToggleButton('roll', 'roll', guildSettings.roll, active),
    getSettingToggleButton('wide', 'wide', guildSettings.wide, active),
  )
  const secondRow = new ActionRowBuilder<ButtonBuilder>();
  secondRow.addComponents(
    getSettingToggleButton('8ball', '8ball', guildSettings["8ball"], active),
  )
  const thirdRow = new ActionRowBuilder<ButtonBuilder>();
  thirdRow.addComponents(
    getSettingToggleButton('twitterEmbed', 'Twitter Embeds', guildSettings.twitterEmbed, active),
  )
  if (active) {
    const lastRow = new ActionRowBuilder<ButtonBuilder>();
    lastRow.addComponents(new ButtonBuilder()
      .setCustomId('finalise')
      .setLabel('Finalise')
      .setStyle(ButtonStyle.Primary)
    );
    return [firstRow, secondRow, thirdRow, lastRow];
  }
  return [firstRow, secondRow, thirdRow];
}

const settingsMessage = 'Toggle the available commands using the following buttons. Commands are enabled when their displayed symbol is ✅.\nDisabled commands are not removed from the slash command list, but when executed they only display for the user that executed them.';

async function execute(interaction: ChatInputCommandInteraction) {
  if (interaction.guildId) {
    const guildSettings = getGuildSettings(interaction.guildId);
    const response = await interaction.reply({
      content: settingsMessage,
      ephemeral: true,
      components: getSettingComponents(guildSettings, true)
    });

    let complete = false;
    while (!complete) {
      try {
        const action = await response.awaitMessageComponent({time: 60_000});
        if (action.customId === 'finalise') {
          complete = true;
          await interaction.editReply({
            content: 'Settings finalised',
            components: getSettingComponents(getGuildSettings(interaction.guildId), false)
          });
        } else {
          const validKeys = Object.keys(defaultGuildSettings);
          if (validKeys.includes(action.customId)) {
            toggleSetting(interaction.guildId, action.customId);
            await action.update({
              content: settingsMessage,
              components: getSettingComponents(getGuildSettings(interaction.guildId), true)
            });
          }
        }
      } catch (e) {
        complete = true;
        await interaction.editReply({
          content: 'Settings finalised',
          components: getSettingComponents(getGuildSettings(interaction.guildId), false)
        });
      }
    }
  } else {
    await interaction.reply({content: 'This command is not available', ephemeral: true});
  }
}

export const settingsHandlers: CommandHandlers = {
  execute,
};
