console.log("Starting Discord Bot...");
import { config } from "dotenv";
config();

const { CHANNEL_ID, WEBHOOK_URL, BOT_TOKEN } = process.env;
if (!BOT_TOKEN) throw "BOT_TOKEN is not defined in .env file";
if (!WEBHOOK_URL) throw "WEBHOOK_URL is not defined in .env file";
if (!CHANNEL_ID) throw "CHANNEL_ID is not defined in .env file";

import recv from "./recv";
import send from "./send";
import { Client, WebhookClient } from "discord.js";


const krystal = new Client({
    intents: [
        "Guilds",
        "GuildMessages",
        "GuildMembers",
        "MessageContent",
    ]
});


var webhook = new WebhookClient({ url: WEBHOOK_URL });

krystal.on('messageCreate', async (msg) => {
    if (msg.channelId != CHANNEL_ID) return;
    if (msg.author.bot) return;
    send(JSON.stringify({
            player: (msg.member || msg.author).displayName,
            content: msg.content
        }), 'chat.from.discord');
});

recv(['chat.from.minecraft', 'chat.to.discord', "chat.to.all"], undefined, (content, msg) => {
    const data = JSON.parse(content);
    console.log(`[chat.minecraft] ${data.player} sent \"${data.content}\"`);
    webhook?.send({
        username: data.player,
        content: data.content
    });
});

krystal.login(BOT_TOKEN);