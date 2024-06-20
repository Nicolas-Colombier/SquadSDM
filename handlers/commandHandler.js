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
        console.error(`The command : ${interaction.commandName} does not exist or is not valid.`);
        return;
    }

    try {
        await command.execute(interaction, client);
        console.log(`The command : ${interaction.commandName} has been executed.`);
    } catch (error) {
        console.error(`Error while executing the command : ${error}`);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: "Error while executing the command.",
                ephemeral: true
            });
        }
    }
}
