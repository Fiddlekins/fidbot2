import {ChatInputCommandInteraction} from "discord.js";
import {clipText, discordLimits} from "../../discordLimits";
import {getGuildSettings} from "../../settings";
import {CommandHandlers} from "../../types";

const normalChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const wideChars = 'ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ';

function makeWide(input: string): string {
  return input.replace(/./g, function ($0) {
    if ($0 === ' ') {
      return '  ';
    }
    let normalIndex = normalChars.indexOf($0);
    if (normalIndex >= 0) {
      return wideChars[normalIndex];
    } else {
      return $0;
    }
  });
}

async function execute(interaction: ChatInputCommandInteraction) {
  const ephemeral = interaction.guildId ? !getGuildSettings(interaction.guildId).wide : false;
  const text = interaction.options.getString('text');
  let reply = `C'mon, gimme something to work with here...`;
  if (text) {
    if (reply.length) {
      reply = makeWide(text);
    } else {
      reply = `A wide nothing is still a nothing.`;
    }
  }
  await interaction.reply({content: clipText(reply, discordLimits.contentLength), ephemeral});
}

export const wideHandlers: CommandHandlers = {
  execute
};
