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
Object.defineProperty(exports, "__esModule", { value: true });
const writeStreamMock = {
    write: jest.fn(),
    end: jest.fn(),
};
const createWriteStreamMock = jest.fn();
const ensureDirMock = jest.fn();
const fs = {
    ensureDir: ensureDirMock,
    createWriteStream: createWriteStreamMock.mockReturnValue(writeStreamMock),
};
jest.mock('fs-extra', () => fs);
const json_worker_1 = require("./json-worker");
describe('JsonWriterWorker', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('init', () => {
        test('should init writer with root node', () => __awaiter(void 0, void 0, void 0, function* () {
            const writer = new json_worker_1.JsonWriterWorker('reporter_dir');
            yield writer.init();
            expect(ensureDirMock).toBeCalledWith('reporter_dir');
            expect(createWriteStreamMock).toBeCalledWith('reporter_dir/plugins.json', { autoClose: true, flags: 'a' });
            expect(writeStreamMock.write).not.toBeCalled();
        }));
    });
    describe('write', () => {
        test('should write data directly to the stream', () => __awaiter(void 0, void 0, void 0, function* () {
            const writer = new json_worker_1.JsonWriterWorker('reporter_dir');
            yield writer.init();
            writeStreamMock.write.mockClear();
            writer.write({ some: 'data' });
            expect(writeStreamMock.write).toBeCalledWith('{"some":"data"},');
        }));
    });
    describe('end', () => {
        test('should not write on end', () => __awaiter(void 0, void 0, void 0, function* () {
            const writer = new json_worker_1.JsonWriterWorker('reporter_dir');
            yield writer.init();
            writeStreamMock.write.mockClear();
            writer.end();
            expect(writeStreamMock.write).not.toBeCalled();
        }));
    });
});
