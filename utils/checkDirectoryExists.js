import { Client } from 'ssh2';

export function checkDirectoryExists(directory, sshConfig) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () => {
            conn.exec(`test -d "${directory}" && echo "exists" || echo "not exists"`, (err, stream) => {
                if (err) {
                    conn.end();
                    return reject(err);
                }

                let output = '';
                stream.on('close', () => {
                    conn.end();
                    resolve(output.trim() === 'exists');
                }).on('data', (data) => {
                    output += data.toString();
                });
            });
        }).connect(sshConfig);
    });
}
