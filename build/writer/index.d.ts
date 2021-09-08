export interface IWriter {
    init(): Promise<void>;
    write(data: unknown): void;
    end(): void;
}
export { JsonWriterMaster } from './json-master';
export { JsonWriterWorker } from './json-worker';
