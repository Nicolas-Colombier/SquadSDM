import config from '../config.json' assert { type: "json" };
import { ActivityType } from 'discord.js';

export async function loginBot(client) {
    let ok = false;
    let tries = 0;
    const maxTries = 3;

    if (config.token !== "") {
        try {

            // Tant que le bot n'est pas connecté et que le nombre de tentatives est inférieur à maxTries, tenter de se connecter.
            while (ok === false && tries < maxTries) {
                ok = await client.login(config.token)
                    .then(() => {
                        client.user.setActivity(config.activity, { type: ActivityType.Watching });

                        client.once('ready', () => {
                            console.log(`Connecté en tant que ${client.user.tag} sur ${client.guilds.cache.size} serveurs.`);

                            // Liste des serveurs sur lesquels le bot est connecté.
                            client.guilds.cache.forEach(guild => {
                                console.log(` - ${guild.name}`);
                            });
                        });
                        return true
                    })
                    .catch(async (error) => {
                        console.log(`${error} Nouvel essai...`);
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        tries++;
                        return false
                    });
            }

            // Si après maxTries tentatives le bot n'est pas connecté, gérer l'erreur.
            if (tries === maxTries) {
                console.error('ERROR : Impossible de se connecter après plusieurs tentatives.');
            }

        } catch (error) {
            console.error(`ERROR : Connexion impossible : ${error}`)
        }
    }
}