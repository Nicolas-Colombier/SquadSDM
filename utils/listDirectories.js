import { Client } from 'ssh2';

export function listDirectories(directory, sshConfig) {
    return new Promise((resolve, reject) => {
        const conn = new Client();

        conn.on('ready', () => {
            conn.exec(`ls -d ${directory}*/`, (err, stream) => {
                if (err) {
                    conn.end();
                    return reject(err);
                }

                let output = '';

                // Gathering data from the stream
                stream.on('data', (data) => {
                    output += data.toString();
                });

                // Triggered events when the stream is closed
                stream.on('close', (code, signal) => {
                    const directories = output
                        .split('\n') // Line splitting
                        .filter(line => line.trim().length > 0) // Filtering empty lines
                        .map(line => line.trim().replace(directory, '').replace('/', '')) // Formatting the output
                        .filter(dir => dir.length > 0); // Filtering empty directories
                    conn.end(); // Closing the connection
                    resolve(directories); // Resolution of the promise with the list of directories
                });

                // Error handling
                stream.on('error', (err) => {
                    conn.end();
                    reject(err);
                });
            });
        }).connect(sshConfig); // Connection to the server with the specified SSH configuration

        // Error handling on connection
        conn.on('error', (err) => {
            reject(err);
        });
    });
}
