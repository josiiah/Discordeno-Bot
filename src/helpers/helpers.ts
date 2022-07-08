import {
  AmethystEmbed,
  AmethystBot,
  Guild,
  highestRole,
  Interaction,
  InteractionApplicationCommandCallbackData,
  Member,
} from "../../deps.ts";

import { config } from "../../config.ts";

import { db } from "../database/database.ts";

export async function modlog(
  bot: AmethystBot,
  guildId: bigint,
  embed: AmethystEmbed
) {
  const { rows } = await db.queryObject<{ channel: bigint }>(
    `SELECT * FROM modlogs WHERE guild=$1 AND toggle=TRUE`,
    [guildId]
  );
  if (!rows.length) return;
  const channelId = rows[0].channel;
  bot.helpers.sendMessage(channelId, { embeds: [embed] });
}

export function serverBotLog(bot: AmethystBot, embed: AmethystEmbed) {
  const channelId = config.channelLogs;
  if (!channelId) return;

  bot.helpers.sendMessage(bot.utils.snowflakeToBigint(channelId), {
    embeds: [embed],
  });
}

export async function sendResponse(
  bot: AmethystBot,
  data: Interaction,
  content: InteractionApplicationCommandCallbackData | string,
  _Private = false
) {
  return await bot.helpers
    .sendInteractionResponse(data.id, data.token, {
      type: 4,

      data: typeof content === "string" ? { content: content } : content,
    })
    .catch(console.error);
}

export function getMemberInfo(bot: AmethystBot, id: bigint) {
  return bot.members.get(id);
}

export function capitalize(str: string) {
  return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

export function deconstruct(snowflake: bigint) {
  return Math.floor((Number(snowflake) / 4194304 + 1420070400000) / 1000);
}

export function roleHierarchy(
  bot: AmethystBot,
  guild: Guild | bigint,
  member1: Member | bigint,
  member2: Member | bigint
) {
  const highestRole1 = highestRole(bot, guild, member1);
  const highestRole2 = highestRole(bot, guild, member2);
  return highestRole1.position > highestRole2.position;
}

export async function sendEmbed(
  bot: AmethystBot,
  data: Interaction,
  embed: AmethystEmbed,
  content?: InteractionApplicationCommandCallbackData | string,
  Private = false
) {
  return await sendResponse(
    bot,
    data,
    {
      ...(typeof content === "object" ? content : { content }),
      embeds: [embed],
    },
    Private
  );
}

export function stringToMilliseconds(text: string) {
  const matches = text.match(/(\d+[w|d|h|m|s]{1})/g);
  if (!matches) return;

  let total = 0;

  for (const match of matches) {
    // Finds the first of these letters
    const validMatch = /(w|d|h|m|s)/.exec(match);
    // if none of them were found cancel
    if (!validMatch) return;
    // Get the number which should be before the index of that match
    const number = match.substring(0, validMatch.index);
    // Get the letter that was found
    const [letter] = validMatch;
    if (!number || !letter) return;

    let multiplier = 1000;
    switch (letter.toLowerCase()) {
      case `w`:
        multiplier = 1000 * 60 * 60 * 24 * 7;
        break;
      case `d`:
        multiplier = 1000 * 60 * 60 * 24;
        break;
      case `h`:
        multiplier = 1000 * 60 * 60;
        break;
      case `m`:
        multiplier = 1000 * 60;
        break;
    }

    const amount = number ? parseInt(number, 10) : undefined;
    if (!amount) return;

    total += amount * multiplier;
  }

  return total;
}

export function humanizeMilliseconds(milliseconds: number) {
  // Gets ms into seconds
  const time = milliseconds / 1000;
  if (time < 1) return "1 second(s) ";

  const days = Math.floor(time / 86400);
  const hours = Math.floor((time % 86400) / 3600);
  const minutes = Math.floor(((time % 86400) % 3600) / 60);
  const seconds = Math.floor(((time % 86400) % 3600) % 60);

  const dayString = days ? `${days} day(s) ` : "";
  const hourString = hours ? `${hours} hour(s) ` : "";
  const minuteString = minutes ? `${minutes} minute(s) ` : "";
  const secondString = seconds ? `${seconds} second(s) ` : "";

  return `${dayString}${hourString}${minuteString}${secondString}`.slice(0, -1);
}
