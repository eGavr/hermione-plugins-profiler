import type Testplane from 'testplane';

import { TestplaneEvent } from './types';

export function overwriteEmitAndWait({
    emitAndWait,
    onInit,
    onFinish,
    testplane,
}: {
    emitAndWait: Testplane['emitAndWait'];
    onInit: () => Promise<unknown>;
    onFinish: () => Promise<unknown>;
    testplane: Testplane;
}): Testplane['emitAndWait'] {
    return (event: TestplaneEvent, ...args: unknown[]) => {
        const emit = () => emitAndWait(event, ...args);

        if (event === testplane.events.INIT) {
            return onInit()
                .catch((err: Error) =>
                    console.log(`Unable to init plugin: ${err.stack}`)
                )
                .then(() => emit());
        }

        if (event === testplane.events.RUNNER_END) {
            const handleFinish = () =>
                onFinish().catch((err: Error) =>
                    console.error(
                        `Unable to finalize plugin: ${err.stack}`
                    )
                );

            return emit().finally(() => handleFinish());
        }

        return emit();
    };
}
