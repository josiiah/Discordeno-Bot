import { bot } from "../../../bot.ts";
import { AmethystEmbed } from "../../../deps.ts";
import { sendEmbed } from "../../helpers/helpers.ts";

bot.utils.createSlashCommand({
  name: "cat",
  description: "Get a random cat image!",
  category: "Fun",
  ownerOnly: false,
  async execute(bot, data) {
    if (!data.guildId) return;

    const res = await fetch("https://some-random-api.ml/animal/cat");
    const data2 = await res.json();

    const embed = new AmethystEmbed()
      .setTitle("Cat :cat:")
      .setImage(data2.image)
      .setFooter("Powered by some-random-api");

    sendEmbed(bot, data, embed);
  },
});
