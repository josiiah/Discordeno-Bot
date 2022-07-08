import { db } from "../../../database/database.ts";
import { AmethystEmbed } from "../../../../deps.ts";
import { sendEmbed, sendResponse } from "../../../helpers/helpers.ts";
import { bot } from "../../../../bot.ts";

bot.utils.createSlashSubcommandGroup("welcome", {
  name: "message",
  description: "Set the welcome message for the server",
});

bot.utils.createSlashSubcommand("welcome-message", {
  name: "set",
  description: "Set the message to send the welcome channel",
  guildOnly: true,
  options: [
    {
      name: "message",
      description: "The message to send.",
      type: 3,
      required: true,
    },
  ],
  userGuildPermissions: ["MANAGE_MESSAGES"],
  execute: async (bot, data) => {
    const message = data.data?.options?.[0].value;
    if (!message) return;
    const { rows } = await db.queryArray(
      `SELECT message FROM welcome WHERE guild=$1`,
      [data.guildId!]
    );
    if (!rows.length)
      await db.queryArray(
        `INSERT INTO welcome (guild, message) VALUES ($1, $2)`,
        [data.guildId!, message]
      );
    else
      await db.queryArray(`UPDATE welcome SET message=$1 WHERE guild=$2`, [
        message,
        data.guildId,
      ]);
    const embed = new AmethystEmbed()
      .setTitle("Welcome Command")
      .setDescription(`Successfuly set the welcome message`)
      .setTimestamp();
    sendEmbed(bot, data, embed);
  },
});

bot.utils.createSlashSubcommand("welcome-message", {
  name: "remove",
  description: "Removes the welcome message",
  guildOnly: true,
  userGuildPermissions: ["MANAGE_MESSAGES"],
  execute: async (bot, data) => {
    const { rows } = await db.queryObject<{
      guild: bigint;
      role?: bigint;
      channel?: bigint;
      message?: string;
    }>(`SELECT * FROM welcome WHERE guild=$1`, [data.guildId!]);
    if (!rows.length || !rows[0].message)
      return sendResponse(bot, data, "The welcome message isn't set.", true);
    if (!rows[0].channel && !rows[0].role)
      await db.queryArray(`DELETE FROM welcome WHERE guild=$1`, [
        data.guildId!,
      ]);
    else
      await db.queryArray(`UPDATE welcome SET message=NULL WHERE guild=$1`, [
        data.guildId,
      ]);
    const embed = new AmethystEmbed()
      .setTitle("Welcome Command")
      .setDescription(`Successfuly removed the welcome message`)
      .setTimestamp();
    sendEmbed(bot, data, embed);
  },
});

bot.utils.createSlashSubcommand("welcome-message", {
  name: "variables",
  description: "Shows a list of variables that can be used.",
  guildOnly: true,
  execute: (bot, data) => {
    const embed = new AmethystEmbed()
      .setTitle("Welcome Command")
      .addField(
        "Variables:",
        `
\`{member}\`/\`{user}\` -> the new member's username
\`{mention}\` -> mentions the member that joined
\`{tag}\` -> the member's tag
\`{membercount}\`/\`{usercount}\` -> the new amount of members after they joined
\`{server}\`/\`{guild}\` -> the server's name 
      `
      )
      .setTimestamp();
    sendEmbed(bot, data, embed);
  },
});
