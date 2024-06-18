import { Client } from 'ssh2';
import sshConfig from '../sshConfig.json' assert { type: "json" };

export function listDirectories(directory) {
    return new Promise((resolve, reject) => {
        const conn = new Client();

        conn.on('ready', () => {
            conn.exec(`ls -d ${directory}*/`, (err, stream) => {
                if (err) {
                    conn.end();
                    return reject(err);
                }

                let output = '';

                // Accumulation des données reçues
                stream.on('data', (data) => {
                    output += data.toString();
                });

                // Événement déclenché lorsque le flux de données est fermé
                stream.on('close', (code, signal) => {
                    const directories = output
                        .split('\n') // Séparation des lignes
                        .filter(line => line.trim().length > 0) // Filtrage des lignes vides
                        .map(line => line.trim().replace(directory, '').replace('/', '')) // Suppression du chemin de base et du '/' final
                        .filter(dir => dir.length > 0); // S'assurer que les noms de répertoires ne sont pas vides
                    conn.end(); // Fermeture de la connexion SSH
                    resolve(directories); // Résolution de la promesse avec la liste des répertoires
                });

                // Gestion des erreurs sur le flux de données
                stream.on('error', (err) => {
                    conn.end();
                    reject(err);
                });
            });
        }).connect(sshConfig); // Connexion au serveur SSH avec la configuration spécifiée

        // Gestion des erreurs sur la connexion
        conn.on('error', (err) => {
            reject(err);
        });
    });
}
