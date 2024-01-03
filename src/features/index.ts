import {Collection} from "discord.js";
import {Feature} from "../types";
import {awooPolicing} from "./awooPolicing";
import {twitterEmbed} from "./twitterEmbed";

export const features = new Collection<string, Feature>();
[
  awooPolicing,
  twitterEmbed,
].forEach((command) => {
  features.set(command.data.name, command);
});
