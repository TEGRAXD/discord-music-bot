import { EmbedBuilder } from "discord.js";
import { PlaybackState } from "laurentina";

export default {
    name: "stop",
    description: "Stop music.",
    async execute(message, _, client) {
        const clientVoiceChannel = message.guild.voiceStates.cache.get(client.user.id);
        const voiceChannelId = clientVoiceChannel?.channelId;

        if (!voiceChannelId) {
            return message.reply("I am not connected to a voice channel.");
        }

        if (message.member.voice.channel === null) {
            return message.reply("You need to be in a voice channel to stop.");
        }

        const controller = client.laurentina.getController(message.guild.id);

        if (!controller) return;

        if (controller.state === PlaybackState.STOPPED && controller.currentTrack === null) {
            return message.reply("No track is currently playing.");
        }

        controller.stop();
        controller.clearQueue();

        const embed = new EmbedBuilder()
            .setTitle("Stopped")
            .setDescription("The music has been stopped.")
            .setFooter({
                text: client.user.displayName,
                iconURL: client.user.avatarURL(),
            })
            .setTimestamp()
            .setColor(0xf54949);

        await message.channel.send({ embeds: [embed] });
    }
};
