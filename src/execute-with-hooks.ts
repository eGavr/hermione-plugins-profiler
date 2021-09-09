import isPromise from 'is-promise';

type Hooks = {
    fn: () => Promise<unknown> | unknown;
    before: () => unknown;
    after: () => unknown;
};

export function executeWithHooks({ fn, before, after }: Hooks) {
    let isResPromise = false;

    before();

    try {
        const res: Promise<unknown> | unknown = fn();

        if (isPromise(res)) {
            isResPromise = true;

            return Promise.resolve(res).finally(() => after());
        }

        return res;
    } finally {
        if (!isResPromise) {
            after();
        }
    }
}
