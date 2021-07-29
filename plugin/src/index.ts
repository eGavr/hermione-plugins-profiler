import { parseConfig, PluginConfig } from "./config";
import { overwriteEmitAndWait } from "./overwrite-emit-and-wait";
import { wrapHermioneHandler } from "./wrap-hermione-handler";
import { JsonWriterMaster, JsonWriterWorker } from "./writer";

export = (hermione: Hermione, opts: PluginConfig) => {
  const config = parseConfig(opts);

  if (!config.enabled) {
    return;
  }

  const writer = hermione.isWorker()
    ? new JsonWriterWorker(config.reportPath)
    : new JsonWriterMaster(config.reportPath);

  hermione.emitAndWait = overwriteEmitAndWait({
    emitAndWait: hermione.emitAndWait.bind(hermione),
    onInit: async () => writer.init(),
    onFinish: async () => writer.end(),
  });

  wrapHermioneHandler("on", hermione, writer);
  wrapHermioneHandler("prependListener", hermione, writer);
  wrapHermioneHandler("intercept", hermione, writer);
};
