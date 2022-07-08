import { db } from "../../../database/database.ts";
import { AmethystEmbed } from "../../../../deps.ts";
import { sendEmbed } from "../../../helpers/helpers.ts";
import { bot } from "../../../../bot.ts";

bot.utils.createSlashSubcommand("goodbye", {
  name: "toggle",
  description: "Toggle the goodbye message.",
  guildOnly: true,
  userGuildPermissions: ["MANAGE_GUILD"],
  async execute(bot, data) {
    const { rows } = await db.queryObject<{ toggle: boolean }>(
      "SELECT toggle FROM goodbye WHERE guild=$1",
      [data.guildId!]
    );
    if (!rows.length)
      await db.queryArray(
        `INSERT INTO goodbye (guild, toggle) VALUES ($1, TRUE)`,
        [data.guildId!]
      );
    else if (!rows[0].toggle)
      await db.queryArray(`UPDATE goodbye SET toggle=TRUE WHERE guild=$1`, [
        data.guildId!,
      ]);
    else
      await db.queryArray(`UPDATE goodbye SET toggle=FALSE WHERE guild=$1`, [
        data.guildId!,
      ]);
    const embed = new AmethystEmbed()
      .setTitle("Goodbye Command")
      .setDescription(
        `Successfuly toggled goodbye configuration to \`${
          rows?.[0]?.toggle ? "Off" : "On"
        }\``
      )
      .setTimestamp();
    sendEmbed(bot, data, embed);
  },
});
