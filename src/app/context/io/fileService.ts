import fs from 'fs';
import path from 'path';
import { MigrationData, MigrationFile } from '../../types';
import yaml from 'js-yaml';
import checksum from 'checksum';

export const FILE_NAME_REGEXP = /^([v][0-9]+.[0-9]+.[0-9]+)__([0-9a-zA-Z]+)/;
const ALLOW_LOAD_EXTENSIONS = ['.json', '.yaml', '.yml'];

function findFiles(dir: string, callback?: (data: string) => void): void {
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

function findAllFiles(dir: string[]): string[] {
    const paths: string[] = [];
    dir.forEach((value) => {
        findFiles(value, (data) => paths.push(data));
    });
    return paths;
}

export function loadMigrationScriptFile(migrantName: string, locations: string[]): MigrationData[] {
    const paths = findAllFiles(locations);
    return paths
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
            const migrationFile = (
                value.ext === '.json' ? JSON.parse(readFile) : yaml.load(readFile)
            ) as MigrationFile;
            const match = value.name.match(FILE_NAME_REGEXP);
            const version = match !== null && match.length > 1 ? match[1] : undefined;

            return {
                file: migrationFile,
                version,
                physicalLocation: value,
                checksum: checksum(JSON.stringify(migrationFile))
            };
        });
}
