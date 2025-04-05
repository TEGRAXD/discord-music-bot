import { EmbedBuilder } from "discord.js";
import { msToTime } from "../helpers/msToTime.js";

export default {
    name: "play",
    description: "Play music.",
    async execute(message, args, client) {
        // Getting search query from arguments
        const query = args.join(" ").trim();

        // No query provided
        if (query.length === 0) return message.reply("Please provide a song name!");

        // Check if the user is in a voice channel
        const { channel } = message.member.voice;
        
        // If the user is not in a voice channel, return a reply
        if (!channel) return message.reply("Join a voice channel first!");

        // Get existing controller
        let controller = client.laurentina.getController(message.guild.id);

        if (!controller) {
            // Join the voice channel
            controller = await client.laurentina.join(
                message.guild.id, // Guild ID
                message.member.voice.channel.id, // Voice channel ID
                message.channel.id, // Text channel ID (Where the user is sending the command)
            );
        }

        // Search for the song with Youtube Search
        const result = await controller.search("ytsearch", query);

        // Sending a not found when there is no results
        if (result.length === 0) return message.reply("No results found!");

        // Shifting is used to get the first element of the array
        const selectedSong = result.shift();

        // Saving the requester ID
        selectedSong.requester = message.author.id;

        // Play the song
        await controller.play(
            selectedSong,
            // Custom callback when the track starts playing
            async (track) => {
                const { title, author, length, uri, artworkUrl } = track.info;

                const embed = new EmbedBuilder()
                    .setTitle("Playing")
                    .setDescription(`**${title}**\nRequested by <@${selectedSong.requester}>`)
                    .addFields([
                        { name: "Channel", value: author, inline: true },
                        { name: "Duration", value: msToTime(length), inline: true },
                    ])
                    .setFooter({
                        text: client.user.displayName,
                        iconURL: client.user.avatarURL(),
                    })
                    .setTimestamp()
                    .setColor(0xf54949);
                
                if (artworkUrl) {
                    embed.setThumbnail(artworkUrl);
                }

                return await message.channel.send({ embeds: [embed] });
            },
            // Custom callback when the track is added to the queue
            async (track) => {
                const { title, author, length, uri, artworkUrl } = track.info;

                const embed = new EmbedBuilder()
                    .setTitle("Added to Queue")
                    .setDescription(`**${title}**\nRequested by <@${selectedSong.requester}>`)
                    .addFields([
                        { name: "Channel", value: author, inline: true },
                        { name: "Duration", value: msToTime(length), inline: true },
                    ])
                    .setFooter({
                        text: client.user.displayName,
                        iconURL: client.user.avatarURL(),
                    })
                    .setTimestamp()
                    .setColor(0x4caf50);
                
                if (artworkUrl) {
                    embed.setThumbnail(artworkUrl);
                }

                return await message.channel.send({ embeds: [embed] });
            }
        );
    }
};
