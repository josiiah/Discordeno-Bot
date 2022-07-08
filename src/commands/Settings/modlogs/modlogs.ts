import { bot } from "../../../../bot.ts";

bot.utils.createSlashCommand({
  name: "modlogs",
  description: "Set up the goodbye configuration for your server.",
  category: "Settings",
});
