import { bot } from "../../../../bot.ts";

bot.utils.createSlashCommand({
  name: "welcome",
  description: "Set up the welcome configuration for your server.",
  category: "Settings",
  scope: "guild",
});
