import { bot } from "../../../bot.ts";
import { AmethystEmbed, highestRole } from "../../../deps.ts";
import {
  humanizeMilliseconds,
  sendEmbed,
  sendResponse,
  stringToMilliseconds,
} from "../../helpers/helpers.ts";

bot.utils.createSlashCommand({
  name: "timeout",
  description: "Put a member into timeout.",
  category: "Moderation",
  guildOnly: true,
  options: [
    {
      name: "member",
      description: "The member to put in a timeout.",
      required: true,
      type: 6,
    },
    {
      name: "duration",
      description: "The duration of the timeout.",
      required: true,
      type: 3,
    },
  ],
  botGuildPermissions: ["MODERATE_MEMBERS"],
  userGuildPermissions: ["MODERATE_MEMBERS"],
  execute: (bot, data) => {
    const duration = data.data?.options?.[1];
    const member = data.data?.resolved?.members?.first();
    if (!duration?.value || duration?.type != 3 || !member) return;
    if (member.id == data.user.id) {
      return sendResponse(bot, data, "You can't put yourself on a timeout.");
    }
    if (
      highestRole(bot, data.guildId!, data.user.id).position <=
        highestRole(bot, data.guildId!, member.id).position
    ) {
      return sendResponse(
        bot,
        data,
        "You can't put that member on a timeout since they have a higher role than you",
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
        "I can't timeout this member since they have a higher role than me.",
        true,
      );
    }
    if (
      bot.utils
        .calculatePermissions(member.permissions ?? 0n)
        .includes("ADMINISTRATOR")
    ) {
      return sendResponse(
        bot,
        data,
        "I can't put this member in a timeout since they have the `administrator` permission.",
        true,
      );
    }
    const time = stringToMilliseconds(duration.value as string);
    if (!time) {
      return sendResponse(
        bot,
        data,
        "The argument has to be time literal (example: 2d3m6s)",
      );
    }
    if (time > 1000 * 60 * 60 * 24 * 28) {
      return sendResponse(
        bot,
        data,
        "The timeout duration has to be shorter than 28 days.",
        true,
      );
    }
    bot.helpers.editMember(data.guildId!, member.id, {
      communicationDisabledUntil: new Date(
        Date.now() + time,
      ) as unknown as number,
    });
    const embed = new AmethystEmbed()
      .setTitle("Timeout Command")
      .setDescription(
        `Successfuly put <@${member.id}> on a timeout for ${
          humanizeMilliseconds(time)
        }`,
      )
      .setTimestamp();
    sendEmbed(bot, data, embed);
  },
});
