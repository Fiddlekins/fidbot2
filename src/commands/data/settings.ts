import {PermissionFlagsBits, SlashCommandBuilder} from "discord.js";
import {config} from "../../config";

export const settingsData = new SlashCommandBuilder()
  .setName('settings')
  .setDescription(`Tailor ${config.botName} to be the perfect subordinate`)
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);
