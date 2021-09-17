import debug from 'debug';

export const createDebug = (namespace: string) =>
    debug(`hermione-plugins-profiler:${namespace}`);
