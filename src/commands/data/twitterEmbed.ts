import {PermissionFlagsBits, SlashCommandBuilder} from "discord.js";

export const twitterEmbedData = new SlashCommandBuilder()
  .setName('twitter-embed')
  .setDescription(`Configure which users the feature will activate for`)
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand(subcommand => subcommand
    .setName('whitelist')
    .setDescription(`Manage the whitelist. Omit <user> parameter to show list for removing users`)
    .addUserOption(option => option
      .setName('user')
      .setDescription('Toggle user presence in the whitelist (Fidbot will check their posts for tweet embedding)')
    )
  )
  .addSubcommand(subcommand => subcommand
    .setName('blacklist')
    .setDescription(`Manage the blacklist. Omit <user> parameter to show list for removing users`)
    .addUserOption(option => option
      .setName('user')
      .setDescription('Toggle user presence in the blacklist (Fidbot will ignore their posts for tweet embedding)')
    )
  );
