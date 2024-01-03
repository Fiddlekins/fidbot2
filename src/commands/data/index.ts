import {Collection} from "discord.js";
import {Command} from "../../types";
import {akunData} from "./akun";
import {callData} from "./call";
import {choiceData} from "./choice";
import {magic8ballData} from "./magic8ball";
import {settingsData} from "./settings";

export const commandData = new Collection<string, Command['data']>();
[
  akunData,
  callData,
  choiceData,
  magic8ballData,
  settingsData,
].forEach((data) => {
  commandData.set(data.name, data);
});