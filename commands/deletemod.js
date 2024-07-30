import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import config from '../config.json' with { type: "json" };
import { executeCommands } from '../utils/executeCommands.js';
import { checkDirectoryExists } from "../utils/checkDirectoryExists.js";

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
    .setName('deletemod')
    .setDescription('Delete a mod')
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
        const hasPermission = serverConfig.roles.deleteModRole.some(role => memberRoles.includes(role));

        if (!hasPermission || !allowedChannel) {
            await interaction.reply({ content: 'You do not have the required permissions.', ephemeral: true });
            return;
        }

        let modId = interaction.options.getString('modid');
        const customModId = interaction.options.getString('customid');

        // If the user selected a custom mod ID, use that instead of the default one
        if (modId === ' ' && customModId) {
            modId = customModId;
        }

        if (!modId) {
            return await interaction.reply({ content: 'Please provide a valid mod ID.', ephemeral: true });
        }

        const modDirectory = serverConfig.modPath + "/" + modId;

        const directoryExists = await checkDirectoryExists(modDirectory, serverConfig.ssh);

        if (!directoryExists) {
            await interaction.reply(`\`\`\`The mod "${modId}" does not exist.\`\`\``);
            return;
        }

        const commandInfo = [
            {
                command: `rm -rf ${modDirectory}`,
                description: `Deleting mod "${modId}"`,
                checkOutput: (output) => !output.toLowerCase().includes('error'),
            },
        ];

        await executeCommands(interaction, commandInfo, serverConfig.ssh);
    } catch (error) {
        console.error(error);
        if (!interaction.replied) {
            await interaction.reply({
                content: 'There was an error while trying to execute this command!',
                ephemeral: true
            });
        } else if (interaction.deferred) {
            await interaction.followUp({
                content: 'There was an error while trying to execute this command!',
                ephemeral: true
            });
        }
    }
}
