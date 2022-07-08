import { bot } from "../../../bot.ts";
import { AmethystEmbed, highestRole } from "../../../deps.ts";
import { sendEmbed, sendResponse } from "../../helpers/helpers.ts";

bot.utils.createSlashCommand({
  name: "ban",
  description: "Bans a member while deleting messages",
  category: "Moderation",
  guildOnly: true,
  options: [
    {
      name: "member",
      description: "The member to softban",
      required: true,
      type: 6,
    },
    {
      name: "messageage",
      description: "The max age of the messages that's gonna be deleted.",
      type: 4,
      required: false,
      minValue: 1,
      maxValue: 7,
    },
    {
      name: "reason",
      description: "The reason for the softban",
      type: 3,
      required: false,
    },
  ],
  execute(bot, data) {
    const member = data.data?.options?.[0].value as string;
    if (!member) return;
    const days =
      data.data?.options?.[1].type == 4
        ? (data.data?.options?.[1].value as number)
        : 7;
    const reason =
      (data.data?.options?.find((e) => e.type == 3)?.value as string) ||
      "No Reason.";
    if (
      highestRole(bot, data.guildId!, data.user.id).position <=
      highestRole(bot, data.guildId!, bot.utils.snowflakeToBigint(member))
        .position
    ) {
      return sendResponse(
        bot,
        data,
        "I can't ban this member since they have a higher role than you."
      );
    }
    if (
      highestRole(bot, data.guildId!, bot.id).position <=
      highestRole(bot, data.guildId!, bot.utils.snowflakeToBigint(member))
        .position
    ) {
      return sendResponse(
        bot,
        data,
        "I can't ban this member since they have a higher role than me."
      );
    }
    bot.helpers.banMember(data.guildId!, bot.utils.snowflakeToBigint(member), {
      deleteMessageDays: days as 1 | 2 | 3 | 4 | 5 | 6 | 7,
      reason,
    });
    const embed = new AmethystEmbed()
      .setTitle("Ban Command")
      .setDescription(
        `Successfuly banned <@${bot.utils.snowflakeToBigint(
          member
        )}> while deleting messages that are younger than ${days} days.`
      )
      .setTimestamp();
    sendEmbed(bot, data, embed);
  },
});
