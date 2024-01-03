import {Collection} from "discord.js";
import {akunData} from "./data/akun";
import {callData} from "./data/call";
import {magic8ballData} from "./data/magic8ball";
import {settingsData} from "./data/settings";
import {akunHandlers} from "./handlers/akun/akun";
import {callHandlers} from "./handlers/call";
import {magic8ballHandlers} from "./handlers/magic8ball";
import {settingsHandlers} from "./handlers/settings";
import {Command} from "../types";

const akun: Command = {data: akunData, ...akunHandlers};
const call: Command = {data: callData, ...callHandlers};
const magic8ball: Command = {data: magic8ballData, ...magic8ballHandlers};
const settings: Command = {data: settingsData, ...settingsHandlers};

export const commands = new Collection<string, Command>();
[
  akun,
  call,
  magic8ball,
  settings
].forEach((command) => {
  commands.set(command.data.name, command);
});
