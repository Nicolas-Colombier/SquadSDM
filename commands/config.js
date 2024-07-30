import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import config from '../config.json' with { type: "json" };
import {generateConfigOptions} from "../handlers/configHandler.js";

// Dynamic generation of choices for servers
const serverChoices = Object.keys(config.servers).map(server => ({
    name: server,
    value: server
}));

export const data = new SlashCommandBuilder()
    .setName('config')
    .setDescription('Change server configuration.')
    .addStringOption(option =>
        option.setName('server')
            .setDescription('Server name')
            .setRequired(true)
            .addChoices(...serverChoices))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    // Define if the command can be used in DM
    .setDMPermission(false);

export async function execute(interaction) {
    if (!interaction.isCommand()) return; // Check if the interaction is a command
    try {
        const server = interaction.options.getString('server');
        const serverConfig = config.servers[server];

        // Check if the command is used in an allowed channel
        const channelId = interaction.channelId;
        const allowedChannel = serverConfig.allowedChannels.includes(channelId);

        // Check if user has any of the allowed roles for the server
        const memberRoles = interaction.member.roles.cache.map(role => role.id);
        const hasPermission = serverConfig.roles.configRole.some(role => memberRoles.includes(role));

        if (!hasPermission || !allowedChannel) {
            return await interaction.reply('You do not have the required permissions.');
        }

        const response = await generateConfigOptions(serverConfig.configPath, serverConfig.ssh, server);

        if (!response) {
            return await interaction.reply('No configuration options found.');
        }

        await interaction.reply({
            content: 'Choose a configuration',
            components: [response.choice],
            ephemeral: true
        });
        setTimeout(async () => { await interaction.deleteReply()}, 10000); // Delete the original message after 10 seconds
        return server;
    } catch (error) {
        console.error(error);
        await interaction.reply('There was an error while trying to execute this command!');
    }
}
