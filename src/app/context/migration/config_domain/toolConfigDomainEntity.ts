import { Entity } from '../../base/entity';
import { MigrationConfig } from '../../../types';

export class ToolConfigDomainEntity extends Entity<MigrationConfig> {
    private constructor(param: MigrationConfig) {
        super(param);
    }
}
