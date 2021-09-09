import type Hermione from 'hermione';

import { parseConfig, PluginConfig } from './config';
import { overwriteEmitAndWait } from './overwrite-emit-and-wait';
import { wrapHermioneHandler } from './wrap-hermione-handler';
import { JsonWriterMaster, JsonWriterWorker } from './writer';

import attachPlugin from './index';

jest.mock('hermione-profiler-ui');
jest.mock('./writer');
jest.mock('./overwrite-emit-and-wait');
jest.mock('./wrap-hermione-handler');
jest.mock('./config', () => ({
    parseConfig: jest.fn((opts) => opts),
}));

describe('entry-point', () => {
    let hermione: {
        on: jest.SpyInstance;
        isWorker: jest.SpyInstance;
        emitAndWait: jest.SpyInstance;
    };
    let opts: PluginConfig;
    const init = () =>
        attachPlugin(hermione as unknown as Hermione, opts);

    beforeEach(() => {
        hermione = {
            on: jest.fn((_: string, cb: () => void) => {
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

    test('should parse config', async () => {
        init();

        expect(parseConfig).toBeCalledWith(opts);
    });

    test('should not init plugin if it is disabled', async () => {
        opts.enabled = false;

        init();
    });

    test('should init plugin if it is enabled', async () => {
        init();

        expect(wrapHermioneHandler).toBeCalled();
    });

    test('should wrap handlers', async () => {
        init();

        expect(overwriteEmitAndWait).toBeCalled();

        expect(wrapHermioneHandler).toBeCalledTimes(3);
        expect(wrapHermioneHandler).toBeCalledWith(
            'on',
            expect.anything(),
            expect.anything()
        );
        expect(wrapHermioneHandler).toBeCalledWith(
            'prependListener',
            expect.anything(),
            expect.anything()
        );
        expect(wrapHermioneHandler).toBeCalledWith(
            'intercept',
            expect.anything(),
            expect.anything()
        );
    });

    test('should create writer for master', async () => {
        hermione.isWorker.mockReturnValue(false);

        init();

        expect(JsonWriterMaster).toBeCalledWith(
            'plugins-profiler',
            'plugins.json'
        );
        expect(JsonWriterWorker).not.toBeCalled();
    });

    test('should create writer for worker', async () => {
        hermione.isWorker.mockReturnValue(true);

        init();

        expect(JsonWriterWorker).toBeCalledWith(
            'plugins-profiler',
            'plugins.json'
        );
        expect(JsonWriterMaster).not.toBeCalled();
    });

    describe('writer', () => {
        const getEmitAndWaitArgs = () => {
            const [calls] = (overwriteEmitAndWait as jest.Mock).mock
                .calls;

            return calls[0];
        };
        let args: {
            onInit: () => Promise<unknown>;
            onFinish: () => Promise<unknown>;
        };

        describe('master', () => {
            beforeEach(() => {
                hermione.isWorker.mockReturnValue(false);

                init();

                args = getEmitAndWaitArgs();
            });

            test("should call 'init' on writer", async () => {
                await args.onInit();

                expect(JsonWriterMaster.prototype.init).toBeCalled();
            });

            test("should call 'end' on writer", async () => {
                await args.onFinish();

                expect(JsonWriterMaster.prototype.end).toBeCalled();
            });
        });

        describe('worker', () => {
            beforeEach(() => {
                hermione.isWorker.mockReturnValue(true);

                init();

                args = getEmitAndWaitArgs();
            });

            test("should call 'init' on writer", async () => {
                await args.onInit();

                expect(JsonWriterWorker.prototype.init).toBeCalled();
            });

            test("should call 'end' on writer", async () => {
                await args.onFinish();

                expect(JsonWriterWorker.prototype.end).toBeCalled();
            });
        });
    });
});
