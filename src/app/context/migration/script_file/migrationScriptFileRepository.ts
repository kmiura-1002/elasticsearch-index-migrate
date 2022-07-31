import { MigrationScriptFileSpec, MigrationScriptFileSpecByLocation } from './spec';
import fs from 'fs';
import path from 'path';
import { MigrationScriptFileEntity } from './migrationScriptFileEntity';

const isMigrationScriptFileSpecByLocation = (
    spec: MigrationScriptFileSpec
): spec is MigrationScriptFileSpecByLocation =>
    typeof spec.migrantName !== undefined && typeof spec.locations !== undefined;

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

export const migrationScriptFileRepository = () => {
    const findByAll = (spec: MigrationScriptFileSpec): MigrationScriptFileEntity[] => {
        if (isMigrationScriptFileSpecByLocation(spec)) {
            const paths = findAllFiles(spec.locations);
            return paths
                .filter((value) => {
                    const migrationFilePath = path.parse(value);
                    // NOTE: migrantNameと同名のディレクトリーがあることを確認
                    return (
                        migrationFilePath.dir.includes(spec.migrantName) &&
                        migrationFilePath.dir.lastIndexOf(spec.migrantName) +
                            spec.migrantName.length ===
                            migrationFilePath.dir.length
                    );
                })
                .map(path.parse)
                .filter((value) => ALLOW_LOAD_EXTENSIONS.includes(value.ext))
                .map((value) => {
                    return MigrationScriptFileEntity.convert(value);
                });
        }
        return [];
    };
    return {
        findByAll
    };
};
