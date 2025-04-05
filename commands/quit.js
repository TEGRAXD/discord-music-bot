import { EmbedBuilder } from "discord.js";

export default {
    name: "quit",
    description: "Quit from connected voice channel.",
    async execute(message, _, client) {
        const clientVoiceChannel = message.guild.voiceStates.cache.get(client.user.id);
        const voiceChannelId = clientVoiceChannel?.channelId;

        if (!voiceChannelId) {
            return message.reply("I am not connected to a voice channel.");
        }

        if (message.member.voice.channel === null) {
            return message.reply("You need to be in a voice channel to use this command.");
        }

        // Get existing controller
        const controller = client.laurentina.getController(message.guild.id);

        // Check if the bot is connected to the voice channel, if not, return
        if (!controller) return;

        // Leave the voice channel by Guild ID
        await client.laurentina.leave(message.guild.id);

        const embed = new EmbedBuilder()
            .setTitle("Disconnected")
            .setDescription("I will leave the voice channel now.")
            .setFooter({
                text: client.user.displayName,
                iconURL: client.user.avatarURL(),
            })
            .setTimestamp()
            .setColor(0xf54949);

        await message.channel.send({ embeds: [embed] });
    }
};
