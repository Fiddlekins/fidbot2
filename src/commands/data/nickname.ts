import {PermissionFlagsBits, SlashCommandBuilder} from "discord.js";

export const nicknameData = new SlashCommandBuilder()
  .setName('nickname')
  .setDescription(`Automate the scuffle over a user's nickname`)
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
  .addSubcommand(subcommand => subcommand
    .setName('lock')
    .setDescription(`Lock a user's nickname`)
    .addUserOption(option => option
      .setName('user')
      .setDescription('The user to be subjected to this treatment')
      .setRequired(true)
    )
    .addStringOption(option => option
      .setName('locked-name')
      .setDescription('The nickname to lock the user with. If omitted, they will be locked to their current nickname')
    )
  )
  .addSubcommand(subcommand => subcommand
    .setName('free')
    .setDescription(`Unlock one or more users from nickname jail`)
    .addUserOption(option => option
      .setName('user')
      .setDescription('The user to be freed. If omitted, a selection of locked users will be provided')
    )
  );
