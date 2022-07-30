export type MigrationScriptFileSpec = {
    [key: string]: any;
};

export class migrationScriptFileSpecByLocation implements MigrationScriptFileSpec {
    readonly migrantName: string;
    readonly locations: string[];

    constructor(migrantName: string, locations: string[]) {
        this.locations = locations;
        this.migrantName = migrantName;
    }
}