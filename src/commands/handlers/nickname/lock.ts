import {ChatInputCommandInteraction, GuildMember, userMention} from "discord.js";
import {config} from "../../../config";
import {discordLimits} from "../../../discordLimits";
import {getGuildSettings} from "../../../settings";
import {lockedUserCache} from "./config";

export async function executeLock(interaction: ChatInputCommandInteraction) {
  if (interaction.guildId && interaction.guild) {
    const enabled = getGuildSettings(interaction.guildId).nickname;
    if (enabled) {
      const user = interaction.options.getUser('user');
      let lockedName = interaction.options.getString('locked-name');
      if (user) {
        let guildMember: GuildMember | null = null;
        try {
          guildMember = await interaction.guild.members.fetch(user.id);
        } catch (err) {
          // ignore error
        }
        if (!guildMember) {
          await interaction.reply({
            content: `Cannot find user in server, have they left?`,
            ephemeral: true
          });
          return;
        }
        lockedName = lockedName || guildMember.nickname;
        if (lockedName) {
          if (lockedName.length >= discordLimits.nicknameLength) {
            await interaction.reply({
              content: `"${lockedName}" exceeds the ${discordLimits.nicknameLength} character length limit imposed by Discord`,
              ephemeral: true
            });
          } else {
            let couldSetNickname = false;
            try {
              await guildMember.setNickname(lockedName, `Changed from ${guildMember.nickname || guildMember.displayName} to ${lockedName}. Why? Ask yourself that question`);
              couldSetNickname = true;
            } catch (err) {
              console.error(err);
              // Swallow error
            }
            if (couldSetNickname) {
              const existingGuildTargets = lockedUserCache.get(interaction.guildId) || {};
              lockedUserCache.set(interaction.guildId, {
                ...existingGuildTargets,
                [user.id]: {lockedName, username: user.username},
              });
              await interaction.reply({
                content: `Locked ${userMention(user.id)} with nickname "${lockedName}"`,
                ephemeral: true
              });
            } else {
              await interaction.reply({
                content: `${config.botName} lacks the permissions necessary to change that user's nickname (are they an admin..? Or perhaps the bot needs a role created/hoisted...)`,
                ephemeral: true
              });
            }
          }
        } else {
          await interaction.reply({
            content: 'Lock failed as no locked name was provided and the target user has no existing nickname',
            ephemeral: true
          });
        }
      }
    } else {
      await interaction.reply({content: 'This feature is disabled', ephemeral: true});
    }
  } else {
    await interaction.reply({content: 'This feature is not available here', ephemeral: true});
  }
}
