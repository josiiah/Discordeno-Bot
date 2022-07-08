import { AmethystBot, AmethystEmbed } from "../../deps.ts";
import { serverBotLog } from "../helpers/helpers.ts";
import { events } from "./mod.ts";

events.guildCreate = (bot, guild) => {
  const embed = new AmethystEmbed()
    .setTitle("Guild Created")
    .setDescription(
      `
    Guild Name: ${guild.name}
    Guild ID: ${guild.id}
    Guild Owner: <@${guild.ownerId}>
    Guild Members: ${guild.memberCount}
    `
    )
    .setColor("#00FF00")
    .setTimestamp();
  serverBotLog(bot as AmethystBot, embed);
};

events.guildDelete = (bot) => {
  const embed = new AmethystEmbed()
    .setTitle("Guild Removed")
    .setColor("#FF0000")
    .setTimestamp();
  serverBotLog(bot as AmethystBot, embed);
};
