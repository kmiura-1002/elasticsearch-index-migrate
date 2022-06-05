import { Entity } from '../base/entity/entity';
import { MigrateHistoryId } from '../base/id';
import { MigrateIndex } from '../../types';
import { format } from 'date-fns';

export class MigrateHistoryEntity extends Entity<MigrateIndex, MigrateHistoryId> {
    private readonly id: MigrateHistoryId | undefined;

    private constructor(id: MigrateHistoryId | undefined, param: MigrateIndex) {
        super(param);
        this.id = id;
    }
    static makeHistory({
        id,
        param
    }: {
        id?: MigrateHistoryId;
        param: Partial<MigrateIndex>;
    }): MigrateHistoryEntity {
        // todo add validates
        return new MigrateHistoryEntity(id, {
            index_name: param?.index_name ?? '',
            migrate_version: param?.migrate_version ?? '',
            description: param?.description ?? 'Migration baseline', // magic number?
            script_name: param?.script_name ?? '',
            script_type: param?.script_type ?? '',
            installed_on: param?.installed_on ?? format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"), // todo format pattern
            execution_time: param?.execution_time ?? 0,
            success: param?.success ?? true,
            checksum: param?.checksum
        });
    }

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
