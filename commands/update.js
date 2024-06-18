import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import config from '../config.json' assert { type: "json" };
import { executeCommands } from '../utils/executeCommands.js';

export const data = new SlashCommandBuilder()
    .setName('update')
    .setDescription('Mise à jour du serveur.')
    // (0) = Nécessite la permission d'administrateur
    .setDefaultMemberPermissions(0)
    // Permet ou non l'exécution de la commande en message privé
    .setDMPermission(false);

export async function execute(interaction) {
    try {
        // Vérifiez les permissions de l'utilisateur
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.reply('Vous n\'avez pas la permission de mettre à jour le serveur.');
        }

        const commandInfo = [
            {
                command: `${config.serverPath} update`,
                description: 'Mise à jour du serveur',
                checkOutput: (output) => true,
            },
        ];

        await executeCommands(interaction, commandInfo);
    } catch (error) {
        console.error(error);
        await interaction.reply('Il y a eu une erreur en tentant de mettre à jour le serveur.');
    }
}
