import { bot } from "../../../../bot.ts";

bot.utils.createSlashCommand({
  name: "warn",
  description: "Warn a member",
  category: "Moderation",
  scope: "guild",
});
