import * as fs from 'fs';
import * as path from 'path';

export function findAllFiles(dir: string, callback?: (data: string) => void) {
    const filenames = fs.readdirSync(dir);
    filenames.forEach((filename) => {
        const fullPath = path.join(dir, filename);
        const stats = fs.statSync(fullPath);
        if (stats.isFile() && callback) {
            callback(fullPath);
        } else if (stats.isDirectory()) {
            findAllFiles(fullPath, callback);
        }
    });
}
