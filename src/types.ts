import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Client,
  ClientEvents,
  Events,
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

export type InitHandler = (client: Client<true>) => Promise<void>;

export type GuildMemberUpdateHandler = (...args: ClientEvents[Events.GuildMemberUpdate]) => Promise<void>;

export type MessageCreateHandler = (...args: ClientEvents[Events.MessageCreate]) => Promise<void>;

export type MessageUpdateHandler = (...args: ClientEvents[Events.MessageUpdate]) => Promise<void>;

export type MessageDeleteHandler = (...args: ClientEvents[Events.MessageDelete]) => Promise<void>;

export type MessageBulkDeleteHandler = (...args: ClientEvents[Events.MessageBulkDelete]) => Promise<void>;

export interface Feature {
  data: {
    name: string;
  };
  init?: InitHandler;
  guildMemberUpdate?: GuildMemberUpdateHandler;
  messageCreate?: MessageCreateHandler;
  messageUpdate?: MessageUpdateHandler;
  messageDelete?: MessageDeleteHandler;
  messageBulkDelete?: MessageBulkDeleteHandler;
}
