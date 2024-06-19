import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import config from '../config.json' assert { type: "json" };
import { executeCommands } from '../utils/executeCommands.js';

// Génération dynamique des choix pour les serveurs
const serverChoices = Object.keys(config.servers).map(server => ({
    name: server,
    value: server
}));

export const data = new SlashCommandBuilder()
    .setName('details')
    .setDescription('Obtention des détails du serveur.')
    .addStringOption(option =>
        option.setName('server')
            .setDescription('Nom du serveur')
            .setRequired(true)
            .addChoices(...serverChoices))
    // (0) = Nécessite la permission d'administrateur
    .setDefaultMemberPermissions(0)
    // Permet ou non l'exécution de la commande en message privé
    .setDMPermission(false);

export async function execute(interaction) {
    try {
        // Vérifiez les permissions de l'utilisateur
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.reply('Vous n\'avez pas la permission d\'obtenir les détails du serveur.');
        }

        const server = interaction.options.getString('server');
        const serverConfig = config.servers[server];

        const commandInfo = [
            {
                command: `${serverConfig.serverPath} details`,
                description: 'Obtention des détails du serveur',
                checkOutput: (output) => true,
            },
        ];

        await executeCommands(interaction, commandInfo, serverConfig.ssh);
    } catch (error) {
        console.error(error);
        await interaction.reply('Il y a eu une erreur en tentant d\'obtenir les détails du serveur.');
    }
}
