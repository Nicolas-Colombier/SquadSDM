import { Client, GatewayIntentBits, Events} from 'discord.js';

import { loadCommands } from "./handlers/commandHandler.js";
import { execute } from "./handlers/interactionHandler.js";
import { loginBot } from "./handlers/loginHandler.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

loginBot(client);

loadCommands(client).then(r => console.log("Commands loading complete.")).catch(console.error);

// Interaction handling
client.on(Events.InteractionCreate, async interaction => {
    try {
        await execute(interaction, client)
    } catch (error) {
        console.error(`Interaction failed`, error);
    }
})