import { AmethystBot, AmethystEmbed } from "../../deps.ts";
import { modlog } from "../helpers/helpers.ts";
import { events } from "./mod.ts";

events.guildBanAdd = async (bot, user, guildId) => {
  const audit = await bot.helpers.getAuditLogs(guildId, { actionType: 22 });
  const entry = audit.auditLogEntries[0];
  if (entry.userId === bot.id || entry.targetId !== user.id) return;
  const embed = new AmethystEmbed()
    .setTitle("Member Banned")
    .setDescription(
      `
Banned By: <@${entry.userId}>
Banned Member: <@${user.id}>
Reason:\`\`\`
${entry.reason ?? "No Reason."}
\`\`\`
`
    )
    .setTimestamp();
  modlog(bot as AmethystBot, guildId, embed);
};
events.guildBanRemove = async (bot, user, guildId) => {
  const audit = await bot.helpers.getAuditLogs(guildId, { actionType: 23 });
  const entry = audit.auditLogEntries[0];
  if (entry.userId === bot.id || entry.targetId !== user.id) return;
  const embed = new AmethystEmbed()
    .setTitle("Member Unbanned")
    .setDescription(
      `
Unbanned By: <@${entry.userId}>
Unbanned Member: <@${user.id}>
Reason:\`\`\`
${entry.reason ?? "No Reason."}
\`\`\`
`
    )
    .setTimestamp();
  modlog(bot as AmethystBot, guildId, embed);
};
