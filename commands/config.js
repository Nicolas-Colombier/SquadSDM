import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import config from '../config.json' assert { type: "json" };
import {generateConfigOptions} from "../handlers/configHandler.js";

export const data = new SlashCommandBuilder()
    .setName('config')
    .setDescription('Changement de configuration.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .setDMPermission(false);

export async function execute(interaction) {
    if (!interaction.isCommand()) return; // Vérifiez que l'interaction est une commande
    try {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.reply('Vous n\'avez pas la permission de changer la configuration du serveur.');
        }

        const response = await generateConfigOptions(config.configPath, interaction);

        if (!response) {
            return await interaction.reply('Aucune configuration disponible.');
        }

        await interaction.reply({
            content: 'Choisissez une configuration',
            components: [response.choice],
            ephemeral: true
        });

        setTimeout(async () => { await interaction.deleteReply()}, 10000); // Supprimer la réponse après 10 secondes
    } catch (error) {
        console.error(error);
        await interaction.reply('Il y a eu une erreur en tentant de récupérer les configurations.');
    }
}
