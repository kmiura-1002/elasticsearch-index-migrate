import fs from 'fs';
import path from 'path';
import { ResolvedMigration } from '../../types';
import yaml from 'js-yaml';

export const FILE_NAME_REGEXP = /^([v][0-9]+.[0-9]+.[0-9]+)__([0-9a-zA-Z]+)/;
const ALLOW_LOAD_EXTENSIONS = ['.json', '.yaml', '.yml'];

export function findFiles(dir: string, callback?: (data: string) => void): void {
    const filenames = fs.readdirSync(path.relative(process.cwd(), dir));
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
        findFiles(value, (data) => paths.push(data));
    });
    return paths;
}

export function loadMigrationScriptFilePaths(migrantName: string, migrationFilePaths: string[]) {
    return migrationFilePaths
        .filter((value) => {
            const migrationFilePath = path.parse(value);
            // NOTE: migrantNameと同名のディレクトリーがあることを確認
            return (
                migrationFilePath.dir.includes(migrantName) &&
                migrationFilePath.dir.lastIndexOf(migrantName) + migrantName.length ===
                    migrationFilePath.dir.length
            );
        })
        .map(path.parse)
        .filter((value) => ALLOW_LOAD_EXTENSIONS.includes(value.ext))
        .map((value) => {
            const readFile = fs.readFileSync(path.join(value.dir, value.base), 'utf8');
            const resolvedMigration = (
                value.ext === '.json' ? JSON.parse(readFile) : yaml.load(readFile)
            ) as ResolvedMigration;

            resolvedMigration.physicalLocation = value;
            const match = value.name.match(FILE_NAME_REGEXP);
            if (match !== null && match.length > 1) {
                resolvedMigration.version = match[1];
            }
            return resolvedMigration;
        });
}

// export function loadMigrationScripts(migrationFileParsedPath: ParsedPath[]): ResolvedMigration[] {
//     return migrationFileParsedPath.map((value) => {
//         const resolvedMigration = JSON.parse(
//             fs.readFileSync(path.join(value.dir, value.base), 'utf8')
//         ) as ResolvedMigration;
//         resolvedMigration.physicalLocation = value;
//         const match = value.name.match(FILE_NAME_REGEXP) as RegExpMatchArray;
//         if (match !== null && match.length > 1) {
//             resolvedMigration.version = match[1];
//         }
//         return resolvedMigration;
//     });
// }
