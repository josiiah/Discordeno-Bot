import { bot } from "../../../bot.ts";
import { AmethystEmbed, highestRole } from "../../../deps.ts";
import { deconstruct, sendEmbed, sendResponse } from "../../helpers/helpers.ts";

bot.utils.createSlashCommand({
  name: "userinfo",
  description: "Fetch a user's info!",
  category: "Misc",
  options: [
    {
      name: "member",
      description: "The member to fetch info of",
      type: 6,
      required: false,
    },
  ],
  async execute(bot, data) {
    const member = data.data?.resolved?.members?.first() ?? data.member;
    const user = data.data?.resolved?.users?.first() ??
      bot.users.get(data.user.id) ??
      (await bot.helpers.getUser(data.user.id));
    if ((!member && data.guildId) || !user) {
      return sendResponse(
        bot,
        data,
        "There was an issue fetching that member.",
        true,
      );
    }
    const embed = new AmethystEmbed()
      .setTitle("UserInfo Command:")
      .addField("Username", user.username, true)
      .addField("Discriminator", `#${user.discriminator}`, true)
      .addField(
        "Bot?",
        `This member is${user.toggles.bot ? "" : " not"} a bot`,
        true,
      );
    if (data.guildId) {
      embed
        .addField("Nickname", member!.nick ?? "None", true)
        .addField(
          "Highest Role",
          `<@&${highestRole(bot, data.guildId!, user.id).id}>`,
        )
        .addField("Roles", `${member!.roles.length} Roles`, true)
        .addField(
          "Permissions",
          !bot.utils
              .calculatePermissions(member!.permissions ?? 0n)
              .includes("ADMINISTRATOR")
            ? bot.utils
              .calculatePermissions(member!.permissions ?? 0n)
              .sort()
              .map(
                (e) =>
                  `\`${
                    e
                      .toLowerCase()
                      .replaceAll("_", " ")
                      .replaceAll("guild", "server")
                  }\``,
              )
              .join(", ")
            : "`Administrator`",
        )
        .addField(
          "Boosting since",
          member!.premiumSince
            ? `This member was boosting since <t:${member!.premiumSince}:R>`
            : "This member is not boosting.",
        )
        .addField(
          "Created at",
          `This member was created <t:${deconstruct(user.id)}:R>`,
        )
        .setTimestamp()
        .setThumbnail(
          bot.helpers.avatarURL(user.id, user.discriminator, {
            avatar: user.avatar,
          }),
        );
    }
    //   .addField("Flags", )
    sendEmbed(bot, data, embed);
  },
});
