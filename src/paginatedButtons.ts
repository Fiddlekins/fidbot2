import {ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction} from "discord.js";
import {clipArray, discordLimits} from "./discordLimits";
import {to2DArray} from "./utils/to2DArray";

export type PaginatedButtonsState = 'active' | 'finished' | 'timedout' | 'error';

const PaginatedButtonNamespace = 'PaginatedButtons';

export function getElementsPerPage() {
  return discordLimits.component.elementCount * (discordLimits.component.rowCount - 1);
}

export function getTotalPageCount<Type>(elements: Type[]): number {
  return Math.ceil(elements.length / getElementsPerPage());
}

export function getPaginatedButtons<Type>(
  elements: Type[],
  page: number,
  isActive: boolean,
  elementButtonBuilder: (element: Type, isActive: boolean) => ButtonBuilder,
  hasFinishControl: boolean,
) {
  if (!hasFinishControl && elements.length < (discordLimits.component.elementCount * discordLimits.component.rowCount)) {
    // Can fit all on one page without navigation controls
    return clipArray(to2DArray(elements, discordLimits.component.elementCount), discordLimits.component.rowCount)
      .map((rowElements) => {
        return new ActionRowBuilder<ButtonBuilder>()
          .addComponents(...rowElements.map(element => elementButtonBuilder(element, isActive)));
      });
  } else {
    // Need to paginate or display finish button, dedicating bottom row for controls
    const totalPageCount = getTotalPageCount(elements);
    const elementsPerPage = getElementsPerPage();
    const pageElements = elements.slice(elementsPerPage * page, elementsPerPage * (page + 1));
    const hasNavigationControls = totalPageCount > 1;
    const controls = new ActionRowBuilder<ButtonBuilder>();
    if (hasNavigationControls) {
      controls.addComponents(
        new ButtonBuilder()
          .setCustomId(`${PaginatedButtonNamespace}:previous`)
          .setLabel('Previous')
          .setDisabled(!isActive || (page <= 0))
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`${PaginatedButtonNamespace}:currentPage`)
          .setLabel(`${page + 1} / ${totalPageCount}`)
          .setDisabled(true)
          .setStyle(ButtonStyle.Secondary),
      );
    }
    if (hasFinishControl) {
      controls.addComponents(
        new ButtonBuilder()
          .setCustomId(`${PaginatedButtonNamespace}:finish`)
          .setLabel(`Finish`)
          .setDisabled(!isActive)
          .setStyle(ButtonStyle.Success)
      );
    }
    if (hasNavigationControls) {
      controls.addComponents(
        new ButtonBuilder()
          .setCustomId(`${PaginatedButtonNamespace}:next`)
          .setLabel('Next')
          .setDisabled(!isActive || (page >= (totalPageCount - 1)))
          .setStyle(ButtonStyle.Primary)
      );
    }
    return [
      ...clipArray(to2DArray(pageElements, discordLimits.component.elementCount), discordLimits.component.rowCount - 1)
        .map((rowElements) => {
          return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(...rowElements.map(element => elementButtonBuilder(element, isActive)));
        }),
      controls
    ];
  }
}

export async function executePaginatedButtons<Type>(
  interaction: ChatInputCommandInteraction,
  getElements: () => Promise<Type[]>,
  getContent: (state: PaginatedButtonsState, error?: unknown) => Promise<string>,
  elementButtonBuilder: (element: Type, isActive: boolean) => ButtonBuilder,
  handleButton: (customId: string) => Promise<void>,
  hasFinishControl: boolean = false,
  timeoutDuration: number = 60_000,
) {
  let elements = await getElements();
  let state: PaginatedButtonsState = 'active';
  let page = 0;
  let content = await getContent(state);
  const response = await interaction.reply({
    content,
    // Doesn't make sense for multiple users to interact with a paginated interface, so always ephemeral
    ephemeral: true,
    components: getPaginatedButtons(elements, page, state === 'active', elementButtonBuilder, hasFinishControl)
  });
  while (state === 'active') {
    try {
      const action = await response.awaitMessageComponent({time: timeoutDuration});
      const [namespace, command] = action.customId.split(':');
      if (namespace === PaginatedButtonNamespace) {
        switch (command) {
          case 'previous':
            page = Math.max(page - 1, 0);
            break;
          case 'next':
            page = Math.min(page + 1, getTotalPageCount(elements) - 1);
            break;
          case 'finish':
            state = 'finished';
            break;
          default:
          // Ignore invalid buttons
        }
      } else {
        // Defer to handler to update state elsewhere
        await handleButton(action.customId);
      }
      // Get fresh local state
      elements = await getElements();
      content = await getContent(state);
      // Update page if it's out of bounds due to element count changing
      page = Math.min(Math.max(page, 0), getTotalPageCount(elements) - 1);
      await action.update({
        content,
        components: getPaginatedButtons(elements, page, state === 'active', elementButtonBuilder, hasFinishControl)
      });
    } catch (err) {
      const collectorError = err as Error;
      if (collectorError && collectorError.message === 'Collector received no interactions before ending with reason: time') {
        state = 'timedout';
        content = await getContent(state);
      } else {
        state = 'error';
        content = await getContent(state, err);
      }
      elements = await getElements();
      // Update page if it's out of bounds due to element count changing
      page = Math.min(Math.max(page, 0), getTotalPageCount(elements) - 1);
      await interaction.editReply({
        content,
        components: getPaginatedButtons(elements, page, false, elementButtonBuilder, hasFinishControl)
      });
    }
  }
}
