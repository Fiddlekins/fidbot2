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

export interface CommandHandlers {
  execute: CommandHandler,
  autocomplete?: AutocompleteHandler,
  modalSubmit?: ModalSubmitHandler,
}

export interface Command extends CommandHandlers {
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">,
}
