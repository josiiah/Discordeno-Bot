import { AmethystEmbed } from "../../../deps.ts";
import { bot } from "../../../bot.ts";
import { sendEmbed } from "../../helpers/helpers.ts";

bot.utils.createSlashCommand({
  name: "meme",
  description: "Get a random meme!",
  category: "Fun",
  ownerOnly: false,
  async execute(bot, data) {
    if (!data.guildId) return;

    const res = await fetch("https://some-random-api.ml/meme");
    const data2 = await res.json();

    const embed = new AmethystEmbed()
      .setTitle(data2.caption || "Meme")
      .setImage(data2.image)
      .setFooter("Powered by some-random-api");

    sendEmbed(bot, data, embed);
  },
});
