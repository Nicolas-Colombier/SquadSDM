import { REST, Routes } from 'discord.js';
import fs from 'fs/promises';
import config from '../config.json' assert { type: "json" };

// Récupère toutes les commandes à partir du dossier de commandes
const commandsDirectory = await fs.readdir('./commands');
const commands = [];

for (const commandFile of commandsDirectory) {
    const command = await import(`../commands/${commandFile}`);
    // Make sure command.data and command.data.name exist before calling set
    if (command.data && command.data.name) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] La commande ${command} nécessite une méthode "data" et "execute".`);
    }
}

// Crée une nouvelle instance de REST
const rest = new REST().setToken(config.token);

// Enregistre les commandes dans le bot
(async () => {
    try {
        const data = await rest.put(
            Routes.applicationCommands(config.clientId),
            { body: commands },
        );
        console.log(`Chargement réussi de ${data.length} nouvelle(s) commande(s).`);
    } catch (error) {
        console.error(error);
    }
})();