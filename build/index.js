"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const config_1 = require("./config");
const overwrite_emit_and_wait_1 = require("./overwrite-emit-and-wait");
const wrap_hermione_handler_1 = require("./wrap-hermione-handler");
const writer_1 = require("./writer");
const hermione_profiler_ui_1 = require("hermione-profiler-ui");
module.exports = (hermione, opts) => {
    const config = (0, config_1.parseConfig)(opts);
    const fileName = 'plugins.json';
    if (!config.enabled) {
        return;
    }
    const writer = hermione.isWorker()
        ? new writer_1.JsonWriterWorker(config.reportPath, fileName)
        : new writer_1.JsonWriterMaster(config.reportPath, fileName);
    hermione.emitAndWait = (0, overwrite_emit_and_wait_1.overwriteEmitAndWait)({
        emitAndWait: hermione.emitAndWait.bind(hermione),
        onInit: () => __awaiter(void 0, void 0, void 0, function* () { return writer.init(); }),
        onFinish: () => __awaiter(void 0, void 0, void 0, function* () {
            writer.end();
            yield (0, hermione_profiler_ui_1.generateReporter)([`./${fileName}`], config.reportPath);
        }),
        hermione,
    });
    (0, wrap_hermione_handler_1.wrapHermioneHandler)('on', hermione, writer);
    (0, wrap_hermione_handler_1.wrapHermioneHandler)('prependListener', hermione, writer);
    (0, wrap_hermione_handler_1.wrapHermioneHandler)('intercept', hermione, writer);
};
