// Method to chunk a string into smaller strings
export function chunkString(str, chunkSize) {
    const chunks = [];
    for (let i = 0; i < str.length; i += chunkSize) {
        chunks.push(str.slice(i, i + chunkSize));
    }
    return chunks;
}

export function replaceEscapeSequences(text) {
    // Strip color and cursor control escape sequences
    text = text.replace(/\x1b\[[0-9;]*[mK]/g, '');

    // Redact the RCON password
    const rconLine = text.match(/RCON\s+password:\s+.+/i);
    if (rconLine) {
        const redactedLine = rconLine[0].replace(/:.+/, ':  ******');
        text = text.replace(rconLine[0], redactedLine);
    }

    // Remove '[ .... ]'
    text = text.replace(/\[ \.\.\.\. \] /g, '');

    return text;
}