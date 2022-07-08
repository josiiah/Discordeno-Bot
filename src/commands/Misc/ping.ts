import { bot } from "../../../bot.ts";
import { deconstruct, sendResponse } from "../../helpers/helpers.ts";

bot.utils.createSlashCommand({
  name: "ping",
  description: "test",
  category: "Misc",
  ownerOnly: false,
  execute(bot, data) {
    sendResponse(
      bot,
      data,
      `Pong: \`${Date.now() - deconstruct(data.id) * 1000}\`ms`
    );
  },
});
