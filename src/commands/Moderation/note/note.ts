import { bot } from "../../../../bot.ts";

bot.utils.createSlashCommand({
  name: "note",
  description: "Create a note",
  category: "Moderation",
  scope: "guild",
});
