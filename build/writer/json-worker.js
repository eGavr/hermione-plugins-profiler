"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonWriterWorker = void 0;
const json_1 = require("./json");
class JsonWriterWorker extends json_1.BaseWriter {
    write(data) {
        this.stream.write(`${JSON.stringify(data)},`);
    }
}
exports.JsonWriterWorker = JsonWriterWorker;
