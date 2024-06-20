import { REST, Routes } from 'discord.js';
import config from '../config.json' assert { type: "json" };

const rest = new REST().setToken(config.token);

// Supprime toutes les commandes existantes du bot
rest.put(Routes.applicationCommands(config.clientId), { body: [] })
    .then(() => console.log('Suppression réussie de toutes les commandes du bot.'))
    .catch(console.error);

