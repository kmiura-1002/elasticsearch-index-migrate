import { id } from '../id/id';

// Abstract base entity
export abstract class Entity<T, ID extends id> {
    protected props: T;

    protected constructor(props: T) {
        this.props = props;
    }

    abstract getId(): ID | undefined;
}
