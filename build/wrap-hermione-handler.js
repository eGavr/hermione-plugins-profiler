"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapHermioneHandler = void 0;
const execute_with_hooks_1 = require("./execute-with-hooks");
const parse_plugin_name_1 = require("./parse-plugin-name");
const DURATION_LIMIT_MS = 2;
function wrapHermioneHandler(listenerName, hermione, writer) {
    const herm = hermione;
    const EVENTS_TO_EXCLUDE = [hermione.events.CLI];
    const originListener = herm[listenerName].bind(herm);
    herm[listenerName] = function (event, fn) {
        const pluginName = (0, parse_plugin_name_1.parsePluginName)(new Error());
        originListener(event, (...args) => {
            if (EVENTS_TO_EXCLUDE.includes(event)) {
                return fn(...args);
            }
            let startTime;
            return (0, execute_with_hooks_1.executeWithHooks)({
                fn: () => fn(...args),
                before: () => (startTime = Date.now()),
                after: () => {
                    const endTime = Date.now();
                    const duration = endTime - startTime;
                    if (duration < DURATION_LIMIT_MS) {
                        return;
                    }
                    writer.write({
                        worker: hermione.isWorker(),
                        pid: process.pid,
                        pluginName,
                        listenerName,
                        event,
                        duration,
                        start: startTime,
                        end: endTime,
                    });
                },
            });
        });
        return hermione;
    };
}
exports.wrapHermioneHandler = wrapHermioneHandler;
