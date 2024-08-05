// Method to chunk a string into smaller strings
export function chunkString(str, chunkSize) {
    const chunks = [];
    for (let i = 0; i < str.length; i += chunkSize) {
        chunks.push(str.slice(i, i + chunkSize));
    }
    return chunks;
}

export function replaceEscapeSequences(text) {
    // Strip color codes
    text = text.replace(/\x1b\[[0-9;]*m/g, '');

    // redact the RCON password
    const rconLine = text.match(/RCON\s+password:\s+.+/i);
    if (rconLine) {
        const redactedLine = rconLine[0].replace(/:.+/, ':  ******');
        text = text.replace(rconLine[0], redactedLine);
    }

    return text;
}