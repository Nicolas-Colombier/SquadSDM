import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import config from '../config.json' with { type: "json" };
import { executeCommands } from '../utils/executeCommands.js';

// Dynamic generation of choices for servers
const serverChoices = Object.keys(config.servers).map(server => ({
    name: server,
    value: server
}));

// Dynamic generation of choices for mods
const modChoices = config.mods.map(mod => ({
    name: mod.name,
    value: mod.id
}));

export const data = new SlashCommandBuilder()
    .setName('updatemod')
    .setDescription('Add or Update a mod.')
    .addStringOption(option =>
        option.setName('server')
            .setDescription('Server name')
            .setRequired(true)
            .addChoices(...serverChoices))
    .addStringOption(option =>
        option.setName('modid')
            .setDescription('Mod ID')
            .setRequired(true)
            .addChoices(...modChoices))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.UseApplicationCommands)
    // Define if the command can be used in DM
    .setDMPermission(false)
    .addStringOption(option =>
        option.setName('customid')
            .setDescription('Customized ID')
            .setRequired(false));

export async function execute(interaction) {
    try {
        const server = interaction.options.getString('server');
        const serverConfig = config.servers[server];

        // Check if the command is used in an allowed channel
        const channelId = interaction.channelId;
        const allowedChannel = serverConfig.allowedChannels.includes(channelId);

        // Check if user has any of the allowed roles for the server
        const memberRoles = interaction.member.roles.cache.map(role => role.id);
        const hasPermission = serverConfig.roles.updateModRole.some(role => memberRoles.includes(role));

        if (!hasPermission || !allowedChannel) {
            return await interaction.reply('You do not have the required permissions.');
        }

        let modId = interaction.options.getString('modid');
        const customModId = interaction.options.getString('customid');

        // If the user selected a custom mod ID, use that instead of the default one
        if (modId === ' ' && customModId) {
            modId = customModId;
        }

        if (!modId) {
            return await interaction.reply('Please provide a valid mod ID.');
        }

        const commandInfo = [
            {
                command: `/usr/games/steamcmd +force_install_dir "${serverConfig.modPath}" +login anonymous +workshop_download_item 393380 ${modId} validate +quit`,
                description: 'Downloading mod from Steam Workshop',
                checkOutput: (output) => output.includes('Success'),
            },
            {
                command: `rm -r ${serverConfig.modPath}/${modId}`,
                description: 'Deleting old mod directory',
                checkOutput: (output) => true,
            },
            {
                command: 'sleep 1m',
                description: '1 minute delay',
                checkOutput: () => true,
            },
            {
                command: `mv ${serverConfig.modPath}/steamapps/workshop/content/393380/${modId} ${serverConfig.modPath}`,
                description: 'Moving mod to the good mod directory',
                checkOutput: (output) => true,
            },
            {
                command: `rm -r ${serverConfig.modPath}/steamapps`,
                description: 'Deleting steamapps directory',
                checkOutput: (output) => true,
            },
        ];

        await executeCommands(interaction, commandInfo, serverConfig.ssh);
    } catch (error) {
        console.error(error);
        await interaction.reply('There was an error while trying to execute this command!');
    }
}
