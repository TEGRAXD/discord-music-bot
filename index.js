import { Client, GatewayIntentBits, Events, Collection, ActivityType } from "discord.js";
import { Shoukaku, Connectors } from "shoukaku";
import { Laurentina } from "laurentina";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
    presence: {
        activities: [
            {
                name: "custom",
                type: ActivityType.Custom,
                state: "Your bot.",
            },
        ],
        status: "online",
    },
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

const LAVALINK_NODES = [
    {
        name: process.env[`LAVALINK_NAME`],
        url: process.env[`LAVALINK_URL`],
        auth: process.env[`LAVALINK_PASSWORD`],
        secure: process.env[`LAVALINK_SECURE`] === "true",
    }
];

const shoukaku = new Shoukaku(new Connectors.DiscordJS(client), LAVALINK_NODES);

shoukaku.on("ready", (name, reconnected) => {
    if (reconnected) {
        console.log(`🔁 Reconnected to Shoukaku node: ${name}`);
    } else {
        console.log(`✅ Connected to Shoukaku node: ${name}`);
    }
});

const laurentina = new Laurentina(shoukaku, LAVALINK_NODES);

client.shoukaku = shoukaku;
client.laurentina = laurentina;
client.commands = new Collection();

const prefix = process.env.PREFIX;

// Load commands
const commandsPath = path.join(process.cwd(), "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = (await import(`file://${filePath}`)).default;
    if ("name" in command && "execute" in command) {
        client.commands.set(command.name, command);
        console.log(`- Loaded command: ${command.name}`);
    } else {
        console.warn(`❌ Command at ${file} is missing "name" or "execute".`);
    }
}

// Events
client.once(Events.ClientReady, () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);

    if (!command) return;

    try {
        await command.execute(message, args, client);
    } catch (error) {
        console.error(error);
        await message.reply("❌ There was an error executing that command.");
    }
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    if (oldState.channelId && !newState.channelId) {
        if (newState.id === client.user.id) {
            console.log(`Bot was disconnected from voice channel (${oldState.channel.name}).`);
            client.laurentina.leave(newState.guild.id);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);