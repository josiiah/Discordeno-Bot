import { bot } from "../../../../bot.ts";

bot.utils.createSlashCommand({
  name: "goodbye",
  description: "Set up the goodbye configuration for your server.",
  category: "Settings",
});
