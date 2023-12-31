import {Collection} from "discord.js";
import {magic8ball} from './magic8ball';
import {call} from './call';
import {Command} from "./types";

export const commands = new Collection<string, Command>();
commands.set(magic8ball.data.name, magic8ball);
commands.set(call.data.name, call);
