import { bot } from "../../../bot.ts";
import { AmethystEmbed } from "../../../deps.ts";
import { sendEmbed } from "../../helpers/helpers.ts";

bot.utils.createSlashCommand({
  name: "unlock",
  description: "Unlocks down a channel",
  category: "Moderation",
  scope: "guild",
  options: [
    {
      name: "channel",
      description: "The channel to lockdown",
      type: 7,
      required: true,
    },
  ],
  execute(bot, data) {
    const channel = data.data?.options?.[0].value as string;
    if (!channel) return;

    bot.helpers.editChannel(bot.utils.snowflakeToBigint(channel), {
      permissionOverwrites: [
        {
          id: data.guildId!,
          allow: ["SEND_MESSAGES"],
          type: 1,
        },
      ],
    });
    const embed = new AmethystEmbed()
      .setTitle("Unlocked")
      .setDescription(
        `Channel unlocked (<#${bot.utils.snowflakeToBigint(channel)}>)`
      )
      .setTimestamp();
    sendEmbed(bot, data, embed);
  },
});
