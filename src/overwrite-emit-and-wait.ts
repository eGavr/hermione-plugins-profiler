import { HermioneEvent } from './types';

export function overwriteEmitAndWait({
    emitAndWait,
    onInit,
    onFinish,
    hermione,
}: {
    emitAndWait: Hermione['emitAndWait'];
    onInit: () => Promise<unknown>;
    onFinish: () => Promise<unknown>;
    hermione: Hermione;
}): Hermione['emitAndWait'] {
    return (event: HermioneEvent, ...args: unknown[]) => {
        const emit = () => emitAndWait(event, ...args);

        if (event === hermione.events.INIT) {
            return onInit()
                .catch((err: Error) =>
                    console.log(`Unable to init plugin: ${err.stack}`)
                )
                .then(() => emit());
        }

        if (event === hermione.events.RUNNER_END) {
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
