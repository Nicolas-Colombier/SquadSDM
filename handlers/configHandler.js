import { executeCommands } from "../utils/executeCommands.js";
import { checkDirectoryExists } from "../utils/checkDirectoryExists.js";
import { listDirectories } from "../utils/listDirectories.js";
import config from '../config.json' assert { type: "json" };
import {ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} from "discord.js";

export const generateConfigOptions = async (configPath, sshConfig, server) => {
    try {
        const directories = await listDirectories(configPath, sshConfig);

        if (!directories.length) {
            console.log('Aucune configuration disponible.');
            return null;
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`selectConfig|${server}`)
            .setPlaceholder('Sélectionnez une configuration');

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
        console.error(`Erreur lors de la génération des options de configuration : ${error}`);
        return null;
    }
};


//----------------------------------------------------------------------------//


export async function handleConfigSelection(interaction) {
    if (!interaction.isStringSelectMenu()) return; // Vérifiez que l'interaction est un menu déroulant
    const configName = interaction.values[0];

    // Récupérer le nom du serveur à partir de l'interaction
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
                // Supprime tous les fichiers du répertoire de destination
                command: `rm -rf ${destinationDirectory}/*`,
                description: `Suppression de tous les fichiers du répertoire de destination "${destinationDirectory}"`,
                checkOutput: (output) => true,
            },
            {
                // Copie de tous les fichiers de la configuration sélectionnée vers le répertoire de destination
                command: `cp -r ${configDirectory}${configName}/* ${destinationDirectory}`,
                description: `Copie de tous les fichiers de la configuration "${configName}" vers "${destinationDirectory}"`,
                checkOutput: (output) => true,
            },
        ];

        await executeCommands(interaction, commandInfo, serverConfig.ssh);

    } catch (error) {
        console.error(error);
        await interaction.update('Il y a eu une erreur en tentant de changer la configuration du serveur.');
    }
}