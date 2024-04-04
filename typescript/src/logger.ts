console.log("Starting Logger...");
import recv from "./recv";
import fs from "fs";


recv(['chat.from.*', 'chat.to.*'], undefined, (content) => {
    const data = JSON.parse(content);
    const saveData = `[${data.player}] ${data.content}`;
    console.log(`[chat.*] ${saveData}`);
    fs.appendFile('chat.log', saveData + '\n', (err) => {
        if (err) throw err;
    });
});