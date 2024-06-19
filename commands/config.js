import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import config from '../config.json' assert { type: "json" };
import {generateConfigOptions} from "../handlers/configHandler.js";

// Génération dynamique des choix pour les serveurs
const serverChoices = Object.keys(config.servers).map(server => ({
    name: server,
    value: server
}));

export const data = new SlashCommandBuilder()
    .setName('config')
    .setDescription('Changement de configuration.')
    .addStringOption(option =>
        option.setName('server')
            .setDescription('Nom du serveur')
            .setRequired(true)
            .addChoices(...serverChoices))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .setDMPermission(false);

export async function execute(interaction) {
    if (!interaction.isCommand()) return; // Vérifiez que l'interaction est une commande
    try {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.reply('Vous n\'avez pas la permission de changer la configuration du serveur.');
        }

        const server = interaction.options.getString('server');
        const serverConfig = config.servers[server];

        const response = await generateConfigOptions(serverConfig.configPath, serverConfig.ssh, server);

        if (!response) {
            return await interaction.reply('Aucune configuration disponible.');
        }

        await interaction.reply({
            content: 'Choisissez une configuration',
            components: [response.choice],
            ephemeral: true
        });
        setTimeout(async () => { await interaction.deleteReply()}, 10000); // Supprimer la réponse après 10 secondes
        return server;
    } catch (error) {
        console.error(error);
        await interaction.reply('Il y a eu une erreur en tentant de récupérer les configurations.');
    }
}
