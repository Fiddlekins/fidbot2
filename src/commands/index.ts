import {Collection} from "discord.js";
import {akun} from './akun/akun';
import {call} from './call';
import {magic8ball} from './magic8ball';
import {Command} from "./types";

export const commands = new Collection<string, Command>();
commands.set(akun.data.name, akun);
commands.set(call.data.name, call);
commands.set(magic8ball.data.name, magic8ball);
