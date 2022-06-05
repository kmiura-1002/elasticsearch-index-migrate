// Abstract id type for entity
export interface id {
    value: () => string | undefined;
}

export class MigrateHistoryId implements id {
    private readonly id?: string;

    constructor(id?: string) {
        this.id = id;
    }

    value(): string | undefined {
        return this.id;
    }
}
