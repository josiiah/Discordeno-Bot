import { bot } from "../../../bot.ts";
import { AmethystEmbed, highestRole } from "../../../deps.ts";
import { sendEmbed, sendResponse } from "../../helpers/helpers.ts";

bot.utils.createSlashCommand({
  name: "removetimeout",
  description: "Remove a member's timeout.",
  category: "Moderation",
  guildOnly: true,
  options: [
    {
      name: "member",
      description: "The member to remove the timeout from.",
      required: true,
      type: 6,
    },
  ],
  botGuildPermissions: ["MODERATE_MEMBERS"],
  userGuildPermissions: ["MODERATE_MEMBERS"],
  execute: (bot, data) => {
    const member = data.data?.resolved?.members?.first();
    if (!member) return;
    if (member.id == data.user.id) {
      return sendResponse(bot, data, "You can't remove your own timeout.");
    }
    if (
      highestRole(bot, data.guildId!, data.user.id).position <=
        highestRole(bot, data.guildId!, member.id).position
    ) {
      return sendResponse(
        bot,
        data,
        "You can't remove that member's timeout since they have a higher role than you",
        true,
      );
    }
    if (
      highestRole(bot, data.guildId!, bot.id).position <=
        highestRole(bot, data.guildId!, member.id).position
    ) {
      return sendResponse(
        bot,
        data,
        "I can't remove this member's timeout since they have a higher role than me.",
        true,
      );
    }
    bot.helpers.editMember(data.guildId!, member.id, {
      communicationDisabledUntil: new Date() as unknown as number,
    });
    const embed = new AmethystEmbed()
      .setTitle("RemoveTimeout Command")
      .setDescription(`Successfuly removed the timeout for <@${member.id}>`)
      .setTimestamp();
    sendEmbed(bot, data, embed);
  },
});
