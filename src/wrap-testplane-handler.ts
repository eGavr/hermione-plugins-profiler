import type Testplane from 'testplane';

import { executeWithHooks } from './execute-with-hooks';
import { parsePluginName } from './parse-plugin-name';
import { TestplaneEvent, TestplaneHandler } from './types';
import { IWriter } from './writer';

const DURATION_LIMIT_MS = 2;

export function wrapTestplaneHandler(
    listenerName: TestplaneHandler,
    testplane: Testplane,
    writer: IWriter
) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const herm = testplane as unknown as any;
    const EVENTS_TO_EXCLUDE = [testplane.events.CLI as string];
    const originListener = herm[listenerName].bind(herm);

    herm[listenerName] = function (
        event: TestplaneEvent,
        fn: (...args: unknown[]) => unknown
    ): Testplane {
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
                        worker: testplane.isWorker(),
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

        return testplane;
    };
}
