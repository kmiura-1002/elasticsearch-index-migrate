import { Command } from '@oclif/command';
import { cli } from 'cli-ux';

// ToDo Delete(v1.0.0) this function after removing the flags.
export function validMigrateTarget() {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    return function (
        _target: Command,
        _propertyKey: string,
        descriptor: TypedPropertyDescriptor<() => Promise<void>>
    ) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const originalCommand = descriptor.value!;
        descriptor.value = async function (this: Command, ...cmdArgs: unknown[]) {
            await validate.call(this, originalCommand, cmdArgs);
        };
    };
}

async function validate(
    this: Command,
    originalRunCommand: (...args: unknown[]) => Promise<void>,
    cmdArgs: unknown[]
) {
    const { flags, args } = this.parse();
    const { indexName } = flags as any;

    if (indexName) {
        cli.warn(
            'The index flags will be removed in the version 1.0.0. Please use the arguments (name) instead of this flags.'
        );
    }

    if (!indexName && !args.name) {
        cli.error(`Migration target is unknown. Please specify an argument (name).`);
    }

    await originalRunCommand.apply(this, cmdArgs);
}
