"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseConfig = void 0;
const gemini_configparser_1 = require("gemini-configparser");
const lodash_1 = __importDefault(require("lodash"));
const booleanOption = (name) => (0, gemini_configparser_1.option)({
    parseEnv: (val) => Boolean(JSON.parse(val)),
    parseCli: (val) => Boolean(JSON.parse(val)),
    defaultValue: false,
    validate: (val) => {
        if (lodash_1.default.isBoolean(val)) {
            return;
        }
        throw new Error(`Option '${name}' must be a boolean`);
    },
});
const stringOption = (name, defaultValue = '') => (0, gemini_configparser_1.option)({
    defaultValue,
    validate: (val) => {
        if (lodash_1.default.isString(val) || !lodash_1.default.isEmpty(val)) {
            return val;
        }
        throw new Error(`Option '${name}' must be presented and type of "string"`);
    },
});
function parseConfig(options) {
    const { env, argv } = process;
    const parseOptions = (0, gemini_configparser_1.root)((0, gemini_configparser_1.section)({
        enabled: booleanOption('enabled'),
        reportPath: stringOption('reportPath', 'hermione-profiler'),
    }), {
        envPrefix: 'hermione_plugins_profiler_',
        cliPrefix: '--plugins-profiler-',
    });
    const config = parseOptions({ options, env, argv });
    return config;
}
exports.parseConfig = parseConfig;
