import { Errors } from "../../deps.ts";
import { sendResponse } from "../helpers/helpers.ts";
import { events } from "./mod.ts";

events.commandError = (bot, { error, data }) => {
  if (!data) return;
  if (error.type === Errors.BOT_MISSING_PERMISSIONS) {
    sendResponse(
      bot,
      data,
      `I am missing the \`${error.value
        .map((e) => e.toLowerCase())
        .join(", ")}\` permission(s)`
    );
  }
  if (error.type === Errors.USER_MISSING_PERMISSIONS) {
    sendResponse(
      bot,
      data,
      `You're missing the \`${error.value
        .map((e) => e.toLowerCase())
        .join(", ")}\` permission(s)`
    );
  }
};
