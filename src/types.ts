import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  ClientEvents,
  Events,
  Message,
  ModalSubmitInteraction,
  Partialize,
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

export type MessageCreateHandler = (...args: ClientEvents[Events.MessageCreate]) => Promise<void>;

export type MessageUpdateHandler = (
  oldMessage: Message | Partialize<Message<boolean>, "type" | "tts" | "pinned" | "system", "author" | "content" | "cleanContent", "">,
  newMessage: Message | Partialize<Message<boolean>, "type" | "tts" | "pinned" | "system", "author" | "content" | "cleanContent", "">,
) => Promise<void>;

export interface Feature {
  data: {
    name: string;
  };
  messageCreate?: MessageCreateHandler;
  messageUpdate?: MessageUpdateHandler;
}
