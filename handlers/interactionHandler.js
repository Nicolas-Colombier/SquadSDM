import { handleCommand } from "./commandHandler.js";
import { handleConfigSelection } from "./configHandler.js";

export const execute = async (interaction, client) => {
    if (interaction.commandName) {
        await handleCommand(interaction, client);
    } else if (interaction.isStringSelectMenu() && interaction.customId === 'selectConfig') {
        await handleConfigSelection(interaction);
    }
}