import ssh2 from 'ssh2';
import sshConfig from '../sshConfig.json' assert { type: "json" };
import { chunkString } from "./chunkString.js";

export async function executeCommands(interaction, commandInfo) {
    const results = [];
    const maxMessageLength = 1500; // Maximum length of a Discord message

    // Différer la réponse initiale
    await interaction.deferReply();

    for (let index = 0; index < commandInfo.length; index++) {
        const cmd = commandInfo[index];
        try {
            const output = await executeSSHCommand(cmd.command);
            const status = cmd.checkOutput(output) ? 'Réussi' : 'Échec';
            results.push(`${index + 1}. ${cmd.description} : ${status}\n${output}`);
        } catch (error) {
            results.push(`${index + 1}. ${cmd.description} : Échec\nErreur: ${error.message}`);
        }
    }

    await sendResults(interaction, results, maxMessageLength);
}


//----------------------------------------------------------------------------//


// Fonction pour exécuter une commande SSH
function executeSSHCommand(command) {
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
                    resolve(output);
                });
            });
        }).on('error', reject)
            .connect(sshConfig);
    });
}


//----------------------------------------------------------------------------//


// Fonction pour envoyer les résultats par morceaux
async function sendResults(interaction, results, maxMessageLength) {
    let response = '';
    for (const result of results) {
        response += `\`\`\`${result}\`\`\``;
        if (response.length > maxMessageLength) {
            const chunks = chunkString(response, maxMessageLength);
            await interaction.editReply({ content: `${chunks.shift()}\`\`\`` });
            for (const chunk of chunks) {
                await interaction.followUp({ content: `\`\`\`${chunk}` });
            }
            response = '';
        }
    }

    if (response.length > 0) {
        await interaction.editReply({ content: response });
    }
}

