import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import config from '../config.json' assert { type: "json" };
import { executeCommands } from '../utils/executeCommands.js';

// Dynamic generation of choices for servers
const serverChoices = Object.keys(config.servers).map(server => ({
    name: server,
    value: server
}));

export const data = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the server.')
    .addStringOption(option =>
        option.setName('server')
            .setDescription('Server name')
            .setRequired(true)
            .addChoices(...serverChoices))
    // (0) = Need to be an admin to use this command
    .setDefaultMemberPermissions(0)
    // Define if the command can be used in DM
    .setDMPermission(false);

export async function execute(interaction) {
    try {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.reply('You do not have the required permissions to use this command.');
        }

        const server = interaction.options.getString('server');
        const serverConfig = config.servers[server];

        const commandInfo = [
            {
                command: `${serverConfig.serverPath} stop`,
                description: 'Stopping the server',
                checkOutput: (output) => output.includes('OK'),
            },
        ];

        await executeCommands(interaction, commandInfo, serverConfig.ssh);
    } catch (error) {
        console.error(error);
        await interaction.reply('There was an error while trying to execute this command!');
    }
}
