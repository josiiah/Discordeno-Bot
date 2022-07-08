import { bot } from "../../../../bot.ts";
import { isHigherPosition, AmethystEmbed } from "../../../../deps.ts";
import { db } from "../../../database/database.ts";
import { sendEmbed, sendResponse } from "../../../helpers/helpers.ts";

bot.utils.createSlashSubcommandGroup("welcome", {
  name: "autorole",
  description: "Set the autorole for the server",
});

bot.utils.createSlashSubcommand("welcome-autorole", {
  name: "set",
  description: "Set the autorole for the server",
  guildOnly: true,
  options: [
    {
      name: "role",
      description: "The role to add to new members",
      type: 8,
      required: true,
    },
  ],
  userGuildPermissions: ["MANAGE_ROLES"],
  execute: async (bot, data) => {
    const role = data.data?.options?.[0].value;
    if (!role) return;
    if (
      isHigherPosition(
        bot,
        data.guildId!,
        bot.id,
        bot.utils.snowflakeToBigint(role as string)
      )
    )
      return sendResponse(
        bot,
        data,
        "I can't give new members this role since it has a higher position than me.",
        true
      );
    const { rows } = await db.queryArray(
      `SELECT role FROM welcome WHERE guild=$1`,
      [data.guildId!]
    );
    if (!rows.length)
      await db.queryArray(`INSERT INTO welcome (guild, role) VALUES ($1, $2)`, [
        data.guildId!,
        role,
      ]);
    else
      await db.queryArray(`UPDATE welcome SET role=$1 WHERE guild=$2`, [
        role,
        data.guildId,
      ]);
    const embed = new AmethystEmbed()
      .setTitle("Welcome Command")
      .setDescription(`Successfuly set the autorole to <@&${role}>`)
      .setTimestamp();
    sendEmbed(bot, data, embed);
  },
});

bot.utils.createSlashSubcommand("welcome-autorole", {
  name: "remove",
  description: "Removes the autorole for the server",
  guildOnly: true,
  userGuildPermissions: ["MANAGE_ROLES"],
  execute: async (bot, data) => {
    const { rows } = await db.queryObject<{
      guild: bigint;
      role?: bigint;
      channel?: bigint;
      message?: string;
    }>(`SELECT * FROM welcome WHERE guild=$1`, [data.guildId!]);
    if (!rows.length || !rows[0].role)
      return sendResponse(bot, data, "The autorole isn't set.", true);
    if (!rows[0].message && !rows[0].channel)
      await db.queryArray(`DELETE FROM welcome WHERE guild=$1 AND `, [
        data.guildId!,
      ]);
    else
      await db.queryArray(`UPDATE welcome SET role=NULL WHERE guild=$1`, [
        data.guildId,
      ]);
    const embed = new AmethystEmbed()
      .setTitle("Welcome Command")
      .setDescription(`Successfuly removed the autorole`)
      .setTimestamp();
    sendEmbed(bot, data, embed);
  },
});
