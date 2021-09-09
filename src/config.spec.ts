import { parseConfig, PluginConfig } from './config';

describe('config', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should throw if 'enabled' is not the boolean", () => {
        const opts = { enabled: 'asd' } as unknown as PluginConfig;

        expect(() => parseConfig(opts)).toThrow(
            /'enabled' must be a boolean/
        );
    });

    test("should throw if 'reportPath' is not the 'string'", () => {
        const opts = {
            enabled: false,
            reportPath: true,
        } as unknown as PluginConfig;

        expect(() => parseConfig(opts)).toThrow(/'reportPath'/);
    });

    test("should use default for 'reportPath'", () => {
        const opts = {
            enabled: false,
        } as unknown as PluginConfig;

        const res = parseConfig(opts);

        expect(res).toMatchObject({
            reportPath: 'hermione-profiler',
        });
    });

    test('should parse the config', () => {
        const opts: PluginConfig = {
            enabled: false,
            reportPath: 'some/path',
        };

        const res = parseConfig(opts);

        expect(res).toMatchObject({
            enabled: false,
            reportPath: 'some/path',
        });
    });
});
