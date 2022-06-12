import { Entity } from '../../base/entity/entity';
import { MigrateIndex, MigrationTypes } from '../../../types';
import { ValidationError } from '../../error/ValidationError';
import { format } from 'date-fns';
import { DATE_FORMAT } from '../../../definision';
import { MigrateHistoryId } from '../../base/id/migrateHistoryId';

export class MigrateHistoryEntity extends Entity<MigrateIndex, MigrateHistoryId> {
    private readonly id: MigrateHistoryId | undefined;

    private constructor(id: MigrateHistoryId | undefined, param: MigrateIndex) {
        super(param);
        this.id = id;
    }

    static generateBaseline(param: {
        baselineIndexName: string;
        baseline: string;
        description: string;
    }): MigrateHistoryEntity {
        return this.generate({
            param: {
                index_name: param.baselineIndexName,
                migrate_version: param.baseline,
                description: param.description,
                success: true,
                installed_on: format(new Date(), DATE_FORMAT),
                execution_time: 0,
                script_name: '',
                script_type: MigrationTypes.BASELINE,
                checksum: ''
            }
        });
    }

    static generate({
        id,
        param
    }: {
        id?: MigrateHistoryId;
        param: MigrateIndex;
    }): MigrateHistoryEntity {
        this.validate(param);

        return new MigrateHistoryEntity(id, {
            index_name: param.index_name,
            migrate_version: param.migrate_version,
            description: param.description,
            script_name: param.script_name,
            script_type: param.script_type,
            installed_on: param.installed_on,
            execution_time: param.execution_time,
            success: param.success,
            checksum: param.checksum
        });
    }

    private static validate = (param: MigrateIndex) => {
        const messages: string[] = [];
        if (!Object.keys(MigrationTypes).includes(param.script_type)) {
            messages.push(`You cannot set "${param.script_type}" in script_type.
            script_type can be set to ${Object.keys(MigrationTypes).join(', ')}`);
        }
        // if (!isMatch(param.installed_on, "yyyy-MM-dd'T'HH:mm:ss")) {
        //     messages.push('The format of installed_on must be "yyyy-MM-dd\'T\'HH:mm:ss"');
        // }

        if (messages.length > 0) throw new ValidationError(messages.join('\n'));
    };

    getId(): MigrateHistoryId | undefined {
        return this.id;
    }
    get indexName(): string {
        return this.props.index_name;
    }
    get migrateVersion(): string {
        return this.props.migrate_version;
    }
    get description(): string {
        return this.props.description;
    }
    get scriptName(): string {
        return this.props.script_name;
    }
    get scriptType(): string {
        return this.props.script_type;
    }
    get installedOn(): string {
        return this.props.installed_on;
    }
    get executionTime(): number {
        return this.props.execution_time;
    }
    get isSuccess(): boolean {
        return this.props.success;
    }
    get checksum(): string | undefined {
        return this.props.checksum;
    }
}
