import { bot } from "../../../../bot.ts";

import { AmethystEmbed, Components } from "../../../../deps.ts";
import { db } from "../../../database/database.ts";

import { sendEmbed, sendResponse } from "../../../helpers/helpers.ts";

bot.utils.createSlashSubcommand("note", {
  name: "add",
  description: "Create a note on a user",
  options: [
    {
      name: "member",
      description: "The member to softban",
      required: true,
      type: 6,
    },
    {
      type: 3,
      name: "note",
      description: "The note about the user.",
      required: true,
    },
  ],
  userGuildPermissions: ["MANAGE_CHANNELS"],
  botGuildPermissions: ["MANAGE_CHANNELS"],
  execute: async (bot, data) => {
    const member = data.data?.options?.[0].value as string;
    if (!member) return;

    const note =
      (data.data?.options?.find((e) => e.type == 3)?.value as string) ||
      "No note added.";

    const { rows } = await db.queryObject(
      `SELECT * FROM note WHERE guild=$1 AND userId=$2`,
      [data.guildId!, bot.utils.snowflakeToBigint(member)]
    );
    await db.queryArray(
      `INSERT INTO note (guild, userId, modId, message, noteId) VALUES ($1, $2, $3, $4, $5)`,
      [
        data.guildId!,
        bot.utils.snowflakeToBigint(member),
        data.user.id,
        note,
        rows.length + 1,
      ]
    );

    const embed = new AmethystEmbed()
      .setTitle("Note Command")
      .addField("User", `<@${member}>`, true)
      .addField("Note", note, true)
      .addField("Moderator", `<@${data.user.id}>`, true)
      .setTimestamp();
    sendEmbed(bot, data, embed);
  },
});

bot.utils.createSlashSubcommand("note", {
  name: "view",
  description: "View the user's notes",
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
      message: string;
      modid: bigint;
      noteid: number;
    }>(`SELECT message, modId, noteId FROM note WHERE guild=$1 AND userId=$2`, [
      data.guildId!,
      bot.utils.snowflakeToBigint(member),
    ]);

    if (!rows.length) return sendResponse(bot, data, "No notes found.");
    const embed = new AmethystEmbed()
      .setTitle("Note Command")
      .addField("User", `<@${member}>`, true)
      .addField("Note", rows[0].message, true)
      .addField("Moderator", `<@${rows[0].modid}>`, true)
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
          if (current == rows.sort((a, b) => b.noteid - a.noteid)[0].noteid) {
            break;
          }
          current++;
          break;
        case "last":
          current = rows.sort((a, b) => b.noteid - a.noteid)[0].noteid;
          break;
      }
      const note = rows.sort((a, b) => b.noteid - a.noteid)[current - 1];
      embed.fields = [];
      embed
        .addField("User", `<@${member}>`, true)
        .addField("Note", note.message, true)
        .addField("Moderator", `<@${note.modid}>`, true);
      bot.helpers.sendInteractionResponse(button.id, button.token, {
        type: 7,
        data: { embeds: [embed] },
      });
    } while (bot.componentCollectors.find((e) => e.key === msg.id));
  },
});
