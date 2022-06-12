import { id } from '../id/id';

export interface IdInterface<ID extends id> {
    getId(): ID | undefined;
}

export abstract class Entity<T> {
    protected props: T;

    protected constructor(props: T) {
        this.props = props;
    }
}
