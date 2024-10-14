import {
  ActionRowBuilder,
  BaseMessageOptions,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction
} from "discord.js";
import {clipArray, discordLimits} from "./discordLimits";

export type PaginatedButtonsStatus = 'active' | 'finished' | 'timedout' | 'error';

export interface PaginatedButtonsState {
  status: PaginatedButtonsStatus;
  pageIndex: number;
  totalPageCount: number;
  error?: unknown;
}

export type PaginatedButtonsStatusSetter = (statusNew: PaginatedButtonsStatus) => void;

const PaginatedButtonNamespace = 'PaginatedButtons';

export function clampPageIndex(pageIndex: number, totalPageCount: number): number {
  return Math.min(Math.max(pageIndex, 0), totalPageCount - 1);
}

export function getPaginatedButtons(
  pageIndex: number,
  totalPageCount: number,
  isActive: boolean,
  hasFinishControl: boolean,
) {
  // Need to paginate or display finish button, dedicating bottom row for controls
  const hasNavigationControls = totalPageCount > 1;
  if (!hasFinishControl && !hasNavigationControls) {
    return null;
  }
  const controls = new ActionRowBuilder<ButtonBuilder>();
  if (hasNavigationControls) {
    controls.addComponents(
      new ButtonBuilder()
        .setCustomId(`${PaginatedButtonNamespace}:previous`)
        .setLabel('Previous')
        .setDisabled(!isActive || (pageIndex <= 0))
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${PaginatedButtonNamespace}:currentPage`)
        .setLabel(`${pageIndex + 1} / ${totalPageCount}`)
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
        .setDisabled(!isActive || (pageIndex >= (totalPageCount - 1)))
        .setStyle(ButtonStyle.Primary)
    );
  }
  return controls;
}

async function getComponentsWithPaginatedButtons(
  state: PaginatedButtonsState,
  hasFinishControl: boolean,
  getComponents?: (state: PaginatedButtonsState) => Promise<BaseMessageOptions['components'] | null>,
) {
  const paginatedButtons = getPaginatedButtons(
    state.pageIndex,
    state.totalPageCount,
    state.status === 'active',
    hasFinishControl,
  );
  let rows: BaseMessageOptions['components'] = [];
  if (getComponents) {
    const components = await getComponents(state);
    if (components) {
      if (paginatedButtons) {
        rows = clipArray(components.slice(), discordLimits.component.rowCount - 1);
      } else {
        rows = clipArray(components.slice(), discordLimits.component.rowCount);
      }
    }
  }
  if (paginatedButtons) {
    rows = [
      ...rows,
      paginatedButtons,
    ];
  }
  if (rows.length) {
    return rows;
  } else {
    return null;
  }
}

export async function defaultGetContent(state: PaginatedButtonsState) {
  switch (state.status) {
    case "active":
      return null;
    case "finished":
      return null;
    case "timedout":
      return null;
    case "error":
      return 'Something went wrong...';
    default:
      return 'Something went wrong...';
  }
}

export async function defaultGetComponents() {
  return null;
}

export interface ExecutePaginatedButtonsOptions {
  handleButton?: (customId: string, setStatus: PaginatedButtonsStatusSetter) => Promise<void>,
  wasDeferred?: boolean,
  ephemeral?: boolean;
  hasFinishControl?: boolean;
  timeoutDuration?: number;
  initialPageIndex?: number;
  getContent?: (state: PaginatedButtonsState) => Promise<BaseMessageOptions['content'] | null>,
  getComponents?: (state: PaginatedButtonsState) => Promise<BaseMessageOptions['components'] | null>,
}

export async function executePaginatedButtons(
  interaction: ChatInputCommandInteraction,
  getTotalPageCount: () => Promise<number>,
  options?: ExecutePaginatedButtonsOptions,
) {
  const handleButton = options?.handleButton || null;
  const wasDeferred = options?.wasDeferred || false;
  const ephemeral = options?.ephemeral || true;
  const hasFinishControl = options?.hasFinishControl || true;
  const timeoutDuration = options?.timeoutDuration || 60_000;
  const initialPageIndex = options?.initialPageIndex || 0;
  const getContent = options?.getContent || defaultGetContent;
  const getComponents = options?.getComponents || defaultGetComponents;

  const state: PaginatedButtonsState = {
    status: 'active',
    pageIndex: 0,
    totalPageCount: 0,
    error: undefined,
  }
  state.totalPageCount = await getTotalPageCount();
  state.pageIndex = clampPageIndex(initialPageIndex, state.totalPageCount);
  const setStatus = (statusNew: PaginatedButtonsStatus) => {
    state.status = statusNew;
  }

  let [content, components] = await Promise.all([
    await getContent(state),
    await getComponentsWithPaginatedButtons(state, hasFinishControl, getComponents),
  ]);
  let response;
  if (wasDeferred) {
    response = await interaction.editReply({
      content: content ?? undefined,
      components: components ?? undefined,
    });
  } else {
    response = await interaction.reply({
      content: content ?? undefined,
      components: components ?? undefined,
      ephemeral,
    });
  }
  while (state.status === 'active') {
    try {
      const action = await response.awaitMessageComponent({time: timeoutDuration});
      const [namespace, command] = action.customId.split(':');
      if (namespace === PaginatedButtonNamespace) {
        switch (command) {
          case 'previous':
            state.pageIndex = clampPageIndex(state.pageIndex - 1, state.totalPageCount);
            break;
          case 'next':
            state.pageIndex = clampPageIndex(state.pageIndex + 1, state.totalPageCount);
            break;
          case 'finish':
            state.status = 'finished';
            break;
          default:
          // Ignore invalid buttons
        }
      } else {
        // Defer to handler to update status elsewhere
        await handleButton?.(action.customId, setStatus);
      }
      // Get fresh local status
      state.totalPageCount = await getTotalPageCount();
      // Update pageIndex if it's out of bounds due to total page count changing
      state.pageIndex = clampPageIndex(state.pageIndex, state.totalPageCount);
      [content, components] = await Promise.all([
        await getContent(state),
        await getComponentsWithPaginatedButtons(state, hasFinishControl, getComponents),
      ]);
      await action.update({
        content: content ?? undefined,
        components: components ?? undefined,
      });
    } catch (err) {
      const collectorError = err as Error;
      if (collectorError && collectorError.message === 'Collector received no interactions before ending with reason: time') {
        state.status = 'timedout';
        [content, components] = await Promise.all([
          await getContent(state),
          await getComponentsWithPaginatedButtons(state, hasFinishControl, getComponents),
        ]);
      } else {
        state.status = 'error';
        state.error = err;
        [content, components] = await Promise.all([
          await getContent(state),
          await getComponentsWithPaginatedButtons(state, hasFinishControl, getComponents),
        ]);
      }
      state.totalPageCount = await getTotalPageCount();
      // Update pageIndex if it's out of bounds due to total page count changing
      state.pageIndex = clampPageIndex(state.pageIndex, state.totalPageCount);
      await interaction.editReply({
        content: content ?? undefined,
        components: components ?? undefined,
      });
    }
  }
}
