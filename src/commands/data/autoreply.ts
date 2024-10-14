import {PermissionFlagsBits, SlashCommandBuilder} from "discord.js";

export const autoreplyData = new SlashCommandBuilder()
  .setName('autoreply')
  .setDescription(`Have Fidbot automatically reply to messages`)
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(subcommand => subcommand
    .setName('create')
    .setDescription(`Create a new autoreply`)
    .addStringOption(option => option
      .setName('response')
      .setDescription('The response to reply with. Template values include: `<user>`')
      .setRequired(true)
    )
    .addUserOption(option => option
      .setName('user')
      .setDescription('Only reply to messages posted by this user')
    )
    .addStringOption(option => option
      .setName('match')
      .setDescription('Only reply to messages that match this pattern. This is a case-insensitive regular expression')
    )
  )
  .addSubcommand(subcommand => subcommand
    .setName('list')
    .setDescription(`Lists the active autoreplies. Used to obtain the ID used for removing the autoreply`)
    .addUserOption(option => option
      .setName('user')
      .setDescription('Filter list by user')
    )
    .addStringOption(option => option
      .setName('match')
      .setDescription('Filter by match pattern. This is used for a case-insensitive substring check')
    )
    .addStringOption(option => option
      .setName('response')
      .setDescription('Filter by response. This is a case-insensitive regular expression')
    )
  )
  .addSubcommand(subcommand => subcommand
    .setName('remove')
    .setDescription(`Removes an autoreply`)
    .addIntegerOption(option => option
      .setName('id')
      .setDescription('The ID of the autoreply to be removed')
      .setRequired(true)
    )
  );
