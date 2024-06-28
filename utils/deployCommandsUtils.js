import { REST, Routes } from 'discord.js';
import fs from 'fs/promises';
import config from '../config.json' with { type: "json" };

// Fetch all commands from the commands directory
const commandsDirectory = await fs.readdir('./commands');
const commands = [];

for (const commandFile of commandsDirectory) {
    const command = await import(`../commands/${commandFile}`);
    // Make sure command.data and command.data.name exist before calling set
    if (command.data && command.data.name) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] The command : ${command} need a Data or Execute method.`);
    }
}

// Create a new instance of REST and set the token
const rest = new REST().setToken(config.token);

// Save all commands in the bot client
(async () => {
    try {
        const data = await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands },
        );
        console.log(`Successful loading of ${data.length} new commands.`);
    } catch (error) {
        console.error(error);
    }
})();