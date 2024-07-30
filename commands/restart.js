import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import config from '../config.json' with { type: "json" };
import { executeCommands } from '../utils/executeCommands.js';

// Dynamic generation of choices for servers
const serverChoices = Object.keys(config.servers).map(server => ({
    name: server,
    value: server
}));

export const data = new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Restart the server')
    .addStringOption(option =>
        option.setName('server')
            .setDescription('Server name')
            .setRequired(true)
            .addChoices(...serverChoices))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.UseApplicationCommands)
    // Define if the command can be used in DM
    .setDMPermission(false);

export async function execute(interaction) {
    try {
        const server = interaction.options.getString('server');
        const serverConfig = config.servers[server];
        // Check if the command is used in an allowed channel
        const channelId = interaction.channelId;
        const allowedChannel = serverConfig.allowedChannels.includes(channelId);

        // Check if user has any of the allowed roles for the server
        const memberRoles = interaction.member.roles.cache.map(role => role.id);
        const hasPermission = serverConfig.roles.restartRole.some(role => memberRoles.includes(role));

        if (!hasPermission || !allowedChannel) {
            return await interaction.reply('You do not have the required permissions.');
        }

        const commandInfo = [
            {
                command: `${serverConfig.serverPath} restart`,
                description: 'Restarting the server',
                checkOutput: (output) => output.includes('OK'),
            },
        ];

        await executeCommands(interaction, commandInfo, serverConfig.ssh);
    } catch (error) {
        console.error(error);
        await interaction.reply('There was an error while trying to execute this command!');
    }
}
