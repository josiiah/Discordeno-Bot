import { bot } from "../../../bot.ts";
import { Components } from "../../../deps.ts";
import { InteractionResponseTypes } from "../../../deps.ts";
import { config } from "../../../config.ts";

bot.utils.createSlashCommand({
  name: "support",
  description: "Get an invite link for the community support server",
  category: "Misc",
  scope: "guild",
  ownerOnly: false,
  async execute(bot, data) {
    const components = new Components().addButton(
      "support",
      "Link",
      config.support
    );
    await bot.helpers.sendInteractionResponse(data.id, data.token, {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: {
        content: "Click the button bellow to get support",
        components,
      },
    });
  },
});
