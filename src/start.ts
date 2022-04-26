import "reflect-metadata";
import { Client } from "discordx";
import { Intents } from "discord.js";
import { dirname, importx } from "@discordx/importer";
import type { Interaction } from "discord.js";

export class Main {
    private static _client: Client;
  
    static get Client(): Client {
      return this._client;
    }
  
    static async start(): Promise<void> {
      this._client = new Client({
        botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
        intents: [
          Intents.FLAGS.GUILDS,
          Intents.FLAGS.GUILD_MESSAGES,
          Intents.FLAGS.GUILD_MEMBERS
        ],
        silent: false,
      });
  
      this.Client.on("ready", async () => {
        console.log("Bot started...");

        // Cache Guilds
        await this.Client.guilds.fetch();

        // Synchronize applications commands with Discord
        await this.Client.initApplicationCommands();

        // Synchronize applications command permissions with Discord
        await this.Client.initApplicationPermissions();
      });

      this.Client.on("interactionCreate", (interaction: Interaction) => {
        this.Client.executeInteraction(interaction);
      });
  
      await importx(dirname(import.meta.url) + "/commands/**/*.{js,ts}");
      await importx(dirname(import.meta.url) + "/events/**/*.{js,ts}");
  
      // let's start the bot
      if (!process.env.BOT_TOKEN) {
        throw Error("Could not find BOT_TOKEN in your environment");
      }

      await this._client.login(process.env.BOT_TOKEN);
    }
}

Main.start();