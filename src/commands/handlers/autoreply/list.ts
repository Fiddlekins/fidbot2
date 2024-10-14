import {ChatInputCommandInteraction} from "discord.js";
import {RE2} from "re2-wasm";
import {table} from 'table';
import {TableUserConfig} from "table/dist/src/types/api";
import {discordLimits} from "../../../discordLimits";
import {executePaginatedButtons} from "../../../paginatedButtons";
import {getGuildSettings} from "../../../settings";
import {autoreplyCache, AutoreplyConfig} from "./config";

interface AutoreplyConfigWithUser extends AutoreplyConfig {
  user?: string;
}

const tableHeaders = ['ID', 'user', 'match', 'response'];
const tableConfig: TableUserConfig = {
  columns: {
    // Discord max width is 130, each column is padded by 2, each column has one left border, final column has right border
    0: {width: 8 - 3},
    1: {width: 16 - 3},
    2: {width: 32 - 3},
    3: {width: 74 - 4},
  },
  border: {
    topBody: `─`,
    topJoin: `┬`,
    topLeft: `┌`,
    topRight: `┐`,

    bottomBody: `─`,
    bottomJoin: `┴`,
    bottomLeft: `└`,
    bottomRight: `┘`,

    bodyLeft: `│`,
    bodyRight: `│`,
    bodyJoin: `│`,

    joinBody: `─`,
    joinLeft: `├`,
    joinRight: `┤`,
    joinJoin: `┼`
  }
};

function generateContentPage(
  autoreplyConfigs: AutoreplyConfigWithUser[],
  startIndex: number,
  count: number,
) {
  const data = autoreplyConfigs.slice(startIndex, startIndex + count)
    .map(({id, user, match, response}) => {
      return [id, user || '', match?.length ? `/${match}/ui` : '', response];
    });
  const tableString = table([
    tableHeaders,
    ...data
  ], tableConfig);
  return `\`\`\`${tableString}\`\`\``;
}

function forceFitSingleEntryContentPage(
  autoreplyConfig: AutoreplyConfigWithUser,
) {
  const {id, user, match, response} = autoreplyConfig;
  const tableString = table([
    tableHeaders,
    [id, user || '', match?.length ? `/${match}/ui` : '', response]
  ], tableConfig);
  // Be lazy and just clip the bottom of the table off to make it fit
  // This conveniently means both match and response get trimmed in a relatively proportional manner too
  const contentPage = `\`\`\`${tableString.slice(0, discordLimits.contentLength - 6)}\`\`\``;
  if (contentPage.length > discordLimits.contentLength) {
    throw new Error(`Who knows how but the page is too long`);
  }
  return contentPage;
}

function generateContentPages(
  autoreplyConfigs: AutoreplyConfigWithUser[],
  lastPageToGenerateIndex: number,
  existingContentPages: string[],
  lastProcessedAutoreplyConfigIndex: number,
) {
  const contentPages = existingContentPages.slice();
  let pageStartAutoreplyConfigIndex = lastProcessedAutoreplyConfigIndex + 1;
  while (contentPages.length - 1 < lastPageToGenerateIndex && pageStartAutoreplyConfigIndex < autoreplyConfigs.length) {
    let pageAutoreplyConfigCount = 0;
    let previousContentPageAttempt = '';
    let contentPageAttempt = '';
    while (contentPageAttempt.length < discordLimits.contentLength
    && (pageStartAutoreplyConfigIndex + pageAutoreplyConfigCount) < autoreplyConfigs.length) {
      const countAttempt = pageAutoreplyConfigCount + 1;
      contentPageAttempt = generateContentPage(autoreplyConfigs, pageStartAutoreplyConfigIndex, countAttempt);
      if (contentPageAttempt.length <= discordLimits.contentLength) {
        previousContentPageAttempt = contentPageAttempt;
        pageAutoreplyConfigCount++;
      } else if (countAttempt <= 1) {
        // If one entry doesn't fit then force it to so that we don't get stuck on it
        contentPageAttempt = forceFitSingleEntryContentPage(autoreplyConfigs[pageStartAutoreplyConfigIndex]);
        previousContentPageAttempt = contentPageAttempt;
        pageAutoreplyConfigCount++;
      }
    }
    contentPages.push(previousContentPageAttempt);
    pageStartAutoreplyConfigIndex = pageStartAutoreplyConfigIndex + pageAutoreplyConfigCount;
  }
  return {
    contentPages,
    lastProcessedAutoreplyConfigIndex: pageStartAutoreplyConfigIndex - 1,
  };
}

export async function executeList(interaction: ChatInputCommandInteraction) {
  const guildId = interaction.guildId;
  if (guildId && interaction.guild) {
    const enabled = getGuildSettings(guildId).autoreply;
    if (enabled) {
      const user = interaction.options.getUser('user');
      const match = interaction.options.getString('match');
      const response = interaction.options.getString('response');
      const guildAutoreplyConfigs = autoreplyCache.get(guildId);
      if (!guildAutoreplyConfigs) {
        await interaction.reply({content: 'No autoreplies exist', ephemeral: true});
        return;
      }
      let autoreplyConfigs: AutoreplyConfigWithUser[] = guildAutoreplyConfigs.anyUser;
      if (user) {
        const specificUserAutoreplyConfigs: AutoreplyConfig[] | undefined = guildAutoreplyConfigs.specificUser[user.id];
        if (specificUserAutoreplyConfigs) {
          autoreplyConfigs = specificUserAutoreplyConfigs
            .map((autoreplyConfig) => {
              return {
                ...autoreplyConfig,
                user: user.username,
              };
            });
        } else {
          autoreplyConfigs = [];
        }
      } else {
        for (const userId of Object.keys(guildAutoreplyConfigs.specificUser)) {
          try {
            const member = await interaction.guild.members.fetch(userId);
            autoreplyConfigs = autoreplyConfigs.concat(
              guildAutoreplyConfigs.specificUser[userId]
                .map((autoreplyConfig) => {
                  return {
                    ...autoreplyConfig,
                    user: member.user.username,
                  };
                })
            );
          } catch (err) {
            console.error(`Failed to retrieve member ${userId}:\n${err}`);
          }
        }
      }
      if (match) {
        autoreplyConfigs = autoreplyConfigs.filter((autoreplyConfig) => {
          // substring check, case-sensitive since regex patterns are
          return autoreplyConfig.match && autoreplyConfig.match.includes(match);
        });
      }
      if (response) {
        autoreplyConfigs = autoreplyConfigs.filter((autoreplyConfig) => {
          // case-insensitive regex check
          const regex = new RE2(response, 'ui');
          return regex.test(autoreplyConfig.response);
        });
      }
      if (autoreplyConfigs.length) {
        autoreplyConfigs = autoreplyConfigs.sort((a, b) => a.id - b.id);
        let {
          contentPages,
          lastProcessedAutoreplyConfigIndex,
        } = generateContentPages(
          autoreplyConfigs,
          1,
          [],
          -1,
        );

        await executePaginatedButtons(
          interaction,
          async () => {
            const meanAutoreplyConfigsPerPage = (lastProcessedAutoreplyConfigIndex + 1) / contentPages.length;
            return Math.ceil(autoreplyConfigs.length / meanAutoreplyConfigsPerPage);
          },
          {
            ephemeral: true,
            getContent: async ({pageIndex}) => {
              if (pageIndex >= contentPages.length) {
                const {
                  contentPages: contentPagesNew,
                  lastProcessedAutoreplyConfigIndex: lastProcessedAutoreplyConfigIndexNew,
                } = generateContentPages(
                  autoreplyConfigs,
                  pageIndex + 1,
                  contentPages,
                  lastProcessedAutoreplyConfigIndex,
                );
                contentPages = contentPagesNew;
                lastProcessedAutoreplyConfigIndex = lastProcessedAutoreplyConfigIndexNew;
              }
              return contentPages[pageIndex];
            }
          }
        );
      } else {
        await interaction.reply({content: 'No autoreplies exist', ephemeral: true});
      }
    } else {
      await interaction.reply({content: 'This feature is disabled', ephemeral: true});
    }
  } else {
    await interaction.reply({content: 'This feature is not available here', ephemeral: true});
  }
}
