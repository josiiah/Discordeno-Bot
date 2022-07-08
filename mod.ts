import { bot } from "./bot.ts";
import { startBot, enablePermissionsPlugin } from "./deps.ts";
import { fileLoader, importDirectory } from "./src/helpers/fileLoader.ts";

// Forces deno to read all the files which will fill the commands/inhibitors cache etc.
await Promise.all(
  ["./src/commands"].map((path) => importDirectory(Deno.realPathSync(path)))
);
await fileLoader();

await import("./src/commands/Misc/help.ts");
await import("./src/database/database.ts");

enablePermissionsPlugin(bot);

startBot(bot);
