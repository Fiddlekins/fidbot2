import {Client, Events, GatewayIntentBits} from 'discord.js'
import {commands} from "./commands";
import {checkNewStories} from "./commands/handlers/akun/config";
import {config} from "./config";
import {features} from "./features";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  try {
    await Promise.all(features.map((feature) => feature.init?.(readyClient).catch(console.error)));
  } catch (error) {
    console.error(error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = commands.get(interaction.commandName);
    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({content: 'There was an error while executing this command!', ephemeral: true});
      } else {
        await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
      }
    }
  } else if (interaction.isAutocomplete()) {
    const command = commands.get(interaction.commandName);
    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }
    if (!command.autocomplete) {
      console.error(`Matching command ${interaction.commandName} has no autocomplete handler defined.`);
      return;
    }
    try {
      await command.autocomplete(interaction);
    } catch (error) {
      console.error(error);
    }
  } else if (interaction.isModalSubmit()) {
    const [commandName] = interaction.customId.split('/');
    const command = commands.get(commandName);
    if (!command) {
      console.error(`No command matching ${commandName} was found.`);
      return;
    }
    if (!command.modalSubmit) {
      console.error(`Matching command ${commandName} has no modalSubmit handler defined.`);
      return;
    }
    try {
      await command.modalSubmit(interaction);
    } catch (error) {
      console.error(error);
    }
  }
});

client.on(Events.MessageCreate, async (message) => {
  try {
    await Promise.all(features.map((feature) => feature.messageCreate?.(message).catch(console.error)));
  } catch (error) {
    console.error(error);
  }
});

client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
  try {
    await Promise.all(features.map((feature) => feature.messageUpdate?.(oldMessage, newMessage).catch(console.error)));
  } catch (error) {
    console.error(error);
  }
});

client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  try {
    await Promise.all(features.map((feature) => feature.guildMemberUpdate?.(oldMember, newMember).catch(console.error)));
  } catch (error) {
    console.error(error);
  }
});

client.login(config.token).catch(console.error);

function initialiseIndefiniteProcesses() {
  checkNewStories().catch(console.error);
}

initialiseIndefiniteProcesses();
