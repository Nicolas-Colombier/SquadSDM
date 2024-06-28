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
    // (0) = Need to be an admin to use this command
    .setDefaultMemberPermissions(0)
    // Define if the command can be used in DM
    .setDMPermission(false)
    .addStringOption(option =>
        option.setName('customid')
            .setDescription('Customized ID')
            .setRequired(false));

export async function execute(interaction) {
    try {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.reply('You do not have the required permissions to use this command.');
        }

        const server = interaction.options.getString('server');
        const serverConfig = config.servers[server];

        let modId = interaction.options.getString('modid');
        const customModId = interaction.options.getString('customid');

        // If the user selected a custom mod ID, use that instead of the default one
        if (modId === ' ' && customModId) {
            modId = customModId;
        }

        if (!modId) {
            return await interaction.reply('Please provide a valid mod ID.');
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
        await interaction.reply('There was an error while trying to execute this command!');
    }
}
