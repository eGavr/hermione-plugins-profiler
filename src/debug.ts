import debug from 'debug';

export const createDebug = (namespace: string) =>
    debug(`testplane-plugins-profiler:${namespace}`);
