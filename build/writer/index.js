"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonWriterWorker = exports.JsonWriterMaster = void 0;
var json_master_1 = require("./json-master");
Object.defineProperty(exports, "JsonWriterMaster", { enumerable: true, get: function () { return json_master_1.JsonWriterMaster; } });
var json_worker_1 = require("./json-worker");
Object.defineProperty(exports, "JsonWriterWorker", { enumerable: true, get: function () { return json_worker_1.JsonWriterWorker; } });
