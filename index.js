'use strict';

const isPromise = require('p-is-promise');

module.exports = (hermione, opts) => {
    if (opts.enabled === false) {
        return;
    }

    const redefine = (baseFn) => {
        return function(event, cb) {
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
