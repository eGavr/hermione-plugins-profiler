import { generateReporter } from 'hermione-profiler-ui';
import type Testplane from 'testplane';

import { parseConfig, PluginConfig } from './config';
import { overwriteEmitAndWait } from './overwrite-emit-and-wait';
import { wrapTestplaneHandler } from './wrap-testplane-handler';
import { JsonWriterMaster, JsonWriterWorker } from './writer';

export = (testplane: Testplane, opts: PluginConfig) => {
    const config = parseConfig(opts);
    const fileName = 'plugins.json';

    if (!config.enabled) {
        return;
    }

    const writer = testplane.isWorker()
        ? new JsonWriterWorker(config.reportPath, fileName)
        : new JsonWriterMaster(config.reportPath, fileName);

    testplane.emitAndWait = overwriteEmitAndWait({
        emitAndWait: testplane.emitAndWait.bind(testplane),
        onInit: async () => writer.init(),
        onFinish: async () => {
            writer.end();

            await generateReporter(
                [`./${fileName}`],
                config.reportPath
            );
        },
        testplane,
    });

    wrapTestplaneHandler('on', testplane, writer);
    wrapTestplaneHandler('prependListener', testplane, writer);
    wrapTestplaneHandler('intercept', testplane, writer);
};
