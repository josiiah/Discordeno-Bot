import { bot } from "../../../../bot.ts";

import { AmethystEmbed } from "../../../../deps.ts";

import {
  humanizeMilliseconds,
  sendEmbed,
  sendResponse,
  stringToMilliseconds,
} from "../../../helpers/helpers.ts";

bot.utils.createSlashSubcommandGroup("slowmode", {
  name: "channel",
  description: "Set the slowmode for the channel",
});

bot.utils.createSlashSubcommand("slowmode-channel", {
  name: "set",
  description: "Set the channel to send the goodbye messages",
  guildOnly: true,
  options: [
    {
      name: "duration",
      description: "The duration of the slowmode",
      type: 3,
      required: true,
    },
    {
      name: "channel",
      description:
        "The channel to set the slowmode at (defaults to current channel)",
      type: 7,
      required: true,
    },
  ],
  userGuildPermissions: ["MANAGE_CHANNELS"],
  botGuildPermissions: ["MANAGE_CHANNELS"],
  execute: async (bot, data) => {
    const duration = data.data?.options?.[0];
    if (!duration?.value || duration?.type != 3) return;
    const time = stringToMilliseconds(duration.value as string);
    if (!time) {
      return sendResponse(
        bot,
        data,
        "The argument has to be time literal (example: 2d3m6s)",
        true
      );
    }
    if (time > 1000 * 60 * 60 * 6) {
      return sendResponse(
        bot,
        data,
        "The slowmode duration can't be longer than 6 hours.",
        true
      );
    }
    const channel =
      bot.channels.get(
        bot.utils.snowflakeToBigint(
          (data.data?.options?.[1].value as string) ?? "0"
        )
      ) ??
      (await bot.helpers.getChannel(
        bot.utils.snowflakeToBigint(
          (data.data?.options?.[1].value as string) ?? "0"
        )
      ));
    bot.channels.get(data.channelId!)!;
    if (channel.rateLimitPerUser == Math.floor(time / 1000)) {
      return sendResponse(
        bot,
        data,
        "The slowmode duration can't be the same as the current one.",
        true
      );
    }
    bot.helpers.editChannel(channel.id, {
      rateLimitPerUser: Math.floor(time / 1000),
    });
    const embed = new AmethystEmbed()
      .setTitle("Slowmode Command")
      .setDescription(
        `Successfuly set the slowmode to \`${humanizeMilliseconds(
          time
        )}\` for <#${channel.id}>`
      )
      .setTimestamp();
    sendEmbed(bot, data, embed);
  },
});

bot.utils.createSlashSubcommand("slowmode-channel", {
  name: "remove",
  description: "Removes the slowmode for the channel",
  userGuildPermissions: ["MANAGE_CHANNELS"],
  options: [
    {
      name: "channel",
      description:
        "The channel to set the slowmode at (defaults to current channel)",
      type: 7,
      required: true,
    },
  ],
  execute: async (bot, data) => {
    if (!data.channelId) return;
    const channel =
      bot.channels.get(
        bot.utils.snowflakeToBigint(
          (data.data?.options?.[0].value as string) ?? "0"
        )
      ) ??
      (await bot.helpers.getChannel(
        bot.utils.snowflakeToBigint(
          (data.data?.options?.[1].value as string) ?? "0"
        )
      )) ??
      bot.channels.get(data.channelId)!;
    if (!channel.rateLimitPerUser) {
      return sendResponse(
        bot,
        data,
        "There's no slowmode set on this channel.",
        true
      );
    }
    bot.helpers.editChannel(data.channelId, { rateLimitPerUser: 0 });
    const embed = new AmethystEmbed()
      .setTitle("Slowmode Command")
      .setDescription(`Successfuly removed the slowmode from <#${channel.id}>`)
      .setTimestamp();
    sendEmbed(bot, data, embed);
  },
});
