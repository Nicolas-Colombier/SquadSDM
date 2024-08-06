import ssh2 from 'ssh2';
import {chunkString, replaceEscapeSequences} from "./chunkString.js";

// Method to execute a list of commands
export async function executeCommands(interaction, commandInfo, sshConfig) {
    const results = [];
    const maxMessageLength = 1500; // Maximum length of a Discord message

    // Defer the initial response while executing the commands
    await interaction.deferReply();

    for (let index = 0; index < commandInfo.length; index++) {
        const cmd = commandInfo[index];
        try {
            const output = await executeSSHCommand(interaction, cmd.command, sshConfig, cmd.description);
            const status = cmd.checkOutput(output) ? 'Success' : 'Failed';
            results.push(`${index + 1}. ${cmd.description} : ${status}\n${output}\n\n`);

            if (status === 'Failed') {
                console.error(`Command '${cmd.command}' failed with output: ${output}\n`);
                break; // Stop executing further commands if there was a failure.
            }
        } catch (error) {
            results.push(`${index + 1}. ${cmd.description} : Failed\nError: ${error.message}`);
            break;
        }
    }

    await sendResults(interaction, results, maxMessageLength);
}



//----------------------------------------------------------------------------//


// Method to execute a command on the remote server via ssh with keep-alive and live edit replies
function executeSSHCommand(interaction, command, sshConfig, description) {
    return new Promise((resolve, reject) => {
        const ssh = new ssh2.Client();
        ssh.on('ready', () => {
            console.log(`SSH connection ready for command: ${command}`);
            ssh.exec(command, async (err, stream) => {
                if (err) {
                    ssh.end();
                    return reject(err);
                }
                let output = '';
                let lastEdit = Date.now();
                const editInterval = 2000; // Edit reply every 2 seconds to avoid rate limiting
                let liveUpdate = true;

                stream.on('data', async (data) => {
                    output += data.toString();
                    const now = Date.now();

                    if (output.length > 1500) {
                        liveUpdate = false;
                    }

                    if (liveUpdate && (now - lastEdit > editInterval)) {
                        lastEdit = now;
                        const partialCleanOutput = replaceEscapeSequences(output);
                        await interaction.editReply({ content: `\`\`\`${partialCleanOutput}\`\`\`` });
                    }
                });

                stream.stderr.on('data', (data) => {
                    console.error(`SSH : ${data.toString()}`);
                });

                stream.on('close', async () => {
                    ssh.end();
                    const cleanOutput = replaceEscapeSequences(output);
                    console.log(`Command: ${command}\nOutput: ${cleanOutput}`);
                    if (liveUpdate) {
                        await interaction.editReply({ content: `\`\`\`${description} :\n${cleanOutput}\`\`\`` });
                    }
                    resolve(cleanOutput);
                });
            });
        }).on('error', (err) => {
            console.error(`SSH connection error: ${err.message}`);
            reject(err);
        }).on('close', () => {
            console.log('SSH connection closed');
        }).connect({
            ...sshConfig,
            keepaliveInterval: 30 * 1000, // Send keepalive packets every 30 seconds
            keepaliveCountMax: 15, // Maximum keepalive messages before considering the connection dead
            readyTimeout: 0 // Wait indefinitely for the server to respond
        });
    });
}


//----------------------------------------------------------------------------//


// Method to send the results by chunks
async function sendResults(interaction, results, maxMessageLength) {
    let response = '';
    for (const result of results) {
        response += `${result}`;
        if (response.length > maxMessageLength) {
            const chunks = chunkString(response, maxMessageLength-4);
            await interaction.editReply({ content: `\`\`\`${chunks.shift()}\`\`\`` });
            for (const chunk of chunks) {
                await interaction.followUp({ content: `\`\`\`${chunk}\`\`\`` });
            }
            response = '';
        }
    }

    if (response.length > 0) {
        await interaction.editReply({ content: `\`\`\`${response}\`\`\`` });
    }
}

