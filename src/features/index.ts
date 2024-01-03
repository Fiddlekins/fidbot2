import {Collection} from "discord.js";
import {Feature} from "../types";
import {awooPolicing} from "./awooPolicing";
import {nickname} from "./nickname";
import {twitterEmbed} from "./twitterEmbed";

export const features = new Collection<string, Feature>();
[
  awooPolicing,
  nickname,
  twitterEmbed,
].forEach((command) => {
  features.set(command.data.name, command);
});
