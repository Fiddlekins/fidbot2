import {ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction} from "discord.js";
import {clipArray, discordLimits} from "./discordLimits";
import {to2DArray} from "./utils/to2DArray";

export type PaginatedButtonsState = 'active' | 'finished' | 'timedout' | 'error';

export type PaginatedButtonsStateSetter = (stateNew: PaginatedButtonsState) => void;

const PaginatedButtonNamespace = 'PaginatedButtons';

export function getElementsPerPage() {
  return discordLimits.component.elementCount * (discordLimits.component.rowCount - 1);
}

export function getTotalPageCount<Type>(elements: Type[]): number {
  return Math.ceil(elements.length / getElementsPerPage());
}

export function clampPage<Type>(page: number, elements: Type[]): number {
  return Math.min(Math.max(page, 0), getTotalPageCount(elements) - 1);
}

export function getPaginatedButtons<Type>(
  elements: Type[],
  page: number,
  isActive: boolean,
  elementButtonBuilder: (element: Type, isActive: boolean) => ButtonBuilder,
  hasFinishControl: boolean,
) {
  hasFinishControl = hasFinishControl && elements.length > 0;
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

export interface ExecutePaginatedButtonsOptions {
  handleButton?: (customId: string, setState: PaginatedButtonsStateSetter) => Promise<void>,
  wasDeferred?: boolean,
  ephemeral?: boolean;
  hasFinishControl?: boolean;
  timeoutDuration?: number;
  initialPage?: number;
}

export async function executePaginatedButtons<Type>(
  interaction: ChatInputCommandInteraction,
  getElements: () => Promise<Type[]>,
  getContent: (state: PaginatedButtonsState, error?: unknown) => Promise<string | null>,
  elementButtonBuilder: (element: Type, isActive: boolean) => ButtonBuilder,
  options?: ExecutePaginatedButtonsOptions,
) {
  const handleButton = options?.handleButton || null;
  const wasDeferred = options?.wasDeferred || false;
  const ephemeral = options?.ephemeral || true;
  const hasFinishControl = options?.hasFinishControl || true;
  const timeoutDuration = options?.timeoutDuration || 60_000;
  const initialPage = options?.initialPage || 0;

  let elements = await getElements();
  let state: PaginatedButtonsState = 'active';
  const setState = (stateNew: PaginatedButtonsState) => {
    state = stateNew;
  }
  let page = clampPage(initialPage, elements);
  let content = await getContent(state);
  let response;
  if (wasDeferred) {
    response = await interaction.editReply({
      content: content ?? undefined,
      components: getPaginatedButtons(elements, page, state === 'active', elementButtonBuilder, hasFinishControl)
    });
  } else {
    response = await interaction.reply({
      content: content ?? undefined,
      ephemeral,
      components: getPaginatedButtons(elements, page, state === 'active', elementButtonBuilder, hasFinishControl)
    });
  }
  while (state === 'active') {
    try {
      const action = await response.awaitMessageComponent({time: timeoutDuration});
      const [namespace, command] = action.customId.split(':');
      if (namespace === PaginatedButtonNamespace) {
        switch (command) {
          case 'previous':
            page = clampPage(page - 1, elements);
            break;
          case 'next':
            page = clampPage(page + 1, elements);
            break;
          case 'finish':
            state = 'finished';
            break;
          default:
          // Ignore invalid buttons
        }
      } else {
        // Defer to handler to update state elsewhere
        await handleButton?.(action.customId, setState);
      }
      // Get fresh local state
      elements = await getElements();
      content = await getContent(state);
      // Update page if it's out of bounds due to element count changing
      page = clampPage(page, elements);
      await action.update({
        content: content ?? undefined,
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
      page = clampPage(page, elements);
      await interaction.editReply({
        content: content ?? undefined,
        components: getPaginatedButtons(elements, page, false, elementButtonBuilder, hasFinishControl)
      });
    }
  }
}
