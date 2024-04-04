console.log("Starting Website...");
import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import recv from './recv';
import send from './send';
const app = express();
const httpServer = createServer(app);
const ws = new Server(httpServer);


app.get('/', (req, res) => {
    res.send(`
        <style>
            body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            #messages {
                list-style-type: none;
            }
        </style>
        <script src="/socket.io/socket.io.js"></script>
        <script>
            var socket = io();
            var messages = null;
            function loaded() {
                messages = document.getElementById('messages');
                console.log(messages);
                socket.on('message', function (msg) {
                    console.log(msg);
                    var item = document.createElement('li');
                    const data = JSON.parse(msg);
                    item.innerText = \`<\${data.player}> \${data.content}\`;
                    messages.appendChild(item);
                });
            }
            function send(destination, message) {
                if (!message) return;
                const data = {
                    player: document.getElementById('name').value || 'web',
                    content: message
                };
                socket.emit('message', destination, JSON.stringify(data));
            }
        </script>
        <body>
            <label>
                Name:
                <input type="text" id="name" />
            </label>
            <label>
                Message:
                <input type="text" id="message" />
            </label>
            <button onclick="send('to.all', document.getElementById('message').value)">Send</button>
            <button onclick="send('to.discord', document.getElementById('message').value)">Send to discord</button>
            <button onclick="send('to.minecraft', document.getElementById('message').value)">Send to minecraft</button>
            <h1>Messages</h1>
            <ul id="messages"></ul>
            <script>loaded();</script>
        </body>
    `)
});

ws.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('message', (args, msg)=>{
        if (typeof args === 'string') args = [args];
        if (!Array.isArray(args)) throw "Usage: send.js <facility>.<severity>";
        send(msg, args.map((arg) => `chat.${arg}`));
    });
});

recv(['chat.from.*', 'chat.to.*'], undefined, (content, msg) => {
    console.log(`[${msg.fields.routingKey}] ${content}`);
    ws.emit('message', content);
});

const port = 8080;
httpServer.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});