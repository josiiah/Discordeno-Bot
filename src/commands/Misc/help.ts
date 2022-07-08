import { AmethystEmbed } from "../../../deps.ts";
import { bot } from "../../../bot.ts";
import { capitalize, sendEmbed } from "../../helpers/helpers.ts";

bot.utils.createSlashCommand({
  name: "help",
  description:
    "Show the list of available commands / Information about a command",
  category: "Misc",
  options: [
    {
      name: "command",
      description: "The command to show the info of",
      type: 3,
      required: false,
      choices: bot.slashCommands
        .filter((e) => !e.ownerOnly)
        .map((e) => {
          return { name: e.name, value: e.name };
        })
        .sort(),
    },
  ],
  execute: (bot, data) => {
    const commandName = data.data?.options?.[0].value as string;
    const embed = new AmethystEmbed()
      .setThumbnail(
        bot.helpers.avatarURL(bot.id, bot.users.get(bot.id)!.discriminator, {
          avatar: bot.users.get(bot.id)?.avatar,
        })
      )
      .setTimestamp();
    if (commandName) {
      const command = bot.slashCommands.get(commandName)!;
      embed
        .setTitle(`${capitalize(command.name)} Command Info`)
        .setDescription(command.description)
        .addField(
          "Command Usage",
          `${
            command.options?.filter((e) => e.type !== 1).length
              ? `\`/${command.name} ${command.options
                  .filter((e) => e.type !== 1)
                  ?.map((e) =>
                    e.required
                      ? `<${e.choices?.length == 1 ? e.choices[0] : e.name}>`
                      : `[${e.choices?.length == 1 ? e.choices[0] : e.name}]`
                  )
                  .join(" ")}\`\n`
              : ""
          }${
            command.subcommands
              ?.filter((e) => e.SubcommandType == "subcommand")
              ?.map(
                (subcommand) =>
                  `\`/${command.name} ${subcommand.name} ${
                    subcommand.SubcommandType == "subcommand"
                      ? subcommand.options?.length
                        ? subcommand.options
                            .map(
                              (argument) =>
                                `${argument.required ? "<" : "["}${
                                  argument.choices?.length
                                    ? argument.choices[0]
                                    : argument.name
                                }${argument.required ? ">" : "]"}`
                            )
                            .join(" ")
                        : ""
                      : ""
                  }\``
              )
              .join("\n") || "`No Subcommand` |"
          }${
            command.subcommands
              ?.filter((e) => e.SubcommandType == "subcommandGroup")
              ?.map((subcommand) =>
                subcommand.SubcommandType == "subcommandGroup"
                  ? subcommand
                      .subcommands!.map(
                        (sub) =>
                          `\`/${command.name} ${subcommand.name} ${sub.name} ${
                            sub.options?.length
                              ? sub.options
                                  .map(
                                    (argument) =>
                                      `${argument.required ? "<" : "["}${
                                        argument.choices?.length
                                          ? argument.choices[0]
                                          : argument.name
                                      }${argument.required ? ">" : "]"}`
                                  )
                                  .join(" ")
                              : ""
                          }\``
                      )
                      .join("\n")
                  : ""
              )
              .join("\n") || " `No Subcommand Group`"
          }`
        )
        .addField(
          "Command Category",
          `${capitalize(command.category!)} category`
        );
      if (command.dmOnly !== true) {
        embed
          .addField(
            "Required Server Permissions",
            command.userGuildPermissions?.length
              ? command.userGuildPermissions
                  .map((e) => `\`${e.toLowerCase()}\``)
                  .join(", ")
              : "None"
          )
          .addField(
            "Required Channel Permissions",
            command.userChannelPermissions?.length
              ? command.userChannelPermissions
                  .map((e) => `\`${e.toLowerCase()}\``)
                  .join(", ")
              : "None"
          );
      }
      return sendEmbed(bot, data, embed);
    }
    embed
      .setTitle("Help Command")
      .setFooter(`${bot.slashCommands.size} Commands`);
    const categories = [
      ...new Set(bot.slashCommands.map((e) => e.category!)),
    ].sort();
    for (const category of categories) {
      embed.addField(
        `${capitalize(category)} Category`,
        bot.slashCommands
          .filter((e) => e.category == category)
          .map((e) => `\`${e.name}\``)
          .join(", ")
      );
    }
    sendEmbed(bot, data, embed);
  },
});
