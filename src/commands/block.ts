import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import type { CommandInteraction, GuildMember, User } from "discord.js";
import { Discord, Permission, Slash, SlashOption } from "discordx";

//@ts-expect-error
let data = JSON.parse(fs.readFileSync(`${__dirname}/../data.json`));
  
@Discord()
@Permission(false)
@Permission({ id: "910870211111059476", type: "ROLE", permission: true })
export class BlockCommands {
    @Slash("block", { description: "Disables a user from using Translate" })
    async block(@SlashOption("user", { type: "USER" }) user: User | GuildMember | undefined, interaction: CommandInteraction): Promise<void> {
        if (!user) return interaction.reply({ content: `Please provide a user!`, ephemeral: true });
        if (data.blockedusers.includes(user.id)) return interaction.reply({ content: `User is already banned from using Translate!`, ephemeral: true });

        data.blockedusers.push(user.id);
        fs.writeFileSync(`${__dirname}/../data.json`, JSON.stringify(data));

        interaction.reply({ content: `${(user as GuildMember).user.username} has been banned from being able to use Translate`, ephemeral: true });
    }

    @Slash("unblock", { description: "Allows a disabled user to use Translate" })
    async unblock(@SlashOption("user", { type: "USER" }) user: User | GuildMember | undefined, interaction: CommandInteraction): Promise<void> {
        if (!user) return interaction.reply({ content: `Please provide a user!`, ephemeral: true });
        if (!data.blockedusers.includes(user.id)) return interaction.reply({ content: `User isn't banned from using Translate!`, ephemeral: true });

        data.blockedusers.splice(data.blockedusers.indexOf(user.id), 1);
        fs.writeFileSync(`${__dirname}/../data.json`, JSON.stringify(data));

        interaction.reply({ content: `${(user as GuildMember).user.username} is now allowed to use Translate again!`, ephemeral: true });
    }
}