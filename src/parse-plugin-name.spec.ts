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
              at parsePluginName (/Users/name/projects/prj/node_modules/hermione-plugins-profiler/index.js:48:20)
              at Hermione.<anonymous> (/Users/name/projects/prj/node_modules/hermione-plugins-profiler/some/dir/lib/index.js:24:32)
              at module.exports (/Users/name/projects/prj/node_modules/some-plugin-name/lib/index.js:14:14)
              at /Users/name/projects/prj/node_modules/plugins-loader/lib/loader.js:19:80
              at /Users/name/projects/prj/node_modules/plugins-loader/lib/index.js:9:26
              at Array.map (<anonymous>)
              at Object.exports.load (/Users/name/projects/prj/node_modules/plugins-loader/lib/index.js:9:10)
              at Hermione._loadPlugins (/Users/name/projects/prj/node_modules/hermione/lib/base-hermione.js:57:23)
          `;

        const err = new Error();

        err.stack = stack;

        expect(parsePluginName(err)).toEqual('some-plugin-name');
    });

    test('should return a plugin name from a stack if it has a namespace', () => {
        const stack = `
              at parsePluginName (/Users/name/projects/prj/node_modules/hermione-plugins-profiler/index.js:48:20)
              at Hermione.<anonymous> (/Users/name/projects/prj/node_modules/hermione-plugins-profiler/index.js:24:32)
              at module.exports (/Users/name/projects/prj/node_modules/@some-org/some-plugin-name/some/dir/nested/lib/index.js:14:14)
              at /Users/name/projects/prj/node_modules/plugins-loader/lib/loader.js:19:80
              at /Users/name/projects/prj/node_modules/plugins-loader/lib/index.js:9:26
              at Array.map (<anonymous>)
              at Object.exports.load (/Users/name/projects/prj/node_modules/plugins-loader/lib/index.js:9:10)
              at Hermione._loadPlugins (/Users/name/projects/prj/node_modules/hermione/lib/base-hermione.js:57:23)
          `;

        const err = new Error();

        err.stack = stack;

        expect(parsePluginName(err)).toEqual(
            '@some-org/some-plugin-name'
        );
    });
});
