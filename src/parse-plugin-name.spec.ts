import { parsePluginName } from './parse-plugin-name';

describe('parsePluginName', () => {
    beforeEach(() => {
        jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return reserved name if it stack does not have 3rd line', () => {
        const stack = `
              at Array.map (<anonymous>)
              at /Users/name/projects/prj/node_modules/plugins-loader/lib/loader.js:19:80
          `;

        const err = new Error();

        err.stack = stack;

        expect(parsePluginName(err)).toEqual('UNKNOWN_PLUGIN');
    });

    test('should return reserved name if 3rd line does not have a path', () => {
        const stack = `
              at Array.map (<anonymous>)
              at /Users/name/projects/prj/node_modules/plugins-loader/lib/loader.js:19:80
              at Array.map (<anonymous>)
          `;

        const err = new Error();

        err.stack = stack;

        expect(parsePluginName(err)).toEqual('UNKNOWN_PLUGIN');
    });

    test("should return reserved name if path on 3rd line does not contain 'node_modules' dir", () => {
        const stack = `
              at Array.map (<anonymous>)
              at /Users/name/projects/prj/node_modules/plugins-loader/lib/loader.js:19:80
              at /Users/name/projects/prj/plugins-loader/lib/loader.js:19:80
          `;

        const err = new Error();

        err.stack = stack;

        expect(parsePluginName(err)).toEqual('UNKNOWN_PLUGIN');
    });

    test('should return reserved name if it is unable to parse name from path by regexp', () => {
        const stack = `
              at Array.map (<anonymous>)
              at /Users/name/projects/prj/node_modules/plugins-loader/lib/loader.js:19:80
              at /Users/name/projects/prj/node_modules
          `;

        const err = new Error();

        err.stack = stack;

        expect(parsePluginName(err)).toEqual('UNKNOWN_PLUGIN');
    });

    test('should return a plugin name a from stack', () => {
        const stack = `
              at parsePluginName (/Users/name/projects/prj/node_modules/@testplane/plugins-profiler/index.js:48:20)
              at Testplane.<anonymous> (/Users/name/projects/prj/node_modules/@testplane/plugins-profiler/some/dir/lib/index.js:24:32)
              at module.exports (/Users/name/projects/prj/node_modules/some-plugin-name/lib/index.js:14:14)
              at /Users/name/projects/prj/node_modules/plugins-loader/lib/loader.js:19:80
              at /Users/name/projects/prj/node_modules/plugins-loader/lib/index.js:9:26
              at Array.map (<anonymous>)
              at Object.exports.load (/Users/name/projects/prj/node_modules/plugins-loader/lib/index.js:9:10)
              at Testplane._loadPlugins (/Users/name/projects/prj/node_modules/testplane/lib/base-testplane.js:57:23)
          `;

        const err = new Error();

        err.stack = stack;

        expect(parsePluginName(err)).toEqual('some-plugin-name');
    });

    test('should return a plugin name from a stack if it has a namespace', () => {
        const stack = `
              at parsePluginName (/Users/name/projects/prj/node_modules/@testplane/plugins-profiler/index.js:48:20)
              at Testplane.<anonymous> (/Users/name/projects/prj/node_modules/@testplane/plugins-profiler/index.js:24:32)
              at module.exports (/Users/name/projects/prj/node_modules/@some-org/some-plugin-name/some/dir/nested/lib/index.js:14:14)
              at /Users/name/projects/prj/node_modules/plugins-loader/lib/loader.js:19:80
              at /Users/name/projects/prj/node_modules/plugins-loader/lib/index.js:9:26
              at Array.map (<anonymous>)
              at Object.exports.load (/Users/name/projects/prj/node_modules/plugins-loader/lib/index.js:9:10)
              at Testplane._loadPlugins (/Users/name/projects/prj/node_modules/testplane/lib/base-testplane.js:57:23)
          `;

        const err = new Error();

        err.stack = stack;

        expect(parsePluginName(err)).toEqual(
            '@some-org/some-plugin-name'
        );
    });

    test('should return a plugin name from a stack if it is from .pnpm', () => {
        const stack = `
            at Testplane.herm.<computed> (/Users/name/prj/node_modules/.pnpm/@testplane/plugins-profiler@0.0.0/node_modules/@testplane/plugins-profiler/index.js:48:20)
            at module.exports (/Users/name/prj/node_modules/.pnpm/another-plugin@1.0.0/node_modules/some-plugin/index.js:48:20)
            at /Users/name/prj/node_modules/.pnpm/plugins-loader/node_modules/plugins-loader/index.js:48:20
            at Module.load (node:internal/modules/cjs/loader:1037:32)
          `;

        const err = new Error();

        err.stack = stack;

        expect(parsePluginName(err)).toEqual('some-plugin');
    });

    test('should return a plugin name from a stack if it is from .pnpm-store', () => {
        const stack = `
            at Testplane.herm.<computed> [as on] (/Users/name/.pnpm-store/some-virtual-store/@testplane/plugins-profiler@0.0.0/node_modules/@testplane/plugins-profiler/index.js:48:20)
            at module.exports (/Users/name/.pnpm-store/some-virtual-store/@some-plugin@0.0.0_56d91d656e193c0ca144cec591e28121/node_modules/@some-scope/some-plugin/index.js:48:20)
            at /Users/name/.pnpm-store/some-virtual-store/plugins-loader@0.0.0/node_modules/plugins-loader/lib/index.js:48:20
            at /Users/name/.pnpm-store/some-virtual-store/plugins-loader@0.0.0/node_modules/plugins-loader/lib/index.js:48:20
          `;

        const err = new Error();

        err.stack = stack;

        expect(parsePluginName(err)).toEqual(
            '@some-scope/some-plugin'
        );
    });
});
