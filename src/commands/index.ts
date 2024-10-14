import {Collection} from "discord.js";
import {Command} from "../types";
import {akunData} from "./data/akun";
import {autoreplyData} from "./data/autoreply";
import {callData} from "./data/call";
import {choiceData} from "./data/choice";
import {magic8ballData} from "./data/magic8ball";
import {nicknameData} from "./data/nickname";
import {rollData} from "./data/roll";
import {settingsData} from "./data/settings";
import {wideData} from "./data/wide";
import {akunHandlers} from "./handlers/akun/akun";
import {autoreplyHandlers} from "./handlers/autoreply/autoreply";
import {callHandlers} from "./handlers/call";
import {choiceHandlers} from "./handlers/choice";
import {magic8ballHandlers} from "./handlers/magic8ball";
import {nicknameHandlers} from "./handlers/nickname/nickname";
import {rollHandlers} from "./handlers/roll";
import {settingsHandlers} from "./handlers/settings";
import {wideHandlers} from "./handlers/wide";

const commandMap: Record<string, Command> = {
  [akunData.name]: {data: akunData, ...akunHandlers},
  [autoreplyData.name]: {data: autoreplyData, ...autoreplyHandlers},
  [callData.name]: {data: callData, ...callHandlers},
  [choiceData.name]: {data: choiceData, ...choiceHandlers},
  [magic8ballData.name]: {data: magic8ballData, ...magic8ballHandlers},
  [nicknameData.name]: {data: nicknameData, ...nicknameHandlers},
  [rollData.name]: {data: rollData, ...rollHandlers},
  [settingsData.name]: {data: settingsData, ...settingsHandlers},
  [wideData.name]: {data: wideData, ...wideHandlers},
};

export const commands = new Collection<string, Command>();
Object.values(commandMap).forEach((command) => {
  commands.set(command.data.name, command);
});
