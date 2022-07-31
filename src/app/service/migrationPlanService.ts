import { MigrationExplainPlan, MigrationPlanData, MigrationStates, Version } from '../types';
import { compare, valid } from 'semver';
import { errors as Es6Errors } from 'es6';
import { errors as Es7Errors } from 'es7';
import { getBaselineVersion } from './migrationConfigService';
import { MigrationExplainDataEntity } from '../context/migration/execute_statements/migrationExplainDataEntity';
import { IndexNotFoundError } from '../error/IndexNotFoundError';
import { MigrationExplainValidationDomainService } from '../context/migration/execute_statements/MigrationExplainValidationDomainService';
import { Config } from '@oclif/core';
import { toolConfigRepository } from '../context/config_domain/toolConfigRepository';
import { ToolConfigSpec } from '../context/config_domain/spec';
import { migrationExplainDomainService } from '../context/migration/execute_statements/migrationExplainDomainService';

export const migrationPlanService = (
    targetName: string,
    flags: { [name: string]: any },
    config: Config
) => {
    const executeConfig = {
        ignored: flags.ignoredMigrations,
        future: false,
        missing: false,
        outOfOrder: false,
        pending: false
    };

    const refresh = async (): Promise<MigrationExplainPlan> => {
        const configEntity = await toolConfigRepository().findBy(new ToolConfigSpec(flags, config));
        const baseline = getBaselineVersion(targetName, configEntity.allMigrationConfig);

        try {
            const migrationPlanMap = await migrationExplainDomainService(
                targetName,
                baseline,
                [configEntity.migrationTargetConfig.location],
                configEntity.elasticsearchConfig
            );

            return makeMigrationExplainPlan(migrationPlanMap);
        } catch (e) {
            if (e instanceof Es6Errors.ResponseError || e instanceof Es7Errors.ResponseError) {
                if (e.message === 'index_not_found_exception') {
                    throw new IndexNotFoundError(
                        'History index not found.\n' +
                            'Please check if migrate_history exists in Elasticsearch.',
                        e
                    );
                }
            }
            throw e;
        }
    };

    const validate = async (plan?: MigrationExplainPlan) => {
        const explainPlans = plan?.all ?? (await refresh()).all;

        return explainPlans
            .map((plan) => MigrationExplainValidationDomainService.valid(plan, executeConfig))
            .filter(Boolean)
            .join('\n');
    };

    const migrate = async (plan?: MigrationExplainPlan) => {
        const explainPlans = plan?.pending ?? (await refresh()).pending;
        console.log(explainPlans);
    };

    return {
        refresh,
        validate,
        migrate
    };
};

const makeMigrationExplainPlan = (map: Map<Version, MigrationExplainDataEntity>) => {
    const sortedKeys = Array.from(map.keys())
        .filter((value) => valid(value))
        .sort((a, b) => compare(a, b));

    const migrationPlans: MigrationPlanData[] = [];
    sortedKeys.forEach((version) => {
        const migrationPlan = map.get(version);
        if (migrationPlan?.resolvedMigration && migrationPlan?.appliedMigration === undefined) {
            migrationPlans.push(
                MigrationExplainDataEntity.generateExecuteStatement(
                    migrationPlan.baseline,
                    migrationPlan.lastResolved,
                    migrationPlan.lastApplied,
                    migrationPlan.resolvedMigration,
                    migrationPlan.appliedMigration
                ).toMigrationPlanData()
            );
        } else if (migrationPlan) {
            migrationPlans.push(migrationPlan.toMigrationPlanData());
        }
    });

    return {
        all: migrationPlans,
        pending: migrationPlans.filter((value) => value.state?.status === MigrationStates.PENDING)
    };
};
