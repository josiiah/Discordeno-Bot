import { bot } from "../../../../bot.ts";

import { AmethystEmbed, Components } from "../../../../deps.ts";
import { db } from "../../../database/database.ts";

import { sendEmbed, sendResponse } from "../../../helpers/helpers.ts";

bot.utils.createSlashSubcommand("warn", {
  name: "create",
  description: "Warn a member",
  options: [
    {
      name: "member",
      description: "The member to warn",
      required: true,
      type: 6,
    },
    {
      type: 3,
      name: "reason",
      description: "The reason of the warn.",
      required: true,
    },
  ],
  userGuildPermissions: ["MANAGE_CHANNELS"],
  botGuildPermissions: ["MANAGE_CHANNELS"],
  execute: async (bot, data) => {
    const member = data.data?.options?.[0].value as string;
    if (!member) return;

    const reason =
      (data.data?.options?.find((e) => e.type == 3)?.value as string) ||
      "No Reason.";

    const { rows } = await db.queryObject(
      `SELECT * FROM warns WHERE guild=$1 AND userId=$2`,
      [data.guildId!, bot.utils.snowflakeToBigint(member)]
    );

    await db.queryArray(
      `INSERT INTO warns (guild, userId, modId, message, warnId) VALUES ($1, $2, $3, $4, $5)`,
      [
        data.guildId!,
        bot.utils.snowflakeToBigint(member),
        data.user.id,
        reason,
        rows.length + 1,
      ]
    );

    const embed = new AmethystEmbed()
      .setTitle("Warn Command")
      .addField("User", `<@${member}>`, true)
      .addField("Reason", reason, true)
      .addField("Moderator", `<@${data.user.id}>`, true)
      .setFooter(`Warn ${rows.length + 1}`)
      .setTimestamp();
    sendEmbed(bot, data, embed);
  },
});

bot.utils.createSlashSubcommand("warn", {
  name: "view",
  description: "View the user's warns",
  options: [
    {
      name: "member",
      description: "The member to softban",
      required: true,
      type: 6,
    },
  ],
  userGuildPermissions: ["MANAGE_CHANNELS"],
  botGuildPermissions: ["MANAGE_CHANNELS"],
  execute: async (bot, data) => {
    const member = data.data?.options?.[0].value as string;
    if (!member) return;

    const { rows } = await db.queryObject<{
      userId: bigint;
      message: string;
      modId: bigint;
      createdAt: number;
      warnId: number;
    }>(
      `SELECT userId, message, modId, createdAt, warnId FROM warn WHERE guild=$1 AND userId=$2`,
      [data.guildId!, bot.utils.snowflakeToBigint(member)]
    );

    if (!rows.length) return sendResponse(bot, data, "No warns found.");
    const embed = new AmethystEmbed()
      .setTitle("Warn Command")
      .addField("User", `<@${member}>`, true)
      .addField("Reason", rows[0].message, true)
      .addField("Moderator", `<@${rows[0].modId}>`, true)
      .setFooter(`Warn 1`)
      .setTimestamp();
    const components = new Components()
      .addButton("", "Primary", "first", { emoji: "⏪" })
      .addButton("", "Primary", "before", { emoji: "⬅️" })
      .addButton("", "Primary", "next", { emoji: "➡️" })
      .addButton("", "Primary", "last", { emoji: "⏩" });
    await sendEmbed(bot, data, embed, { components });
    const msg = await bot.helpers.getOriginalInteractionResponse(data.token);
    let current = 1;
    do {
      const button = await bot.utils.awaitComponent(msg.id, {
        filter: (_, interaction) => data.user.id === interaction.user.id,
        type: "Button",
      });
      switch (button.data?.customId) {
        case "first":
          current = 1;
          break;
        case "before":
          if (current == 1) break;
          else if (current < 1) current = 1;
          else current--;
          break;
        case "next":
          if (current == rows.sort((a, b) => b.warnId - a.warnId)[0].warnId) {
            break;
          }
          current++;
          break;
        case "last":
          current = rows.sort((a, b) => b.warnId - a.warnId)[0].warnId;
          break;
      }
      const note = rows.sort((a, b) => b.warnId - a.warnId)[current - 1];
      embed.fields = [];
      embed
        .addField("User", `<@${member}>`)
        .addField("Reason", note.message, true)
        .addField("Moderator", `<@${note.modId}>`, true)
        .setFooter(`Warn ${note.warnId}`);
      bot.helpers.editInteractionResponse(data.token, { embeds: [embed] });
    } while (bot.componentCollectors.find((e) => e.key === msg.id));
  },
});
