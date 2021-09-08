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
const config_1 = require("./config");
const overwrite_emit_and_wait_1 = require("./overwrite-emit-and-wait");
const wrap_hermione_handler_1 = require("./wrap-hermione-handler");
const writer_1 = require("./writer");
const index_1 = __importDefault(require("./index"));
jest.mock('./writer');
jest.mock('./overwrite-emit-and-wait');
jest.mock('./wrap-hermione-handler');
jest.mock('./config', () => ({ parseConfig: jest.fn((opts) => opts) }));
describe('entry-point', () => {
    let hermione;
    let opts;
    const init = () => (0, index_1.default)(hermione, opts);
    beforeEach(() => {
        hermione = {
            on: jest.fn((_, cb) => {
                cb();
            }),
            isWorker: jest.fn(),
            emitAndWait: jest.fn(),
        };
        opts = {
            reportPath: 'plugins-profiler',
            enabled: true,
        };
        jest.clearAllMocks();
    });
    test('should parse config', () => __awaiter(void 0, void 0, void 0, function* () {
        init();
        expect(config_1.parseConfig).toBeCalledWith(opts);
    }));
    test('should not init plugin if it is disabled', () => __awaiter(void 0, void 0, void 0, function* () {
        opts.enabled = false;
        init();
    }));
    test('should init plugin if it is enabled', () => __awaiter(void 0, void 0, void 0, function* () {
        init();
        expect(wrap_hermione_handler_1.wrapHermioneHandler).toBeCalled();
    }));
    test('should wrap handlers', () => __awaiter(void 0, void 0, void 0, function* () {
        init();
        expect(overwrite_emit_and_wait_1.overwriteEmitAndWait).toBeCalled();
        expect(wrap_hermione_handler_1.wrapHermioneHandler).toBeCalledTimes(3);
        expect(wrap_hermione_handler_1.wrapHermioneHandler).toBeCalledWith('on', expect.anything(), expect.anything());
        expect(wrap_hermione_handler_1.wrapHermioneHandler).toBeCalledWith('prependListener', expect.anything(), expect.anything());
        expect(wrap_hermione_handler_1.wrapHermioneHandler).toBeCalledWith('intercept', expect.anything(), expect.anything());
    }));
    test('should create writer for master', () => __awaiter(void 0, void 0, void 0, function* () {
        hermione.isWorker.mockReturnValue(false);
        init();
        expect(writer_1.JsonWriterMaster).toBeCalledWith('plugins-profiler', 'plugins.json');
        expect(writer_1.JsonWriterWorker).not.toBeCalled();
    }));
    test('should create writer for worker', () => __awaiter(void 0, void 0, void 0, function* () {
        hermione.isWorker.mockReturnValue(true);
        init();
        expect(writer_1.JsonWriterWorker).toBeCalledWith('plugins-profiler', 'plugins.json');
        expect(writer_1.JsonWriterMaster).not.toBeCalled();
    }));
    describe('writer', () => {
        const getEmitAndWaitArgs = () => {
            const [calls] = overwrite_emit_and_wait_1.overwriteEmitAndWait.mock.calls;
            return calls[0];
        };
        describe('master', () => {
            let args;
            beforeEach(() => {
                hermione.isWorker.mockReturnValue(false);
                init();
                args = getEmitAndWaitArgs();
            });
            test("should call 'init' on writer", () => __awaiter(void 0, void 0, void 0, function* () {
                yield args.onInit();
                expect(writer_1.JsonWriterMaster.prototype.init).toBeCalled();
            }));
            test("should call 'end' on writer", () => __awaiter(void 0, void 0, void 0, function* () {
                yield args.onFinish();
                expect(writer_1.JsonWriterMaster.prototype.end).toBeCalled();
            }));
        });
        describe('worker', () => {
            let args;
            beforeEach(() => {
                hermione.isWorker.mockReturnValue(true);
                init();
                args = getEmitAndWaitArgs();
            });
            test("should call 'init' on writer", () => __awaiter(void 0, void 0, void 0, function* () {
                yield args.onInit();
                expect(writer_1.JsonWriterWorker.prototype.init).toBeCalled();
            }));
            test("should call 'end' on writer", () => __awaiter(void 0, void 0, void 0, function* () {
                yield args.onFinish();
                expect(writer_1.JsonWriterWorker.prototype.end).toBeCalled();
            }));
        });
    });
});
