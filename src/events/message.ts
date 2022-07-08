import { AmethystBot, AmethystEmbed } from "../../deps.ts";
import { modlog } from "../helpers/helpers.ts";
import { events } from "./mod.ts";

events.messageDelete = (rawbot, _, message) => {
  if (!message?.guildId || !message.content) return;
  const bot = rawbot as AmethystBot;
  const embed = new AmethystEmbed()
    .setTitle(`Message Deleted`)
    .setDescription(
      `
Message Author: <@${message.authorId}>

Content Channel: <#${message.channelId}>

Deleted Message:\`\`\`
${message.content}
\`\`\`
`
    )
    .setTimestamp();
  modlog(bot as AmethystBot, message.guildId, embed);
};

events.messageUpdate = (rawbot, oldMessage, newMessage) => {
  if (
    !newMessage?.guildId ||
    !newMessage?.content ||
    !oldMessage.content ||
    newMessage?.content === oldMessage.content
  )
    return;
  const bot = rawbot as AmethystBot;

  const embed = new AmethystEmbed()
    .setTitle(`Message Deleted In #${bot}`)
    .setDescription(
      `
Message Author: <@${oldMessage.authorId}>

Old Content:\`\`\`
${oldMessage.content}
\`\`\`

New Content:\`\`\`
${newMessage?.content}
\`\`\`
`
    )
    .setTimestamp();
  modlog(bot as AmethystBot, newMessage.guildId, embed);
};
