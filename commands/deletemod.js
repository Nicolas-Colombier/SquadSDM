import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import config from '../config.json' assert { type: "json" };
import { executeCommands } from '../utils/executeCommands.js';
import { checkDirectoryExists } from "../utils/checkDirectoryExists.js";

// Génération dynamique des choix
const modChoices = config.mods.map(mod => ({
    name: mod.name,
    value: mod.id
}));

export const data = new SlashCommandBuilder()
    .setName('deletemod')
    .setDescription('Suppresion d\'un mod.')
    .addStringOption(option =>
        option.setName('modid')
            .setDescription('ID du mod')
            .setRequired(true)
            .addChoices(...modChoices))
    // (0) = Nécessite la permission d'administrateur
    .setDefaultMemberPermissions(0)
    // Permet ou non l'exécution de la commande en message privé
    .setDMPermission(false)
    .addStringOption(option =>
        option.setName('customid')
            .setDescription('ID personnalisé')
            .setRequired(false));

export async function execute(interaction) {
    try {
        // Vérifiez les permissions de l'utilisateur
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.reply('Vous n\'avez pas la permission de supprimer un mod du serveur.');
        }

        let modId = interaction.options.getString('modid');
        const customModId = interaction.options.getString('customid');

        // Si l'utilisateur a sélectionné 'Custom Mod ID', utilisez l'ID personnalisé fourni
        if (modId === ' ' && customModId) {
            modId = customModId;
        }

        if (!modId) {
            return await interaction.reply('Veuillez fournir un ID de mod valide.');
        }

        const modDirectory = config.modPath + "/" + modId;

        const directoryExists = await checkDirectoryExists(modDirectory);

        if (!directoryExists) {
            await interaction.reply(`\`\`\`Le mod "${modId}" n'existe pas.\`\`\``);
            return;
        }

        const commandInfo = [
            {
                command: `rm -rf ${modDirectory}`,
                description: `Suppression du mod "${modId}"`,
                checkOutput: (output) => !output.toLowerCase().includes('error'),
            },
        ];

        await executeCommands(interaction, commandInfo);
    } catch (error) {
        console.error(error);
        await interaction.reply('Il y a eu une erreur en tentant de supprimer un mod du serveur.');
    }
}
