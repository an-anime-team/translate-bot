import fs from 'fs';
import type { CommandInteraction, GuildMember, User } from "discord.js";
import { Discord, Permission, Slash, SlashOption } from "discordx";
import { dirname } from "@discordx/importer";
import { Main } from '../start.js';

@Discord()
@Permission(false)
@Permission({ id: "910870211111059476", type: "ROLE", permission: true })
export class BlockCommands {
    @Slash("block", { description: "Disables a user from using Translate" })
    async block(@SlashOption("user", { type: "USER" }) user: User | GuildMember | undefined, interaction: CommandInteraction): Promise<void> {
        if (!user) return interaction.reply({ content: `Please provide a user!`, ephemeral: true });
        if (Main.Data.blockedusers.includes(user.id)) return interaction.reply({ content: `User is already banned from using Translate!`, ephemeral: true });

        Main.Data.blockedusers.push(user.id);
        fs.writeFileSync(`${dirname(import.meta.url)}/../data.json`, JSON.stringify(Main.Data));

        interaction.reply({ content: `${(user as GuildMember).user.username} has been banned from being able to use Translate`, ephemeral: true });
    }

    @Slash("unblock", { description: "Allows a disabled user to use Translate" })
    async unblock(@SlashOption("user", { type: "USER" }) user: User | GuildMember | undefined, interaction: CommandInteraction): Promise<void> {
        if (!user) return interaction.reply({ content: `Please provide a user!`, ephemeral: true });
        if (!Main.Data.blockedusers.includes(user.id)) return interaction.reply({ content: `User isn't banned from using Translate!`, ephemeral: true });

        Main.Data.blockedusers.splice(Main.Data.blockedusers.indexOf(user.id), 1);
        fs.writeFileSync(`${dirname(import.meta.url)}/../data.json`, JSON.stringify(Main.Data));

        interaction.reply({ content: `${(user as GuildMember).user.username} is now allowed to use Translate again!`, ephemeral: true });
    }
}