import {REST, Routes} from 'discord.js';
import {commandData} from "../commands/data";
import {config} from "../config";

const commandJSONs = commandData.map((data) => data.toJSON());

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(config.token);

async function deploy() {
  console.log(`Started refreshing ${commandJSONs.length} application (/) commands.`);

  // The put method is used to fully refresh all commands in the guild with the current set
  const data = await rest.put(
    Routes.applicationCommands(config.applicationId),
    {body: commandJSONs},
  ) as unknown[];

  console.log(`Successfully reloaded ${data.length} application (/) commands.`);
}

deploy().catch(console.error);
