"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
describe('config', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    test("should throw if 'enabled' is not the boolean", () => {
        const opts = { enabled: 'asd' };
        expect(() => (0, config_1.parseConfig)(opts)).toThrow(/'enabled' must be a boolean/);
    });
    test("should throw if 'reportPath' is not the 'string'", () => {
        const opts = {
            enabled: false,
            reportPath: true,
        };
        expect(() => (0, config_1.parseConfig)(opts)).toThrow(/'reportPath'/);
    });
    test("should use default for 'reportPath'", () => {
        const opts = {
            enabled: false,
        };
        const res = (0, config_1.parseConfig)(opts);
        expect(res).toMatchObject({ reportPath: 'hermione-profiler' });
    });
    test('should parse the config', () => {
        const opts = {
            enabled: false,
            reportPath: 'some/path',
        };
        const res = (0, config_1.parseConfig)(opts);
        expect(res).toMatchObject({ enabled: false, reportPath: 'some/path' });
    });
});
