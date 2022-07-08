import { startedAt } from "../../events/mod.ts";
import { AmethystEmbed } from "../../../deps.ts";
import { humanizeMilliseconds, sendEmbed } from "../../helpers/helpers.ts";
import { bot } from "../../../bot.ts";

bot.utils.createSlashCommand({
  name: "uptime",
  description: "Know how much the bot was up for",
  category: "Misc",
  execute(bot, data) {
    const embed = new AmethystEmbed()
      .setTitle("Uptime")
      .setDescription(
        `
Bot was up for \`${humanizeMilliseconds(Date.now() - startedAt)}\`
Started at <t:${Math.floor(startedAt / 1000)}:f>
        `,
      )
      .setTimestamp();
    sendEmbed(bot, data, embed);
  },
});
