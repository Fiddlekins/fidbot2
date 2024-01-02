import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder
} from "discord.js";

export type CommandHandler = (interaction: ChatInputCommandInteraction) => Promise<void>;

export type AutocompleteHandler = (interaction: AutocompleteInteraction) => Promise<void>;

export type ModalSubmitHandler = (interaction: ModalSubmitInteraction) => Promise<void>;

export interface Command {
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">,
  execute: CommandHandler,
  autocomplete?: AutocompleteHandler,
  modalSubmit?: ModalSubmitHandler,
}
