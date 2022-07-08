import { bot } from "../../../bot.ts";
import { Components } from "../../../deps.ts";
import { InteractionResponseTypes } from "../../../deps.ts";

bot.utils.createSlashCommand({
  name: "invite",
  description: "Get an invite link for the bot",
  category: "Misc",
  scope: "guild",
  ownerOnly: false,
  async execute(bot, data) {
    const inviteLink = `https://discord.com/oauth2/authorize?client_id=${bot.id}&permissions=1102062144758&scope=applications.commands%20bot`;
    const components = new Components().addButton("invite", "Link", inviteLink);
    await bot.helpers.sendInteractionResponse(data.id, data.token, {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: {
        content: "Click the button bellow to invite me to your server!",
        components,
      },
    });
  },
});
