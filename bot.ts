import { config } from "./config.ts";
import {
  createBot,
  enableAmethystPlugin,
  enableCachePlugin,
  enableCacheSweepers,
} from "./deps.ts";
import { events } from "./src/events/mod.ts";
import { fileLoader, importDirectory } from "./src/helpers/fileLoader.ts";

await Promise.all(
  ["./src/events"].map((path) => importDirectory(Deno.realPathSync(path)))
);
await fileLoader();

export const bot = enableAmethystPlugin(
  enableCachePlugin(
    createBot({
      token: config.token,
      botId: BigInt(atob(config.token.split(".")[0])),
      intents: [
        "Guilds",
        "GuildMembers",
        "GuildMessages",
        "GuildMessageReactions",
      ],
      events,
    })
  ),
  { owners: config.owners }
);

enableCacheSweepers(bot);
