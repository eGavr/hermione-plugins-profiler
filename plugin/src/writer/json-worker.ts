import { BaseWriter } from "./json";

export class JsonWriterWorker extends BaseWriter {
  public write(data: any) {
    this.stream.write(`${JSON.stringify(data)},`);
  }
}
