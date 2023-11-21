import P from 'bluebird';
import 'jest-extended';

import { executeWithHooks } from './execute-with-hooks';

const getCallOrder = (fn: jest.Mock): number => {
    return fn.mock.invocationCallOrder[0];
};

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

            const beforeFnCallOrder = getCallOrder(fns.before);
            const fnCallOrder = getCallOrder(fns.fn);
            const afterFnCallOrder = getCallOrder(fns.after);

            expect(beforeFnCallOrder).toBeLessThan(fnCallOrder);
            expect(fnCallOrder).toBeLessThan(afterFnCallOrder);
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

            const beforeFnCallOrder = getCallOrder(fns.before);
            const fnCallOrder = getCallOrder(fns.fn);
            const afterFnCallOrder = getCallOrder(fns.after);

            expect(beforeFnCallOrder).toBeLessThan(fnCallOrder);
            expect(fnCallOrder).toBeLessThan(afterFnCallOrder);
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

            const beforeFnCallOrder = getCallOrder(fns.before);
            const fnCallOrder = getCallOrder(fns.fn);
            const afterFnCallOrder = getCallOrder(fns.after);

            expect(beforeFnCallOrder).toBeLessThan(fnCallOrder);
            expect(fnCallOrder).toBeLessThan(afterFnCallOrder);
        });

        test('should call handlers in right order even if handler rejects', async () => {
            const fns = {
                fn: jest.fn().mockRejectedValue('err'),
                before: jest.fn(),
                after: jest.fn(),
            };

            const isRejected = await Promise.resolve(
                executeWithHooks(fns)
            ).then(
                () => false,
                () => true
            );

            expect(isRejected).toBe(true);

            const beforeFnCallOrder = getCallOrder(fns.before);
            const fnCallOrder = getCallOrder(fns.fn);
            const afterFnCallOrder = getCallOrder(fns.after);

            expect(beforeFnCallOrder).toBeLessThan(fnCallOrder);
            expect(fnCallOrder).toBeLessThan(afterFnCallOrder);
        });
    });
});
