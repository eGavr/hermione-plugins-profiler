import _ from 'lodash';
import type Testplane from 'testplane';

import { executeWithHooks } from './execute-with-hooks';
import { wrapTestplaneHandler } from './wrap-testplane-handler';
import { IWriter } from './writer';

jest.mock('./execute-with-hooks');
jest.mock('./parse-plugin-name', () => ({
    parsePluginName: jest.fn().mockReturnValue('some-name'),
}));

describe('wrapTestplaneHandler', () => {
    let originOnHandlerMock: jest.Mock;
    let testplaneMock: {
        on: jest.Mock;
        isWorker: () => boolean;
        events: {
            [name: string]: string;
        };
    };
    let writerMock: {
        write: jest.Mock;
    };

    beforeEach(() => {
        originOnHandlerMock = jest.fn();
        testplaneMock = {
            on: originOnHandlerMock,
            isWorker: () => true,
            events: {
                CLI: 'cli',
            },
        };
        writerMock = {
            write: jest.fn(),
        };

        wrapTestplaneHandler(
            'on',
            testplaneMock as unknown as Testplane,
            writerMock as unknown as IWriter
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should pass event and wrapper to the original handler', () => {
        testplaneMock.on('someEvent');

        expect(originOnHandlerMock).toBeCalledWith(
            'someEvent',
            expect.any(Function)
        );
    });

    test("should not perform measurement if event('cli') has to be skipped", () => {
        const eventHandler = jest.fn();

        testplaneMock.on('cli', eventHandler);

        const [call] = originOnHandlerMock.mock.calls;
        const [event, wrapper] = call;

        wrapper(event);

        expect(eventHandler).toBeCalledWith('cli');
        expect(executeWithHooks).not.toBeCalled();
    });

    test("should perform measurement if event hasn't to be skipped", () => {
        const event = 'testPass';

        testplaneMock.on(event, jest.fn());

        const [, wrapper] = _.first(originOnHandlerMock.mock.calls);

        wrapper(event);

        expect(executeWithHooks).toBeCalledWith(
            expect.objectContaining({
                fn: expect.any(Function),
                before: expect.any(Function),
                after: expect.any(Function),
            })
        );
    });

    test("should pass origin handler to 'executeWithHooks'", () => {
        const eventHandler = jest.fn();
        const event = 'testPass';

        testplaneMock.on(event, eventHandler);

        const [, wrapper] = _.first(originOnHandlerMock.mock.calls);

        wrapper(event, { some: 'data' });

        const [executeWithHooksArgs] = _.first(
            (executeWithHooks as jest.Mock).mock.calls
        );

        executeWithHooksArgs.fn();

        expect(eventHandler).toBeCalledWith('testPass', {
            some: 'data',
        });
    });

    describe('measurement', () => {
        const event = 'testPass';
        let executeWithHooksArgs: {
            before: () => void;
            after: () => void;
        };

        beforeEach(() => {
            jest.useFakeTimers();

            testplaneMock.on(event, jest.fn());

            const [, wrapper] = _.first(
                originOnHandlerMock.mock.calls
            );

            wrapper(event, { some: 'data' });

            const args = _.first(
                (executeWithHooks as jest.Mock).mock.calls
            );

            executeWithHooksArgs = _.first(args) || {
                before: () => {},
                after: () => {},
            };
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        test('should write measurement', () => {
            executeWithHooksArgs.before();

            jest.advanceTimersByTime(1000);

            executeWithHooksArgs.after();

            expect(writerMock.write).toBeCalledWith(
                expect.objectContaining({
                    duration: 1000,
                    end: expect.any(Number),
                    event: 'testPass',
                    listenerName: 'on',
                    pid: expect.any(Number),
                    pluginName: 'some-name',
                    start: expect.any(Number),
                    worker: true,
                })
            );
        });

        test('should not write data if duration is less than required limit', () => {
            executeWithHooksArgs.before();

            jest.advanceTimersByTime(1);

            executeWithHooksArgs.after();

            expect(writerMock.write).not.toBeCalled();
        });
    });
});
