import 'mocha';
import { expect } from 'chai';
import StopWatch from '../../src/utils/stopWatch';

describe('StopWatch test', () => {
    it('Call the start function before calling the stop function.', () => {
        const sw = new StopWatch();
        expect(() => sw.stop()).to.throw(
            'Call the start function before calling the stop function.'
        );
    });

    it('Call the stop function before calling the read function. #1', () => {
        const sw = new StopWatch();
        sw.start();
        expect(() => sw.read()).to.throw(
            'Call the stop function before calling the read function.'
        );
    });

    it('Call the stop function before calling the read function. #2', () => {
        const sw = new StopWatch();
        expect(() => sw.read()).to.throw(
            'Call the stop function before calling the read function.'
        );
    });

    it('Measurement of processing time', () => {
        const sw = new StopWatch();
        sw.start();
        sw.stop();

        expect(sw.read()).greaterThan(0);
    });
});
