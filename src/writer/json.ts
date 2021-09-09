import path from 'path';

import fs from 'fs-extra';

import { IWriter } from '.';

export class BaseWriter implements IWriter {
    protected stream!: fs.WriteStream;

    constructor(
        private readonly reportPath: string,
        private readonly targetName: string = 'plugins.json'
    ) {}

    public async init() {
        await fs.ensureDir(this.reportPath);

        const targetPath = path.join(
            this.reportPath,
            this.targetName
        );

        this.stream = fs.createWriteStream(targetPath, {
            flags: 'a',
            autoClose: true,
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public write(_data: unknown) {}
    public end() {}
}
