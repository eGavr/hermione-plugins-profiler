import isPromise from "is-promise";

type Hooks = {
  fn: () => any;
  before: () => any;
  after: () => any;
};

export function executeWithHooks({ fn, before, after }: Hooks) {
  let isResPromise = false;

  before();

  try {
    const res: Promise<any> = fn();

    if (isPromise(res)) {
      isResPromise = true;

      return res.finally(() => after());
    }

    return res;
  } finally {
    if (!isResPromise) {
      after();
    }
  }
}
