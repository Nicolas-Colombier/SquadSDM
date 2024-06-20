import config from '../config.json' assert { type: "json" };
import { ActivityType } from 'discord.js';

export async function loginBot(client) {
    let ok = false;
    let tries = 0;
    const maxTries = 3;

    if (config.token !== "") {
        try {

            // While the bot is not connected and the number of tries is less than maxTries, try to connect.
            while (ok === false && tries < maxTries) {
                ok = await client.login(config.token)
                    .then(() => {
                        client.user.setActivity(config.activity, { type: ActivityType.Watching });

                        client.once('ready', () => {
                            console.log(`Connected as ${client.user.tag} on ${client.guilds.cache.size} servers.`);

                            // List all servers the bot is connected to
                            client.guilds.cache.forEach(guild => {
                                console.log(` - ${guild.name}`);
                            });
                        });
                        return true
                    })
                    .catch(async (error) => {
                        console.log(`${error} New try...`);
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        tries++;
                        return false
                    });
            }

            // If the bot is not connected after maxTries, display an error message.
            if (tries === maxTries) {
                console.error('ERROR : impossible to connect after 3 tries.');
            }

        } catch (error) {
            console.error(`ERROR : Connection impossible : ${error}`)
        }
    }
}