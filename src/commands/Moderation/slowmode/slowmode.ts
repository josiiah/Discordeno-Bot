import { bot } from "../../../../bot.ts";

bot.utils.createSlashCommand({
  name: "slowmode",
  description: "Set the slowmode for the channel",
  category: "Moderation",
  scope: "guild",
});
