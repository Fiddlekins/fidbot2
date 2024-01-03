import {Collection} from "discord.js";
import {Command} from "../../types";
import {akunData} from "./akun";
import {callData} from "./call";
import {choiceData} from "./choice";
import {magic8ballData} from "./magic8ball";
import {nicknameData} from "./nickname";
import {rollData} from "./roll";
import {settingsData} from "./settings";
import {wideData} from "./wide";

export const commandData = new Collection<string, Command['data']>();
[
  akunData,
  callData,
  choiceData,
  magic8ballData,
  nicknameData,
  rollData,
  settingsData,
  wideData,
].forEach((data) => {
  commandData.set(data.name, data);
});
