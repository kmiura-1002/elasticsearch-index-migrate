import { Entity } from '../../base/entity';
import { MigrationData, MigrationFile, Version } from '../../../types';
import fs from 'fs';
import path, { ParsedPath } from 'path';
import yaml from 'js-yaml';
import checksum from 'checksum';

const FILE_NAME_REGEXP = /^([v][0-9]+.[0-9]+.[0-9]+)__([0-9a-zA-Z]+)/;

export class MigrationScriptFileEntity extends Entity<MigrationData> {
    private constructor(param: MigrationData) {
        super(param);
    }

    static convert(parsedPath: path.ParsedPath): MigrationScriptFileEntity {
        const readFile = fs.readFileSync(path.join(parsedPath.dir, parsedPath.base), 'utf8');
        const migrationFile = (
            parsedPath.ext === '.json' ? JSON.parse(readFile) : yaml.load(readFile)
        ) as MigrationFile;
        const match = parsedPath.name.match(FILE_NAME_REGEXP);
        const version = match !== null && match.length > 1 ? (match[1] as Version) : undefined;

        return new MigrationScriptFileEntity({
            file: migrationFile,
            version,
            physicalLocation: parsedPath,
            checksum: checksum(JSON.stringify(migrationFile))
        });
    }

    get migrationScript(): MigrationFile {
        return this.props.file;
    }

    get version(): Version | undefined {
        return this.props.version;
    }

    get physicalLocation(): ParsedPath {
        return this.props.physicalLocation;
    }

    get checksum(): string {
        return this.props.checksum;
    }
}
