import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder
} from "discord.js";
import {config} from "../config";
import {defaultGuildSettings, getGuildSettings, GuildSettings, toggleSetting} from "../settings";
import {Command} from "./types";

const data = new SlashCommandBuilder()
  .setName('settings')
  .setDescription(`Tailor ${config.botName} to be the perfect subordinate`)
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageGuild);

function getSettingToggleButton(name: string, enabled: boolean, active: boolean) {
  return new ButtonBuilder()
    .setCustomId(name)
    .setLabel(name)
    .setStyle(ButtonStyle.Secondary)
    .setEmoji(enabled ? '✅' : '🚫')
    .setDisabled(!active)
}

function getSettingComponents(guildSettings: GuildSettings, active: boolean) {
  const firstRow = new ActionRowBuilder<ButtonBuilder>();
  firstRow.addComponents(
    getSettingToggleButton('akun', guildSettings.akun, active),
    getSettingToggleButton('call', guildSettings.call, active),
    getSettingToggleButton('8ball', guildSettings["8ball"], active),
  )
  if (active) {
    const lastRow = new ActionRowBuilder<ButtonBuilder>();
    lastRow.addComponents(new ButtonBuilder()
      .setCustomId('finalise')
      .setLabel('Finalise')
      .setStyle(ButtonStyle.Primary)
    );
    return [firstRow, lastRow];
  }
  return [firstRow];
}

const settingsMessage = 'Toggle the available commands using the following buttons. Commands are enabled when their displayed symbol is ✅.\nDisabled commands are not removed from the slash command list, but when executed they only display for the user that executed them.';

async function execute(interaction: ChatInputCommandInteraction) {
  if (interaction.guild) {
    const guildSettings = getGuildSettings(interaction.guild.id);
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
            components: getSettingComponents(getGuildSettings(interaction.guild.id), false)
          });
        } else {
          const validKeys = Object.keys(defaultGuildSettings);
          if (validKeys.includes(action.customId)) {
            toggleSetting(interaction.guild.id, action.customId);
            await action.update({
              content: settingsMessage,
              components: getSettingComponents(getGuildSettings(interaction.guild.id), true)
            });
          }
        }
      } catch (e) {
        complete = true;
        await interaction.editReply({
          content: 'Settings finalised',
          components: getSettingComponents(getGuildSettings(interaction.guild.id), false)
        });
      }
    }
  } else {
    await interaction.reply({content: 'This command is not available', ephemeral: true});
  }
}

export const settings: Command = {
  data,
  execute,
};
