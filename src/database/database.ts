import { Client } from "../../deps.ts";

export const db = new Client({
  user: "josiah",
  password: "shitman",
  database: "bot",
  hostname: "localhost",
});

await db.connect();

await db.queryArray`CREATE TABLE IF NOT EXISTS welcome(guild BIGINT NOT NULL, channel BIGINT, message TEXT, role BIGINT, toggle BOOLEAN NOT NULL DEFAULT FALSE)`;
await db.queryArray`CREATE TABLE IF NOT EXISTS goodbye(guild BIGINT NOT NULL, channel BIGINT, message TEXT, toggle BOOLEAN NOT NULL DEFAULT FALSE)`;
await db.queryArray`CREATE TABLE IF NOT EXISTS note(guild BIGINT NOT NULL, userId BIGINT, modId BIGINT, message TEXT, noteId INT NOT NULL)`;
await db.queryArray`CREATE TABLE IF NOT EXISTS warn(guild BIGINT NOT NULL, userId BIGINT, modId BIGINT, message TEXT, warnId INT NOT NULL)`;
await db.queryArray`CREATE TABLE IF NOT EXISTS modlogs(guild BIGINT NOT NULL, channel BIGINT, toggle BOOLEAN NOT NULL DEFAULT FALSE)`;
