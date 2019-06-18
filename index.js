'use strict';

const isPromise = require('p-is-promise');

module.exports = (hermione, opts) => {
    if (opts.enabled === false) {
        return;
    }

    const baseOnFn = hermione.on.bind(hermione);

    hermione.on = function(event, cb) {
        const pluginName = 'hermione-plguins-profiler:' + parsePluginName() + `:event:${event}`;

        const fn = (...args) => {
            console.time(pluginName);

            const res = cb(...args);

            if (isPromise(res)) {
                return res.finally(() => console.timeEnd(pluginName))
            } else {
                console.timeEnd(pluginName);
            }
        }

        return baseOnFn(event, fn);
    }.bind(hermione);
};

function parsePluginName() {
    return (new Error).stack.split('\n')[3].match(/\/node_modules\/(.+)\//)[1];
}
