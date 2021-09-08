import { BaseWriter } from './json';

export class JsonWriterWorker extends BaseWriter {
    public write(data: unknown) {
        this.stream.write(`${JSON.stringify(data)},`);
    }
}
