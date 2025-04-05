import { EmbedBuilder } from "discord.js";
import { msToTime } from "../helpers/msToTime.js";

export default {
    name: "queue",
    description: "Shows the queue.",
    async execute(message, _, client) {
        const clientVoiceChannel = message.guild.voiceStates.cache.get(client.user.id);
        const voiceChannelId = clientVoiceChannel?.channelId;

        // Check if the bot is connected to a voice channel
        if (!voiceChannelId) {
            return message.reply("I am not connected to a voice channel.");
        }

        // Check if the user is in a voice channel
        if (message.member.voice.channel === null) {
            return message.reply("You need to be in a voice channel to stop.");
        }

        // Get existing controller
        const controller = client.laurentina.getController(message.guild.id);

        // Check if the bot is connected to the voice channel, if not, return
        if (!controller) return;

        // Get the queue
        const queue = controller.getQueue();

        const embed = new EmbedBuilder()
            .setTitle("Queue")
            .setDescription("Here is the current queue:")
            .setFooter({
                text: client.user.displayName,
                iconURL: client.user.avatarURL(),
            })
            .setTimestamp()
            .setColor(0xf54949);
        
        // Get now playing song if exists
        const nowPlaying = controller.currentTrack;
        
        // Create queue text
        let queueText = "";
        
        // Check if there is a now playing song, if so, add it to the queue text
        if (nowPlaying) {
            const { title } = nowPlaying.info;

            queueText += `**Now Playing:**\n**${title}** Requested by <@${nowPlaying.requester}>\n\n`;
        }

        // Set the queue title
        queueText += `**Queue:**\n`;

        // Set the queue songs
        queueText += queue.map((track, index) => {
            const { title } = track.info;
            return `**${index + 1}. ${title}** Requested by <@${track.requester}>\n`;
        }).join("\n");

        // Add description if queue is empty
        if (queue.length === 0) {
            queueText += "**No songs in the queue.**";
        }

        // Set queue text to embed description
        embed.setDescription(queueText);

        // Send the embed
        await message.channel.send({ embeds: [embed] });
    }
};
