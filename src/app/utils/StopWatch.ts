import { performance } from 'perf_hooks';

export default class StopWatch {
    private startTime: number;
    private stopTime: number;

    constructor() {
        this.startTime = 0;
        this.stopTime = 0;
    }

    start(): void {
        this.startTime = performance.now();
    }

    stop(): void {
        if (!this.startTime) {
            throw new Error('Call the start function before calling the stop function.');
        }
        this.stopTime = performance.now();
    }

    // return milliseconds
    read(): number {
        if (!this.startTime || !this.stopTime) {
            throw new Error('Call the stop function before calling the read function.');
        }
        return this.stopTime - this.startTime;
    }

    reset(): void {
        this.startTime = 0;
        this.stopTime = 0;
    }
}
