console.log("Starting Logger...");
import recv from "./recv";
import fs from "fs";


recv(['chat.from.*', 'chat.to.*'], undefined, (content, msg) => {
    const data = JSON.parse(content);
    const saveData = `[${msg.fields.routingKey}] <${data.player}> ${data.content}`;
    console.log(`${saveData}`);
    fs.appendFile('chat.log', saveData + '\n', (err) => {
        if (err) throw err;
    });
});