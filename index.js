import { Client, GatewayIntentBits, Events} from 'discord.js';

import { loadCommands } from "./handlers/commandHandler.js";
import { execute } from "./handlers/interactionHandler.js";
import { loginBot } from "./handlers/loginHandler.js";

// Création du client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Connexion du bot
loginBot(client);

// Chargement des commandes
loadCommands(client).then(r => console.log("Chargement des commandes terminé.")).catch(console.error);

// Gestion des interactions
client.on(Events.InteractionCreate, async interaction => {
    try {
        await execute(interaction, client)
    } catch (error) {
        console.error(`L'intéraction a échoué`, error);
    }
})