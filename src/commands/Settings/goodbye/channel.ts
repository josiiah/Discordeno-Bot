import { bot } from "../../../../bot.ts";
import {
  getMissingChannelPermissions,
  AmethystEmbed,
} from "../../../../deps.ts";
import { db } from "../../../database/database.ts";
import { sendEmbed, sendResponse } from "../../../helpers/helpers.ts";

bot.utils.createSlashSubcommandGroup("goodbye", {
  name: "channel",
  description: "Set the autorole for the server",
});

bot.utils.createSlashSubcommand("goodbye-channel", {
  name: "set",
  description: "Set the channel to send the goodbye messages",
  guildOnly: true,
  options: [
    {
      name: "channel",
      description: "The channel to send the message to",
      type: 7,
      required: true,
    },
  ],
  userGuildPermissions: ["MANAGE_CHANNELS"],
  execute: async (bot, data) => {
    const channel = data.data?.options?.[0].value as string;
    if (!channel) return;
    if (
      getMissingChannelPermissions(
        bot,
        bot.utils.snowflakeToBigint(channel),
        bot.id,
        ["SEND_MESSAGES"]
      )
    )
      return sendResponse(
        bot,
        data,
        "I can't send messages in that channel.",
        true
      );
    const { rows } = await db.queryArray(
      `SELECT channel FROM goodbye WHERE guild=$1`,
      [data.guildId!]
    );
    if (!rows.length)
      await db.queryArray(
        `INSERT INTO goodbye (guild, channel) VALUES ($1, $2)`,
        [data.guildId!, channel]
      );
    else
      await db.queryArray(`UPDATE goodbye SET channel=$1 WHERE guild=$2`, [
        channel,
        data.guildId,
      ]);
    const embed = new AmethystEmbed()
      .setTitle("Goodbye Command")
      .setDescription(`Successfuly set the goodbye channel to <#${channel}>`)
      .setTimestamp();
    sendEmbed(bot, data, embed);
  },
});

bot.utils.createSlashSubcommand("goodbye-channel", {
  name: "remove",
  description: "Removes the goodbye channel",
  userGuildPermissions: ["MANAGE_CHANNELS"],
  execute: async (bot, data) => {
    const { rows } = await db.queryObject<{
      guild: bigint;
      role?: bigint;
      channel?: bigint;
      message?: string;
    }>(`SELECT * FROM goodbye WHERE guild=$1`, [data.guildId!]);
    if (!rows.length || !rows[0].channel)
      return sendResponse(bot, data, "The goodbye channel isn't set.", true);
    if (!rows[0].message && !rows[0].role)
      await db.queryArray(`DELETE FROM goodbye WHERE guild=$1`, [
        data.guildId!,
      ]);
    else
      await db.queryArray(`UPDATE goodbye SET channel=NULL WHERE guild=$1`, [
        data.guildId,
      ]);
    const embed = new AmethystEmbed()
      .setTitle("Goodbye Command")
      .setDescription(`Successfuly removed the goodbye message`)
      .setTimestamp();
    sendEmbed(bot, data, embed);
  },
});
