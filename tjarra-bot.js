const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const dotenv = require('dotenv');
const app = express();
const port = 3001;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });


dotenv.config();
app.use(express.json());

app.post('/send-message', async (req, res) => {
    const { message } = req.body;
    const channelId = '1285879829736198154';

    try {
        const channel = await client.channels.fetch(channelId);
        await channel.send(message);
        res.status(200).send('Message sent');
    } catch (error) {
        console.error('Error sending message to Discord channel:', error);
        res.status(500).send('Failed to send message');
    }
});

client.once('ready', () => {
    console.log('Discord bot is online');
});

client.login(process.env.DISCORD_BOT_TOKEN);

app.listen(port, () => {
    console.log(`Bot server listening on http://localhost:${port}`);
});
