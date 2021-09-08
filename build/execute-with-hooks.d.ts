declare type Hooks = {
    fn: () => Promise<unknown> | unknown;
    before: () => unknown;
    after: () => unknown;
};
export declare function executeWithHooks({ fn, before, after }: Hooks): unknown;
export {};
