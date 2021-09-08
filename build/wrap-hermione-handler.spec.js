"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const execute_with_hooks_1 = require("./execute-with-hooks");
const wrap_hermione_handler_1 = require("./wrap-hermione-handler");
jest.mock('./execute-with-hooks');
jest.mock('./parse-plugin-name', () => ({
    parsePluginName: jest.fn().mockReturnValue('some-name'),
}));
describe('wrapHermioneHandler', () => {
    let originOnHandlerMock;
    let hermioneMock;
    let writerMock;
    beforeEach(() => {
        originOnHandlerMock = jest.fn();
        hermioneMock = {
            on: originOnHandlerMock,
            isWorker: () => true,
            events: {
                CLI: 'cli',
            },
        };
        writerMock = {
            write: jest.fn(),
        };
        (0, wrap_hermione_handler_1.wrapHermioneHandler)('on', hermioneMock, writerMock);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    test('should pass event and wrapper to the original handler', () => {
        hermioneMock.on('someEvent');
        expect(originOnHandlerMock).toBeCalledWith('someEvent', expect.any(Function));
    });
    test("should not perform measurement if event('cli') has to be skipped", () => {
        const eventHandler = jest.fn();
        hermioneMock.on('cli', eventHandler);
        const [call] = originOnHandlerMock.mock.calls;
        const [event, wrapper] = call;
        wrapper(event);
        expect(eventHandler).toBeCalledWith('cli');
        expect(execute_with_hooks_1.executeWithHooks).not.toBeCalled();
    });
    test("should perform measurement if event hasn't to be skipped", () => {
        const event = 'testPass';
        hermioneMock.on(event, jest.fn());
        const [, wrapper] = lodash_1.default.first(originOnHandlerMock.mock.calls);
        wrapper(event);
        expect(execute_with_hooks_1.executeWithHooks).toBeCalledWith(expect.objectContaining({
            fn: expect.any(Function),
            before: expect.any(Function),
            after: expect.any(Function),
        }));
    });
    test("should pass origin handler to 'executeWithHooks'", () => {
        const eventHandler = jest.fn();
        const event = 'testPass';
        hermioneMock.on(event, eventHandler);
        const [, wrapper] = lodash_1.default.first(originOnHandlerMock.mock.calls);
        wrapper(event, { some: 'data' });
        const [executeWithHooksArgs] = lodash_1.default.first(execute_with_hooks_1.executeWithHooks.mock.calls);
        executeWithHooksArgs.fn();
        expect(eventHandler).toBeCalledWith('testPass', { some: 'data' });
    });
    describe('measurement', () => {
        const event = 'testPass';
        let executeWithHooksArgs;
        beforeEach(() => {
            jest.useFakeTimers();
            hermioneMock.on(event, jest.fn());
            const [, wrapper] = lodash_1.default.first(originOnHandlerMock.mock.calls);
            wrapper(event, { some: 'data' });
            const args = lodash_1.default.first(execute_with_hooks_1.executeWithHooks.mock.calls);
            executeWithHooksArgs = lodash_1.default.first(args);
        });
        afterEach(() => {
            jest.useRealTimers();
        });
        test('should write measurement', () => {
            executeWithHooksArgs.before();
            jest.advanceTimersByTime(1000);
            executeWithHooksArgs.after();
            expect(writerMock.write).toBeCalledWith(expect.objectContaining({
                duration: 1000,
                end: expect.any(Number),
                event: 'testPass',
                listenerName: 'on',
                pid: expect.any(Number),
                pluginName: 'some-name',
                start: expect.any(Number),
                worker: true,
            }));
        });
        test('should not write data if duration is less than required limit', () => {
            executeWithHooksArgs.before();
            jest.advanceTimersByTime(1);
            executeWithHooksArgs.after();
            expect(writerMock.write).not.toBeCalled();
        });
    });
});
