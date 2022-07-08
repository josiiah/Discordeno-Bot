import { bot } from "../../../bot.ts";
import { AmethystEmbed } from "../../../deps.ts";
import { sendEmbed } from "../../helpers/helpers.ts";

bot.utils.createSlashCommand({
  name: "uncancer",
  description: "Makes a user's nickname typeable",
  category: "Moderation",
  guildOnly: true,
  scope: "guild",
  userChannelPermissions: ["MANAGE_NICKNAMES"],
  botChannelPermissions: ["MANAGE_NICKNAMES"],
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

    bot.helpers.editMember(data.guildId!, member.id, {
      nick: getRandomString(6),
    });

    const embed = new AmethystEmbed()
      .setTitle("Nickname Changed")
      .setDescription(
        `Successfully made the <@${member.id}>'s nickname typeable`
      )
      .setTimestamp();
    sendEmbed(bot, data, embed);
  },
});

function getRandomString(s: number) {
  if (s % 2 == 1) {
    throw new Deno.errors.InvalidData("Only even sizes are supported");
  }
  const buf = new Uint8Array(s / 2);
  crypto.getRandomValues(buf);
  let ret = "";
  for (let i = 0; i < buf.length; ++i) {
    ret += ("0" + buf[i].toString(16)).slice(-2);
  }
  return ret;
}
