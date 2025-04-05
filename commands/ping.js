export default {
    name: "ping",
    description: "Checks bot latency.",
    async execute(message, _) {
        const msg = await message.reply("Pinging...");
        const latency = msg.createdTimestamp - message.createdTimestamp;
        const apiPing = Math.round(message.client.ws.ping);
    
        await msg.edit(`🏓 Pong!\nMessage latency: ${latency}ms\nAPI latency: ${apiPing}ms`);
    }
};
