import {
  AmethystBot,
  AmethystEmbed,
  BotWithCache,
  getMissingGuildPermissions,
  isHigherPosition,
  User,
} from "../../deps.ts";
import { db } from "../database/database.ts";
import { modlog } from "../helpers/helpers.ts";
import { events } from "./mod.ts";

events.guildMemberAdd = async (rawBot, member, user) => {
  const bot = rawBot as BotWithCache;
  const { rows } = await db.queryObject<{
    guild: bigint;
    toggle: boolean;
    role: bigint;
    channel: bigint;
    message: string;
  }>(`SELECT * FROM welcome WHERE guild = $1`, [member.guildId]);
  if (!rows.length || !rows[0].toggle) return;
  if (
    rows[0].role &&
    bot.guilds.get(member.guildId)?.roles.has(rows[0].role) &&
    !isHigherPosition(bot, member.guildId, member.id, rows[0].role) &&
    !getMissingGuildPermissions(bot, member.guildId, bot.id, ["MANAGE_ROLES"])
      .length
  ) {
    bot.helpers.addRole(member.guildId, member.id, rows[0].role);
  }
  if (
    !rows[0].message ||
    !(rows[0].channel && bot.channels.has(rows[0].channel))
  ) {
    return;
  }
  bot.helpers.sendMessage(rows[0].channel, {
    content: replaceVariables(bot, rows[0].message, member.guildId, user),
  });
};

events.guildMemberRemove = (rawBot, user, guildId) => {
  HandleGoodbyeMessage(rawBot as AmethystBot, user, guildId);
  handleMemberKick(rawBot as AmethystBot, user, guildId);
};

async function handleMemberKick(bot: AmethystBot, user: User, guildId: bigint) {
  const audit = await bot.helpers.getAuditLogs(guildId, { actionType: 20 });
  const entry = audit.auditLogEntries[0];
  if (entry.userId === bot.id || entry.targetId !== user.id) return;
  const embed = new AmethystEmbed()
    .setTitle("Member Kicked")
    .setDescription(
      `
Kicked By: <@${entry.userId}>
Kicked Member: <@${user.id}>
Reason:\`\`\`
${entry.reason ?? "No Reason."}
\`\`\`
  `
    )
    .setTimestamp();
  modlog(bot, guildId, embed);
}

function replaceVariables(
  bot: BotWithCache,
  str: string,
  guildId: bigint,
  user: User
) {
  return str
    .replaceAll("{member}", user.username)
    .replaceAll("{user}", user.username)
    .replaceAll("{tag}", `${user.username}#${user.discriminator}`)
    .replaceAll("{mention}", `<@${user.id}>`)
    .replaceAll(
      "{membercount}",
      (bot.guilds.get(guildId)!.approximateMemberCount ||
        bot.guilds.get(guildId)!.memberCount)!.toString()
    )
    .replaceAll(
      "{usercount}",
      (bot.guilds.get(guildId)!.approximateMemberCount ||
        bot.guilds.get(guildId)!.memberCount)!.toString()
    )
    .replaceAll("{server}", bot.guilds.get(guildId)!.name!)
    .replaceAll("{guild}", bot.guilds.get(guildId)!.name!);
}

async function HandleGoodbyeMessage(
  bot: AmethystBot,
  user: User,
  guildId: bigint
) {
  const { rows } = await db.queryObject<{
    guild: bigint;
    toggle: boolean;
    channel: bigint;
    message: string;
  }>(`SELECT * FROM goodbye WHERE guild = $1`, [guildId]);
  if (!rows.length || !rows[0].toggle) return;
  if (
    !rows[0].message ||
    !(rows[0].channel && bot.channels.has(rows[0].channel))
  ) {
    return;
  }
  bot.helpers.sendMessage(rows[0].channel, {
    content: replaceVariables(bot, rows[0].message, guildId, user),
  });
}
