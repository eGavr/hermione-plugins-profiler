"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.overwriteEmitAndWait = void 0;
function overwriteEmitAndWait({ emitAndWait, onInit, onFinish, hermione, }) {
    return (event, ...args) => {
        const emit = () => emitAndWait(event, ...args);
        if (event === hermione.events.INIT) {
            return onInit()
                .catch((err) => console.log(`Unable to init plugin: ${err.stack}`))
                .finally(() => emit());
        }
        if (event === hermione.events.RUNNER_END) {
            const handleFinish = () => onFinish()
                .catch((err) => console.error(`Unable to finalize plugin: ${err.stack}`));
            return emit().finally(() => handleFinish());
        }
        return emit();
    };
}
exports.overwriteEmitAndWait = overwriteEmitAndWait;
