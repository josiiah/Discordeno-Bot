import { bot } from "../../../bot.ts";
import { AmethystEmbed } from "../../../deps.ts";
import { sendEmbed } from "../../helpers/helpers.ts";

bot.utils.createSlashCommand({
  name: "dog",
  description: "Get a random dog image!",
  category: "Fun",
  ownerOnly: false,
  async execute(bot, data) {
    if (!data.guildId) return;

    const res = await fetch("https://some-random-api.ml/animal/dog");
    const data2 = await res.json();

    const embed = new AmethystEmbed()
      .setTitle("Doggo :dog:")
      .setImage(data2.image)
      .setFooter("Powered by some-random-api");

    sendEmbed(bot, data, embed);
  },
});
