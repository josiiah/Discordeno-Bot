import { bot } from "../../../bot.ts";
import { AmethystEmbed } from "../../../deps.ts";
import { sendEmbed } from "../../helpers/helpers.ts";

bot.utils.createSlashCommand({
  name: "purge",
  description: "Purge a channel's messages.",
  category: "Moderation",
  guildOnly: true,
  options: [
    {
      name: "amount",
      description: "amount of messages to delete (2-100)",
      type: 10,
      minValue: 2,
      maxValue: 100,
      required: true,
    },
  ],
  botGuildPermissions: ["MANAGE_MESSAGES"],
  userGuildPermissions: ["MANAGE_MESSAGES"],
  async execute(bot, data) {
    const option = data.data?.options?.[0];
    if (!option || option.type !== 10) return;
    const amount = option.value! as number;
    const messages = await bot.helpers.getMessages(data.channelId!, {
      limit: amount,
    });
    bot.helpers
      .deleteMessages(
        data.channelId!,
        messages.map((e) => e.id)
      )
      .catch(() => {});
    const embed = new AmethystEmbed()
      .setTitle("Purge Command")
      .setDescription(`Successfuly deleted ${messages.length} messages.`)
      .setTimestamp();
    sendEmbed(bot, data, embed);
  },
});
