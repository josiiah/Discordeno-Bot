import { bot } from "../../../../bot.ts";
import {
  getMissingChannelPermissions,
  AmethystEmbed,
} from "../../../../deps.ts";
import { db } from "../../../database/database.ts";
import { sendEmbed, sendResponse } from "../../../helpers/helpers.ts";

bot.utils.createSlashSubcommandGroup("welcome", {
  name: "channel",
  description: "Set the autorole for the server",
});

bot.utils.createSlashSubcommand("welcome-channel", {
  name: "set",
  description: "Set the channel to send the welcome messages",
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
        "I can't send messages to that channel.",
        true
      );
    const { rows } = await db.queryArray(
      `SELECT channel FROM welcome WHERE guild=$1`,
      [data.guildId!]
    );
    if (!rows.length)
      await db.queryArray(
        `INSERT INTO welcome (guild, channel) VALUES ($1, $2)`,
        [data.guildId!, channel]
      );
    else
      await db.queryArray(`UPDATE welcome SET channel=$1 WHERE guild=$2`, [
        channel,
        data.guildId,
      ]);
    const embed = new AmethystEmbed()
      .setTitle("Welcome Command")
      .setDescription(`Successfuly set the welcome channel to <#${channel}>`)
      .setTimestamp();
    sendEmbed(bot, data, embed);
  },
});

bot.utils.createSlashSubcommand("welcome-channel", {
  name: "remove",
  description: "Removes the welcome channel",
  guildOnly: true,
  userGuildPermissions: ["MANAGE_CHANNELS"],
  execute: async (bot, data) => {
    const { rows } = await db.queryObject<{
      guild: bigint;
      role?: bigint;
      channel?: bigint;
      message?: string;
    }>(`SELECT * FROM welcome WHERE guild=$1`, [data.guildId!]);
    if (!rows.length || !rows[0].channel)
      return sendResponse(bot, data, "The welcome channel isn't set.", true);
    if (!rows[0].message && !rows[0].role)
      await db.queryArray(`DELETE FROM welcome WHERE guild=$1`, [
        data.guildId!,
      ]);
    else
      await db.queryArray(`UPDATE welcome SET channel=NULL WHERE guild=$1`, [
        data.guildId,
      ]);
    const embed = new AmethystEmbed()
      .setTitle("Welcome Command")
      .setDescription(`Successfuly removed the welcome message`)
      .setTimestamp();
    sendEmbed(bot, data, embed);
  },
});
