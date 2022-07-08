import { events } from "./mod.ts";

events.ready = (bot, { user }) => {
  bot.helpers.editBotStatus({
    activities: [{ name: `/help | dmod.gg`, type: 3, createdAt: Date.now() }],
    status: "online",
  });
  console.log(
    `[Gateway Connected] "${user.username}#${user.discriminator} (${bot.id})"!`,
  );
};
