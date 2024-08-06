import ssh2 from 'ssh2';
import {chunkString, replaceEscapeSequences} from "./chunkString.js";

// Method to execute a list of commands
export async function executeCommands(interaction, commandInfo, sshConfig) {
    const results = [];
    const maxMessageLength = 1500; // Maximum length of a Discord message

    // Differ the initial response while executing the commands
    await interaction.deferReply();

    for (let index = 0; index < commandInfo.length; index++) {
        const cmd = commandInfo[index];
        try {
            const output = await executeSSHCommand(cmd.command, sshConfig);
            const status = cmd.checkOutput(output) ? 'Success' : 'Failed' || 'error';
            results.push(`${index + 1}. ${cmd.description} : ${status}\n${output}\n\n`);

            if (status === 'Failed' || status === 'error') {
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


// Method to execute a command on the remote server via ssh
function executeSSHCommand(command, sshConfig) {
    return new Promise((resolve, reject) => {
        const ssh = new ssh2.Client();
        ssh.on('ready', () => {
            ssh.exec(command, (err, stream) => {
                if (err) {
                    ssh.end();
                    return reject(err);
                }
                let output = '';
                stream.on('data', (data) => {
                    output += data.toString();
                });
                stream.on('close', () => {
                    ssh.end();
                    const cleanOutput = replaceEscapeSequences(output);
                    console.log(`Command: ${command}\nOutput: ${cleanOutput}`);
                    resolve(cleanOutput);
                });
            });
        }).on('error', reject)
            .connect(sshConfig);
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

