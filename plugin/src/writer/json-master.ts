import _ from "lodash";

import { BaseWriter } from "./json";

export class JsonWriterMaster extends BaseWriter {
  protected buffer: any = {};

  public async init() {
    await super.init();
    this.stream.write("{\"root\":[");
  }

  public write(data: any) {
    if (!_.isEmpty(this.buffer)) {
      this.stream.write(`${JSON.stringify(this.buffer)},`);
    }

    this.buffer = data;
  }

  public end() {
    this.stream.write(`${JSON.stringify(this.buffer)}]}`);
  }
}
