import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import config from '../config.json' assert { type: "json" };
import { executeCommands } from '../utils/executeCommands.js';

// Génération dynamique des choix
const modChoices = config.mods.map(mod => ({
    name: mod.name,
    value: mod.id
}));

export const data = new SlashCommandBuilder()
    .setName('updatemod')
    .setDescription('Mise à jour ou ajout d\'un mod.')
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
            return await interaction.reply('Vous n\'avez pas la permission de mettre à jour ou ajouter un mod au serveur.');
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

        const commandInfo = [
            {
                command: `/usr/games/steamcmd +force_install_dir "${config.modPath}" +login anonymous +workshop_download_item 393380 ${modId} validate +quit`,
                description: 'Téléchargement du mod',
                checkOutput: (output) => output.includes('Success'),
            },
            {
                command: `rm -r ${config.modPath}/${modId}`,
                description: 'Suppression de l\'ancien mod',
                checkOutput: (output) => true,
            },
            {
                command: 'sleep 1m',
                description: 'Délai de 1 minutes',
                checkOutput: () => true,
            },
            {
                command: `mv ${config.modPath}/steamapps/workshop/content/393380/${modId} ${config.modPath}`,
                description: 'Déplacement du nouveau mod dans le bon répertoire',
                checkOutput: (output) => true,
            },
            {
                command: `rm -r ${config.modPath}/steamapps`,
                description: 'Suppression du répertoire steamapps',
                checkOutput: (output) => true,
            },
        ];

        await executeCommands(interaction, commandInfo);
    } catch (error) {
        console.error(error);
        await interaction.reply('Il y a eu une erreur en tentant de mettre à jour ou ajouter un mod au serveur.');
    }
}
