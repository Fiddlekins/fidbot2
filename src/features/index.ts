import {Collection} from "discord.js";
import {Feature} from "../types";
import {twitterEmbed} from "./twitterEmbed";

export const features = new Collection<string, Feature>();
[
  twitterEmbed,
].forEach((command) => {
  features.set(command.data.name, command);
});
