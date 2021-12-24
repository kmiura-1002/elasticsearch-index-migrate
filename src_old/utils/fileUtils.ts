import fs from 'fs';
import path from 'path';
import { ResolvedMigration } from '../model/types';
import { ParsedPath } from 'path';

export const indexNameRegexp = /[-_]/;
export const fileNameRegexp = /^([v][0-9]+.[0-9]+.[0-9]+)__([0-9a-zA-Z]+)/;

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

function makeParentPath(
    indexName: string,
    isNaturalIndexName: boolean,
    indexVersion?: string
): string {
    if (isNaturalIndexName) {
        return indexVersion ? indexName + '/' + indexVersion : indexName;
    }
    return indexName.split(indexNameRegexp).join('/');
}

export function loadMigrationScriptFilePaths(
    indexName: string,
    migrationFilePaths: string[],
    isNaturalIndexName: boolean,
    indexVersion?: string
): path.ParsedPath[] {
    return migrationFilePaths
        .filter((value) => {
            const parentPath = makeParentPath(indexName, isNaturalIndexName, indexVersion);
            const migrationFilePath = path.parse(value);
            return (
                migrationFilePath.dir.includes(parentPath) &&
                migrationFilePath.dir.lastIndexOf(parentPath) + parentPath.length ===
                    migrationFilePath.dir.length
            );
        })
        .map(path.parse)
        .filter((value) => value.ext === '.json');
}

export function loadMigrationScripts(migrationFileParsedPath: ParsedPath[]): ResolvedMigration[] {
    return migrationFileParsedPath.map((value) => {
        const resolvedMigration = JSON.parse(
            fs.readFileSync(path.join(value.dir, value.base), 'utf8')
        ) as ResolvedMigration;
        resolvedMigration.physicalLocation = value;
        const match = value.name.match(fileNameRegexp) as RegExpMatchArray;
        if (match !== null && match.length > 1) {
            resolvedMigration.version = match[1];
        }
        return resolvedMigration;
    });
}
