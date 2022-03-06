import { Stats } from 'fs';

export class MockStats implements Stats {
    atime: Date;
    atimeMs: number;
    birthtime: Date;
    birthtimeMs: number;
    blksize: number;
    blocks: number;
    ctime: Date;
    ctimeMs: number;
    dev: number;
    gid: number;
    ino: number;
    mode: number;
    mtime: Date;
    mtimeMs: number;
    nlink: number;
    rdev: number;
    size: number;
    uid: number;
    constructor() {
        this.atime = new Date();
        this.atimeMs = 0;
        this.birthtime = new Date();
        this.birthtimeMs = 0;
        this.blksize = 0;
        this.blocks = 0;
        this.ctime = new Date();
        this.ctimeMs = 0;
        this.dev = 0;
        this.gid = 0;
        this.ino = 0;
        this.mode = 0;
        this.mtime = new Date();
        this.mtimeMs = 0;
        this.nlink = 0;
        this.rdev = 0;
        this.size = 0;
        this.uid = 0;
    }

    isBlockDevice(): boolean {
        return false;
    }

    isCharacterDevice(): boolean {
        return false;
    }

    isDirectory(): boolean {
        return false;
    }

    isFIFO(): boolean {
        return false;
    }

    isFile(): boolean {
        return true;
    }

    isSocket(): boolean {
        return false;
    }

    isSymbolicLink(): boolean {
        return false;
    }
}
