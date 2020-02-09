import * as fs from 'fs';
import * as path from 'path';

export function findFiles(dir: string, callback?: (data: string) => void) {
    const filenames = fs.readdirSync(dir);
    filenames.forEach((filename) => {
        const fullPath = path.join(dir, filename);
        const stats = fs.statSync(fullPath);
        if (stats.isFile() && callback) {
            callback(fullPath);
        } else if (stats.isDirectory()) {
            findFiles(fullPath, callback);
        }
    });
}

export function findAllFiles(dir: string[]): string[] {
    const paths: string[] = [];
    dir.forEach((value) => {
        findFiles(path.join(process.cwd(), value), (data) => paths.push(data));
    });
    return paths;
}
