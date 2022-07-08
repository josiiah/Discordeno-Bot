import { AmethystEmbed } from "../../../deps.ts";
import { bot } from "../../../bot.ts";
import { deconstruct, sendEmbed } from "../../helpers/helpers.ts";

bot.utils.createSlashCommand({
  name: "guildinfo",
  guildOnly: true,
  description: "Fetches the server's information",
  category: "Misc",
  async execute(bot, data) {
    if (!data.guildId) return;
    const guild = bot.guilds.get(data.guildId) ??
      (await bot.helpers.getGuild(data.guildId));
    const embed = new AmethystEmbed()
      .setTitle("Server Information")
      .addField("Server Name", `${guild.name}`, true)
      .addField("Server Owner", `<@${guild.ownerId}>`, true)
      .addField("Boost Level", `level ${guild?.premiumSubscriptionCount}`, true)
      .addField("NSFW Level", `level ${guild.nsfwLevel}`, true)
      .addField(
        "Verification Level",
        ["None", "Low", "Medium", "High", "Very High"][guild.verificationLevel],
        true,
      )
      .addField(
        "AFK Channel",
        guild.afkChannelId ? `<#${guild.afkChannelId}>` : "None",
        true,
      )
      .addField("Member Count", `${guild.approximateMemberCount} members`, true)
      .addField("Role Count", `${guild.roles.size} roles`, true)
      .addField(
        "Channel Count",
        `${
          bot.channels.filter((e) =>
            Boolean(e.guildId && e.guildId === guild.id)
          ).size
        } channels`,
        true,
      )
      .addField(
        "Created At",
        `This server was created at <t:${deconstruct(guild?.id!)}:R>`,
      );
    if (bot.helpers.guildIconURL(guild.id, guild.icon)) {
      embed.setThumbnail(bot.helpers.guildIconURL(guild.id, guild.icon)!);
    }
    if (bot.helpers.guildSplashURL(guild.id, guild.splash)) {
      embed.setImage(bot.helpers.guildSplashURL(guild.id, guild.splash)!);
    }
    sendEmbed(bot, data, embed);
  },
});
