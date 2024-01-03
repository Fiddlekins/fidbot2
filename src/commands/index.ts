import {Collection} from "discord.js";
import {Command} from "../types";
import {akunData} from "./data/akun";
import {callData} from "./data/call";
import {choiceData} from "./data/choice";
import {magic8ballData} from "./data/magic8ball";
import {rollData} from "./data/roll";
import {settingsData} from "./data/settings";
import {akunHandlers} from "./handlers/akun/akun";
import {callHandlers} from "./handlers/call";
import {choiceHandlers} from "./handlers/choice";
import {magic8ballHandlers} from "./handlers/magic8ball";
import {rollHandlers} from "./handlers/roll";
import {settingsHandlers} from "./handlers/settings";

const akun: Command = {data: akunData, ...akunHandlers};
const call: Command = {data: callData, ...callHandlers};
const choice: Command = {data: choiceData, ...choiceHandlers};
const magic8ball: Command = {data: magic8ballData, ...magic8ballHandlers};
const roll: Command = {data: rollData, ...rollHandlers};
const settings: Command = {data: settingsData, ...settingsHandlers};

export const commands = new Collection<string, Command>();
[
  akun,
  call,
  choice,
  magic8ball,
  roll,
  settings
].forEach((command) => {
  commands.set(command.data.name, command);
});
