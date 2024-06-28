import { REST, Routes } from 'discord.js';
import config from '../config.json' with { type: "json" };

const rest = new REST().setToken(config.token);

// Delete all commands of the bot client
rest.put(Routes.applicationCommands(config.clientId), { body: [] })
    .then(() => console.log('Deletion of all commands complete.'))
    .catch(console.error);

