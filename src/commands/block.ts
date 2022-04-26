import type { CommandInteraction, GuildMember, User } from "discord.js";
import { Discord, Permission, Slash, SlashOption } from "discordx";

//@ts-expect-error
let data = JSON.parse(fs.readFileSync(`${__dirname}/../data.json`));
  
@Discord()
@Permission(false)
@Permission({ id: "910870211111059476", type: "ROLE", permission: true })
export class BlockCommands {
    @Slash("block")
    async block(@SlashOption("user", { type: "USER" }) user: User | GuildMember | undefined, interaction: CommandInteraction): Promise<void> {
        await interaction.deferReply();
        if (!user) return interaction.reply({ content: `Please provide a user!`, ephemeral: true });
        if (data.blockedusers.includes(user.id)) return interaction.reply({ content: `User is already banned from using Translate!`, ephemeral: true });

        interaction.reply({ content: `${(user as User).username} has been banned from being able to use Translate`, ephemeral: true });
    }

    @Slash("unblock")
    async unblock(@SlashOption("user", { type: "USER" }) user: User | GuildMember | undefined, interaction: CommandInteraction): Promise<void> {
        await interaction.deferReply();
        if (!user) return interaction.reply({ content: `Please provide a user!`, ephemeral: true });
        if (!data.blockedusers.includes(user.id)) return interaction.reply({ content: `User isn't banned from using Translate!`, ephemeral: true });

        interaction.reply({ content: `${(user as User).username} is now allowed to use Translate again!`, ephemeral: true });
    }
}