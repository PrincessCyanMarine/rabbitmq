console.log("Starting Discord Bot...");
import { config } from "dotenv";
config();

const token = process.env.BOT_KRYSTAL_TOKEN;
if (!token) throw "BOT_KRYSTAL_TOKEN is not defined in .env file";
const webhookID = process.env.RabbitMQID;
if (!webhookID) throw "RabbitMQID is not defined in .env file";
const webhookToken = process.env.RabbitMQToken;
if (!webhookToken) throw "RabbitMQToken is not defined in .env file";

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


var webhook = new WebhookClient({
    id: webhookID,
    token: webhookToken
});

krystal.on('messageCreate', async (msg) => {
    if (msg.channelId != '620635349173010474') return;
    if (msg.author.bot) return;
    send(JSON.stringify({
            player: msg.author.displayName,
            content: msg.content
        }), 'chat.from.discord');
});

recv(['chat.from.*', 'chat.to.discord'], undefined, (content, msg) => {
    if (msg.fields.routingKey == 'chat.from.discord') return;
    const data = JSON.parse(content);
    console.log(`[chat.minecraft] ${data.player} sent \"${data.content}\"`);
    webhook?.send({
        username: data.player,
        content: data.content
    });
});

krystal.login(token);