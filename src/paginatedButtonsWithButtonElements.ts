import {ActionRowBuilder} from "discord.js";
import {ButtonBuilder, ChatInputCommandInteraction} from "discord.js/typings";
import {clipArray, discordLimits} from "./discordLimits";
import {executePaginatedButtons, ExecutePaginatedButtonsOptions} from "./paginatedButtons";
import {to2DArray} from "./utils/to2DArray";

export function getElementsPerPage() {
  return discordLimits.component.elementCount * (discordLimits.component.rowCount - 1);
}

export interface ExecutePaginatedButtonsWithButtonElementsOptions extends Omit<ExecutePaginatedButtonsOptions, 'getComponents'> {
}

export async function executePaginatedButtonsWithButtonElements<Type>(
  interaction: ChatInputCommandInteraction,
  getElements: () => Promise<Type[]>,
  elementButtonBuilder: (element: Type, isActive: boolean) => ButtonBuilder,
  options?: ExecutePaginatedButtonsWithButtonElementsOptions,
) {
  const getTotalPageCount = async () => {
    const elements = await getElements();
    return Math.ceil(elements.length / getElementsPerPage());
  };

  await executePaginatedButtons(
    interaction,
    getTotalPageCount,
    {
      ...options,
      getComponents: async (state) => {
        const isActive = state.status === 'active';
        const totalPageCount = await getTotalPageCount();
        const elements = await getElements();
        if (totalPageCount <= 1) {
          return clipArray(to2DArray(elements, discordLimits.component.elementCount), discordLimits.component.rowCount)
            .map((rowElements) => {
              return new ActionRowBuilder<ButtonBuilder>()
                .addComponents(...rowElements.map(element => elementButtonBuilder(element, isActive)));
            });
        } else {
          const elementsPerPage = getElementsPerPage();
          const pageElements = elements.slice(elementsPerPage * state.pageIndex, elementsPerPage * (state.pageIndex + 1));
          return clipArray(to2DArray(pageElements, discordLimits.component.elementCount), discordLimits.component.rowCount - 1)
            .map((rowElements) => {
              return new ActionRowBuilder<ButtonBuilder>()
                .addComponents(...rowElements.map(element => elementButtonBuilder(element, isActive)));
            });
        }
      }
    },
  );
}
