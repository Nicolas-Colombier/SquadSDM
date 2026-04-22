import { SlashCommandBuilder, PermissionsBitField } from 'discord.js';
import config from '../config.json' with { type: "json" };
import { executeCommands } from '../utils/executeCommands.js';

const SQUAD_DEDICATED_APP_ID = 403240;

// Dynamic generation of choices for servers
const serverChoices = Object.keys(config.servers).map(server => ({
    name: server,
    value: server
}));

function shellEscape(value) {
    return `'${value.replace(/'/g, `'\"'\"'`)}'`;
}

function inferInstallDir(serverConfig) {
    if (serverConfig.installPath) {
        return serverConfig.installPath;
    }

    const expectedSuffix = '/SquadGame/ServerConfig';
    if (serverConfig.serverConfigPath && serverConfig.serverConfigPath.endsWith(expectedSuffix)) {
        return serverConfig.serverConfigPath.slice(0, -expectedSuffix.length);
    }

    return null;
}

export const data = new SlashCommandBuilder()
    .setName('branch')
    .setDescription('Switch Squad dedicated server branch, then update files.')
    .addStringOption(option =>
        option.setName('server')
            .setDescription('Server name')
            .setRequired(true)
            .addChoices(...serverChoices))
    .addStringOption(option =>
        option.setName('target')
            .setDescription('Predefined branch target')
            .setRequired(true)
            .addChoices(
                { name: 'public', value: 'public' },
                { name: 'private_test', value: 'private_test' },
            ))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.UseApplicationCommands)
    .setDMPermission(false);

export async function execute(interaction) {
    try {
        const server = interaction.options.getString('server');
        const target = interaction.options.getString('target');
        const serverConfig = config.servers[server];

        // Check if the command is used in an allowed channel
        const channelId = interaction.channelId;
        const allowedChannel = serverConfig.allowedChannels.includes(channelId);

        // Check if user has any of the allowed roles for the server
        const memberRoles = interaction.member.roles.cache.map(role => role.id);
        const branchRoles = serverConfig.roles.branchRole ?? serverConfig.roles.updateRole ?? [];
        const hasPermission = branchRoles.some(role => memberRoles.includes(role));

        if (!hasPermission || !allowedChannel) {
            await interaction.reply({ content: 'You do not have the required permissions.', ephemeral: true });
            return;
        }

        const installDir = inferInstallDir(serverConfig);
        if (!installDir) {
            await interaction.reply({
                content: 'Unable to determine install directory. Add "installPath" in config.json for this server.',
                ephemeral: true
            });
            return;
        }

        const branches = serverConfig.branches ?? {};
        const publicBranch = branches.public ?? { name: 'public' };
        const privateTestBranch = branches.privateTest ?? branches.private_test;

        const selectedBranch = target === 'private_test' ? privateTestBranch : publicBranch;
        if (!selectedBranch?.name) {
            await interaction.reply({
                content: 'Missing branch config. Add `branches.privateTest.name` in config.json for this server.',
                ephemeral: true
            });
            return;
        }

        const branchName = selectedBranch.name;
        const branchPassword = selectedBranch.password;

        let appUpdateArgs = `${SQUAD_DEDICATED_APP_ID} -beta ${shellEscape(branchName)}`;
        if (branchPassword) {
            appUpdateArgs += ` -betapassword ${shellEscape(branchPassword)}`;
        }
        appUpdateArgs += ' validate';

        const commandInfo = [
            {
                command: `steamcmd -tcp +login anonymous +force_install_dir "${installDir}" +app_update ${appUpdateArgs} +quit`,
                description: `Switching to "${target}" branch (${branchName}) and updating dedicated server`,
                checkOutput: (output) => {
                    const normalized = output.toLowerCase();
                    const hasKnownError = normalized.includes('no subscription')
                        || normalized.includes('invalid password')
                        || normalized.includes('failed to install app')
                        || normalized.includes('error!');
                    const hasSuccess = output.includes(`Success! App '${SQUAD_DEDICATED_APP_ID}' fully installed.`);
                    const isUpToDate = normalized.includes('already up to date');
                    return !hasKnownError && (hasSuccess || isUpToDate);
                },
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
