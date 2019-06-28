'use strict';

const _ = require('lodash');
const isPromise = require('p-is-promise');

const parseConfig = require('./config');

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

                const res = cb(...args);

                if (isPromise(res)) {
                    return res.finally(() => log(pluginName, event))
                } else {
                    log(pluginName, event);
                }
            }

            return baseFn(event, fn);
        }.bind(hermione);
    }


    hermione.on = redefine(hermione.on.bind(hermione));
    hermione.prependListener = redefine(hermione.prependListener.bind(hermione));
};

function parsePluginName() {
    return (new Error()).stack.split('\n')[3].match(/\/node_modules\/(.+)\)/)[1];
}

function log(pluginName, event) {
    console.log(`hermione-plugins-profiler:${Date()}:${pluginName}:${event}`);
}
