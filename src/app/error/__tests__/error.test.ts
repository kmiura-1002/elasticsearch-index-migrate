import { DomainError } from '../domainError';

describe('DomainError', () => {
    it('can show error stack', () => {
        const actual = () => {
            throw new DomainError('test error');
        };
        expect(actual).toThrow(DomainError);
        expect(actual).toThrow('test error');
    });

    it('can show error stack when nested error obj', () => {
        const actual = () => {
            throw new DomainError('test error', new Error('nested error'));
        };
        expect(actual).toThrow(DomainError);
        expect(actual).toThrow('test error');
    });
});
