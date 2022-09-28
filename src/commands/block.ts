import fs from 'fs';
import type { CommandInteraction, GuildMember, User } from "discord.js";
import { PermissionFlagsBits, ApplicationCommandOptionType } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { dirname } from "@discordx/importer";
import { Main } from '../start.js';

@Discord()
export class BlockCommands {
    @Slash({ name: "block", description: "Disables a user from using Translate", defaultMemberPermissions: PermissionFlagsBits.Administrator })
    block(@SlashOption({name: "user", description: "User to ban", required: true, type: ApplicationCommandOptionType.User}) user: GuildMember | User, interaction: CommandInteraction): void {
        if (!user) interaction.reply({ content: `Please provide a user!`, ephemeral: true });
        if (Main.Data.blockedusers.includes(user.id)) interaction.reply({ content: `User is already banned from using Translate!`, ephemeral: true });

        Main.Data.blockedusers.push(user.id);
        fs.writeFileSync(`${dirname(import.meta.url)}/../data.json`, JSON.stringify(Main.Data));

        interaction.reply({ content: `${(user as GuildMember).user.username} has been banned from being able to use Translate`, ephemeral: true });
    }

    @Slash({ name: "unblock", description: "Allows a disabled user to use Translate", defaultMemberPermissions: PermissionFlagsBits.Administrator })
    unblock(@SlashOption({name: "user", description: "User to unban", required: true, type: ApplicationCommandOptionType.User}) user: GuildMember | User, interaction: CommandInteraction): void {
        if (!user) interaction.reply({ content: `Please provide a user!`, ephemeral: true });
        if (!Main.Data.blockedusers.includes(user.id)) interaction.reply({ content: `User isn't banned from using Translate!`, ephemeral: true });

        Main.Data.blockedusers.splice(Main.Data.blockedusers.indexOf(user.id), 1);
        fs.writeFileSync(`${dirname(import.meta.url)}/../data.json`, JSON.stringify(Main.Data));

        interaction.reply({ content: `${(user as GuildMember).user.username} is now allowed to use Translate again!`, ephemeral: true });
    }
}
