import P from 'bluebird';
import 'jest-extended';

import { executeWithHooks } from './execute-with-hooks';

describe('executeWithHooks', () => {
    describe('sync', () => {
        test('should call handlers in right order', () => {
            const fns = {
                fn: jest.fn().mockReturnValue('res'),
                before: jest.fn(),
                after: jest.fn(),
            };

            const res = executeWithHooks(fns);

            expect(res).toBe('res');
            expect(fns.fn).toHaveBeenCalledAfter(fns.before);
            expect(fns.fn).toHaveBeenCalledBefore(fns.after);
        });

        test('should call handlers in right order even if handler throws', () => {
            const fns = {
                fn: jest.fn().mockImplementation(() => {
                    throw new Error('err');
                }),
                before: jest.fn(),
                after: jest.fn(),
            };

            expect(() => executeWithHooks(fns)).toThrow('err');
            expect(fns.fn).toHaveBeenCalledAfter(fns.before);
            expect(fns.fn).toHaveBeenCalledBefore(fns.after);
        });
    });

    describe('async', () => {
        afterEach(() => {
            jest.useRealTimers();
        });

        test('should call handlers in right order', async () => {
            jest.useFakeTimers();

            const fns = {
                fn: jest
                    .fn()
                    .mockImplementation(() =>
                        P.delay(1000).thenReturn('res')
                    ),
                before: jest.fn(),
                after: jest.fn(),
            };

            const prom = executeWithHooks(fns);

            jest.runOnlyPendingTimers();

            const res = await prom;

            expect(res).toBe('res');
            expect(fns.fn).toHaveBeenCalledAfter(fns.before);
            expect(fns.fn).toHaveBeenCalledBefore(fns.after);
        });

        test('should call handlers in right order even if handler rejects', async () => {
            const fns = {
                fn: jest.fn().mockRejectedValue('err'),
                before: jest.fn(),
                after: jest.fn(),
            };

            await expect(executeWithHooks(fns)).toReject();
            expect(fns.fn).toHaveBeenCalledAfter(fns.before);
            expect(fns.fn).toHaveBeenCalledBefore(fns.after);
        });
    });
});
