'use strict';

const path = require('path');
const _ = require('lodash');
const isPromise = require('p-is-promise');

const parseConfig = require('./config');

const UNKNOWN_PLUGIN_NAME = 'unknown-plugin-name';

const DATA = {};

module.exports = (hermione, opts) => {
    const config = parseConfig(opts);

    if (!config.enabled) {
        return;
    }

    const redefine = (baseFn) => {
        return function(event, cb) {
            if (!_.isEmpty(config.events) && !_.includes(config.events, event)) {
                return baseFn(event, cb);
            }

            const pluginName = parsePluginName()
            const fn = (...args) => {
                log(pluginName, event)

                const start = new Date().getTime();
                const res = cb(...args);
                const end = new Date().getTime();

                if (isPromise(res)) {
                    return res.finally(() => log(pluginName, event))
                } else {
                    log(pluginName, event);
                    const id = `${process.pid}:${pluginName}:${event}`;

                    if (!DATA[id]) {
                        DATA[id] = 0;
                    }

                    DATA[id] += end - start;
                    console.log(`${id}:${DATA[id]}`)
                }
            }

            return baseFn(event, fn);
        }.bind(hermione);
    }


    hermione.on = redefine(hermione.on.bind(hermione));
    hermione.prependListener = redefine(hermione.prependListener.bind(hermione));
};

function parsePluginName() {
    const stack = (new Error()).stack;
    const parsed = stack.split('\n')[3] || '';
    const projectName = path.basename(process.cwd());
    const regs = [/\/node_modules\/(.+)\)/, new RegExp(`\\/(${projectName}\\/.+)\\)`), / \((.+)\)/];

    for (let i in regs) {
        const match = parsed.match(regs[i]);
        if (match) {
            return match[1];
        }
    }

    log('cannot parse plugin name from stack', `\n${stack}`);
    return UNKNOWN_PLUGIN_NAME;
}

function log(...args) {
    console.log(`hermione-plugins-profiler:${Date()}:${args.join(':')}`);
}
