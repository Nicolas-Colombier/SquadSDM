import { REST, Routes } from 'discord.js';
import config from '../config.json' assert { type: "json" };

const rest = new REST().setToken(config.token);

// Mettre en commentaire les commandes que vous ne souhaitez pas exécuter

// Supprime une commande spécifique du serveur
rest.delete(Routes.applicationGuildCommand(config.clientId, config.guildId, 'commandId'))
    .then(() => console.log('Suppression réussie de la commande du serveur.'))
    .catch(console.error);


// Supprime toutes les commandes existantes dans le serveur
rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: [] })
    .then(() => console.log('Suppression réussie de toutes les commandes du serveur.'))
    .catch(console.error);


// Supprime une commande spécifique du bot
rest.delete(Routes.applicationCommand(config.clientId, 'commandId'))
    .then(() => console.log('Suppression réussie de la commande du bot.'))
    .catch(console.error);


// Supprime toutes les commandes existantes du bot
rest.put(Routes.applicationCommands(config.clientId), { body: [] })
    .then(() => console.log('Suppression réussie de toutes les commandes du bot.'))
    .catch(console.error);

