"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonWriterMaster = void 0;
const lodash_1 = __importDefault(require("lodash"));
const json_1 = require("./json");
class JsonWriterMaster extends json_1.BaseWriter {
    constructor() {
        super(...arguments);
        this.buffer = {};
    }
    init() {
        const _super = Object.create(null, {
            init: { get: () => super.init }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.init.call(this);
            this.stream.write('{"root":[');
        });
    }
    write(data) {
        if (!lodash_1.default.isEmpty(this.buffer)) {
            this.stream.write(`${JSON.stringify(this.buffer)},`);
        }
        this.buffer = data;
    }
    end() {
        this.stream.write(`${JSON.stringify(this.buffer)}]}`);
    }
}
exports.JsonWriterMaster = JsonWriterMaster;
