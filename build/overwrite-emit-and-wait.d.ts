export declare function overwriteEmitAndWait({ emitAndWait, onInit, onFinish, hermione, }: {
    emitAndWait: Hermione['emitAndWait'];
    onInit: () => Promise<any>;
    onFinish: () => Promise<any>;
    hermione: Hermione;
}): Hermione['emitAndWait'];
