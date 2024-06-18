import fs from "fs/promises";
import { Collection } from "discord.js";

export const loadCommands = async (client) => {
    client.commands = new Collection();

    const commandsDirectory = await fs.readdir('./commands');

    for (const commandFile of commandsDirectory) {
        const command = await import(`../commands/${commandFile}`);
        if (command.data && command.data.name) {
            client.commands.set(command.data.name, command);
        }
    }
}


//----------------------------------------------------------------------------//


export async function handleCommand(interaction, client) {
    const command = client.commands.get(interaction.commandName);

    if (!command || typeof command.execute !== 'function') {
        console.error(`La commande ${interaction.commandName} n'existe pas ou elle n'a pas de méthode à exécuter.`);
        return;
    }

    try {
        await command.execute(interaction, client);
        console.log(`La commande ${interaction.commandName} a été exécutée.`);
    } catch (error) {
        console.error(error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: "Erreur lors de l'utilisation de cette commande",
                ephemeral: true
            });
        }
    }
}
