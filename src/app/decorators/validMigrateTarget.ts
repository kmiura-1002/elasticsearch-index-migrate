import { CliUx, Command } from '@oclif/core';

export function validMigrateTarget() {
    return function (
        _target: Command,
        _propertyKey: string,
        descriptor: TypedPropertyDescriptor<() => Promise<void>>
    ) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const originalCommand = descriptor.value!;
        descriptor.value = async function (this: Command, ...cmdArgs: unknown[]) {
            await setUpCommand.call(this, originalCommand, cmdArgs);
        };
    };
}

async function setUpCommand(
    this: Command,
    originalRunCommand: (...args: unknown[]) => Promise<void>,
    cmdArgs: unknown[]
) {
    const { flags, args } = await this.parse();
  CliUx.ux.info(JSON.stringify(this.id));
    if (!flags.index && !args.name) {
        CliUx.ux.error(`Migration target is unknown. Please specify an argument (name).`);
    }

    await originalRunCommand.apply(this, cmdArgs);
}
