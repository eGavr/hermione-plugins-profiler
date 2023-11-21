import type Hermione from 'hermione';
import { generateReporter } from 'hermione-profiler-ui';

import { parseConfig, PluginConfig } from './config';
import { overwriteEmitAndWait } from './overwrite-emit-and-wait';
import { wrapHermioneHandler } from './wrap-hermione-handler';
import { JsonWriterMaster, JsonWriterWorker } from './writer';

export = (hermione: Hermione, opts: PluginConfig) => {
    const config = parseConfig(opts);
    const fileName = 'plugins.json';

    if (!config.enabled) {
        return;
    }

    const writer = hermione.isWorker()
        ? new JsonWriterWorker(config.reportPath, fileName)
        : new JsonWriterMaster(config.reportPath, fileName);

    hermione.emitAndWait = overwriteEmitAndWait({
        emitAndWait: hermione.emitAndWait.bind(hermione),
        onInit: async () => writer.init(),
        onFinish: async () => {
            writer.end();

            await generateReporter(
                [`./${fileName}`],
                config.reportPath
            );
        },
        hermione,
    });

    wrapHermioneHandler('on', hermione, writer);
    wrapHermioneHandler('prependListener', hermione, writer);
    wrapHermioneHandler('intercept', hermione, writer);
};
