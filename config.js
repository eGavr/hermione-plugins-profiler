'use strict';

const _ = require('lodash');
const configParser = require('gemini-configparser');

const option = configParser.option;
const root = configParser.root;
const section = configParser.section;

const ENV_PREFIX = 'hermione_plugins_profiler_';
const CLI_PREFIX = '--plugins-profiler-';

const is = exports.is = (type, name) => (value) => {
    if (typeof value !== type) {
        throw new Error(`"${name}" must be a ${type}`);
    }
};

const parse = root(section({
    enabled: option({
        parseEnv: JSON.parse,
        parseCli: JSON.parse,
        defaultValue: true,
        validate: is('boolean', 'enabled')
    }),
    events: option({
        parseEnv: String,
        parseCli: String,
        defaultValue: [],
        validate: (value) => {
            if (!_.isString(value) && !_.isArray(value) && !_.every(value, _.isString)) {
                throw new Error(`"events" must be a string or array of strings`);
            }
        },
        map: (value) => {
            if (_.isString(value)) {
                return value.trim().split(/,\s*/g);
            }

            if (_.isArray(value)) {
                return value;
            }
        }
    })
}), {envPrefix: ENV_PREFIX, cliPrefix: CLI_PREFIX});

module.exports = (options) => parse({options, env: process.env, argv: process.argv});
