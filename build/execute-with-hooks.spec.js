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
const bluebird_1 = __importDefault(require("bluebird"));
require("jest-extended");
const execute_with_hooks_1 = require("./execute-with-hooks");
describe('executeWithHooks', () => {
    describe('sync', () => {
        test('should call handlers in right order', () => {
            const fns = {
                fn: jest.fn().mockReturnValue('res'),
                before: jest.fn(),
                after: jest.fn(),
            };
            const res = (0, execute_with_hooks_1.executeWithHooks)(fns);
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
            expect(() => (0, execute_with_hooks_1.executeWithHooks)(fns)).toThrow('err');
            expect(fns.fn).toHaveBeenCalledAfter(fns.before);
            expect(fns.fn).toHaveBeenCalledBefore(fns.after);
        });
    });
    describe('async', () => {
        afterEach(() => {
            jest.useRealTimers();
        });
        test('should call handlers in right order', () => __awaiter(void 0, void 0, void 0, function* () {
            jest.useFakeTimers();
            const fns = {
                fn: jest
                    .fn()
                    .mockImplementation(() => bluebird_1.default.delay(1000).thenReturn('res')),
                before: jest.fn(),
                after: jest.fn(),
            };
            const prom = (0, execute_with_hooks_1.executeWithHooks)(fns);
            jest.runOnlyPendingTimers();
            const res = yield prom;
            expect(res).toBe('res');
            expect(fns.fn).toHaveBeenCalledAfter(fns.before);
            expect(fns.fn).toHaveBeenCalledBefore(fns.after);
        }));
        test('should call handlers in right order even if handler rejects', () => __awaiter(void 0, void 0, void 0, function* () {
            const fns = {
                fn: jest.fn().mockRejectedValue('err'),
                before: jest.fn(),
                after: jest.fn(),
            };
            yield expect((0, execute_with_hooks_1.executeWithHooks)(fns)).toReject();
            expect(fns.fn).toHaveBeenCalledAfter(fns.before);
            expect(fns.fn).toHaveBeenCalledBefore(fns.after);
        }));
    });
});
