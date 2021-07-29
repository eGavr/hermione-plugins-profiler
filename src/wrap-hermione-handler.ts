import type Hermione from 'hermione';

import { executeWithHooks } from './execute-with-hooks';
import { parsePluginName } from './parse-plugin-name';
import { HermioneEvent, HermioneHandler } from './types';
import { IWriter } from './writer';

const DURATION_LIMIT_MS = 2;

export function wrapHermioneHandler(
    listenerName: HermioneHandler,
    hermione: Hermione,
    writer: IWriter
) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const herm = hermione as unknown as any;
    const EVENTS_TO_EXCLUDE = [hermione.events.CLI as string];
    const originListener = herm[listenerName].bind(herm);

    herm[listenerName] = function (
        event: HermioneEvent,
        fn: (...args: unknown[]) => unknown
    ): Hermione {
        const pluginName = parsePluginName(new Error());

        originListener(event, (...args: unknown[]): unknown => {
            if (EVENTS_TO_EXCLUDE.includes(event)) {
                return fn(...args);
            }

            let startTime: number;

            return executeWithHooks({
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
