import type Command from '@oclif/command';

export function CreateMigrationHistoryIfNotExists() {
    return function (
        _target: Command,
        _propertyKey: string,
        descriptor: TypedPropertyDescriptor<() => Promise<void>>
    ) {
        const originalCommand = descriptor.value;
        descriptor.value = async function (this: Command) {
            await setUpCommand.call(this, originalCommand ?? Promise.reject);
        };
    };
}
async function setUpCommand(this: Command, originalRunCommand: () => Promise<void>) {
    const { flags } = this.parse();
    await this.config.runHook('setUpMigrationEnv', {
        config: this.config,
        flags
    });

    await originalRunCommand.apply(this);
}
