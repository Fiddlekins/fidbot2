import {REST, Routes} from 'discord.js';
import {commands} from "../commands";
import {config} from "../config";

const commandJSONs = commands.map((command) => command.data.toJSON());

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(config.token);

// and deploy your commands!
(async () => {
  try {
    console.log(`Started refreshing ${commandJSONs.length} application (/) commands.`);

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationCommands(config.applicationId),
      {body: commandJSONs},
    ) as unknown[];

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
