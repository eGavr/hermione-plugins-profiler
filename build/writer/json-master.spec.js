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
const json_master_1 = require("./json-master");
describe('JsonWriterMaster', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('init', () => {
        test('should init writer with root node', () => __awaiter(void 0, void 0, void 0, function* () {
            const writer = new json_master_1.JsonWriterMaster('reporter_dir');
            yield writer.init();
            expect(ensureDirMock).toBeCalledWith('reporter_dir');
            expect(createWriteStreamMock).toBeCalledWith('reporter_dir/plugins.json', { autoClose: true, flags: 'a' });
            expect(writeStreamMock.write).toBeCalledWith('{"root":[');
        }));
    });
    describe('write', () => {
        test('should write previous data and store current to valid brackets ending structure', () => __awaiter(void 0, void 0, void 0, function* () {
            const writer = new json_master_1.JsonWriterMaster('reporter_dir');
            yield writer.init();
            writer.write({ some: 'data' });
            writeStreamMock.write.mockClear();
            writer.write({ some: 'data1' });
            expect(writeStreamMock.write).toBeCalledWith('{"some":"data"},');
        }));
    });
    describe('end', () => {
        test('should close writer with valid brackets structure', () => __awaiter(void 0, void 0, void 0, function* () {
            const writer = new json_master_1.JsonWriterMaster('reporter_dir');
            yield writer.init();
            writer.write({ some: 'data' });
            writeStreamMock.write.mockClear();
            writer.end();
            expect(writeStreamMock.write).toBeCalledWith('{"some":"data"}]}');
        }));
        test('should write empty object if only worker writes data', () => __awaiter(void 0, void 0, void 0, function* () {
            const writer = new json_master_1.JsonWriterMaster('reporter_dir');
            yield writer.init();
            writeStreamMock.write.mockClear();
            writer.end();
            expect(writeStreamMock.write).toBeCalledWith('{}]}');
        }));
    });
});
