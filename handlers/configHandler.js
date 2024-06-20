import { executeCommands } from "../utils/executeCommands.js";
import { checkDirectoryExists } from "../utils/checkDirectoryExists.js";
import { listDirectories } from "../utils/listDirectories.js";
import config from '../config.json' assert { type: "json" };
import {ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} from "discord.js";

export const generateConfigOptions = async (configPath, sshConfig, server) => {
    try {
        const directories = await listDirectories(configPath, sshConfig);

        if (!directories.length) {
            console.log('No configuration options found.');
            return null;
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`selectConfig|${server}`)
            .setPlaceholder('Select a configuration');

        directories.forEach(dir => {
            selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(dir)
                    .setValue(dir)
            );
        });

        const choice = new ActionRowBuilder().addComponents(selectMenu);

        return { choice };
    } catch (error) {
        console.error(`Error while executing the command : ${error}`);
        return null;
    }
};


//----------------------------------------------------------------------------//


export async function handleConfigSelection(interaction) {
    if (!interaction.isStringSelectMenu()) return; // Check if the interaction is a string select menu
    const configName = interaction.values[0];

    // Get the server name from the customId
    const server = interaction.customId.split('|')[1];
    const serverConfig = config.servers[server];

    const configDirectory = `${serverConfig.configPath}`;
    const destinationDirectory = serverConfig.serverConfigPath;

    try {
        const directoryExists = await checkDirectoryExists(configDirectory, serverConfig.ssh);

        if (!directoryExists) {
            await interaction.reply(`\`\`\`La configuration "${configName}" n'existe pas.\`\`\``);
            return;
        }

        const commandInfo = [
            {
                // Delete all files from the destination directory
                command: `rm -rf ${destinationDirectory}/*`,
                description: `Deleting all files from the destination directory : "${destinationDirectory}"`,
                checkOutput: (output) => true,
            },
            {
                // Copy all files from the configuration directory to the destination directory
                command: `cp -r ${configDirectory}${configName}/* ${destinationDirectory}`,
                description: `Copying all files from the "${configName}" config to "${destinationDirectory}"`,
                checkOutput: (output) => true,
            },
        ];

        await executeCommands(interaction, commandInfo, serverConfig.ssh);

    } catch (error) {
        console.error(`Error while executing the command : ${error}`);
        await interaction.update({
            content: "Error while executing the command.",
            ephemeral: true
        });
    }
}