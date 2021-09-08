import { BaseWriter } from './json';
export declare class JsonWriterMaster extends BaseWriter {
    protected buffer: unknown;
    init(): Promise<void>;
    write(data: unknown): void;
    end(): void;
}
