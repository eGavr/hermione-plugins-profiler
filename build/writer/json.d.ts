/// <reference types="node" />
import fs from 'fs-extra';
import { IWriter } from '.';
export declare class BaseWriter implements IWriter {
    private readonly reportPath;
    private readonly targetName;
    protected stream: fs.WriteStream;
    constructor(reportPath: string, targetName?: string);
    init(): Promise<void>;
    write(_data: unknown): void;
    end(): void;
}
