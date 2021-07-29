import type Hermione from "hermione";

import { parseConfig, PluginConfig } from "./config";
import { overwriteEmitAndWait } from "./overwrite-emit-and-wait";
import { wrapHermioneHandler } from "./wrap-hermione-handler";
import { JsonWriterMaster, JsonWriterWorker } from "./writer";

import attachPlugin from "./index";

jest.mock("./writer");
jest.mock("./overwrite-emit-and-wait");
jest.mock("./wrap-hermione-handler");
jest.mock("./config", () => ({ parseConfig: jest.fn((opts) => opts) }));

describe("entry-point", () => {
  let hermione: {
    on: jest.SpyInstance;
    isWorker: jest.SpyInstance;
    emitAndWait: jest.SpyInstance;
  };
  let opts: PluginConfig;

  beforeEach(() => {
    hermione = {
      on: jest.fn((_: string, cb: any) => {
        cb();
      }),
      isWorker: jest.fn(),
      emitAndWait: jest.fn(),
    };
    opts = {
      reportPath: "plugins-profiler",
      enabled: true,
    };

    jest.clearAllMocks();
  });

  test("should parse config", async () => {
    attachPlugin(hermione as unknown as Hermione, opts);

    expect(parseConfig).toBeCalledWith(opts);
  });

  test("should not init plugin if it is disabled", async () => {
    opts.enabled = false;

    attachPlugin(hermione as unknown as Hermione, opts);
  });

  test("should init plugin if it is enabled", async () => {
    attachPlugin(hermione as unknown as Hermione, opts);

    expect(wrapHermioneHandler).toBeCalled();
  });

  test("should wrap handlers", async () => {
    attachPlugin(hermione as unknown as Hermione, opts);

    expect(overwriteEmitAndWait).toBeCalled();

    expect(wrapHermioneHandler).toBeCalledTimes(3);
    expect(wrapHermioneHandler).toBeCalledWith(
      "on",
      expect.anything(),
      expect.anything()
    );
    expect(wrapHermioneHandler).toBeCalledWith(
      "prependListener",
      expect.anything(),
      expect.anything()
    );
    expect(wrapHermioneHandler).toBeCalledWith(
      "intercept",
      expect.anything(),
      expect.anything()
    );
  });

  test("should create writer for master", async () => {
    hermione.isWorker.mockReturnValue(false);

    attachPlugin(hermione as unknown as Hermione, opts);

    expect(JsonWriterMaster).toBeCalledWith("plugins-profiler");
    expect(JsonWriterWorker).not.toBeCalled();
  });

  test("should create writer for worker", async () => {
    hermione.isWorker.mockReturnValue(true);

    attachPlugin(hermione as unknown as Hermione, opts);

    expect(JsonWriterWorker).toBeCalledWith("plugins-profiler");
    expect(JsonWriterMaster).not.toBeCalled();
  });

  describe("writer", () => {
    const createState = ({ isWorker }: { isWorker: boolean }) => {
      hermione.isWorker.mockReturnValue(isWorker);

      attachPlugin(hermione as unknown as Hermione, opts);

      const [calls] = (overwriteEmitAndWait as any).mock.calls;

      return calls[0];
    };

    describe("master", () => {
      let args: any;

      beforeEach(() => {
        args = createState({ isWorker: false });
      });

      test("should call 'init' on writer", async () => {
        await args.onInit();

        expect(JsonWriterMaster.prototype.init).toBeCalled();
      });

      test("should call 'end' on writer", async () => {
        await args.onFinish();

        expect(JsonWriterMaster.prototype.end).toBeCalled();
      });
    });

    describe("worker", () => {
      let args: any;

      beforeEach(() => {
        args = createState({ isWorker: true });
      });

      test("should call 'init' on writer", async () => {
        await args.onInit();

        expect(JsonWriterWorker.prototype.init).toBeCalled();
      });

      test("should call 'end' on writer", async () => {
        await args.onFinish();

        expect(JsonWriterWorker.prototype.end).toBeCalled();
      });
    });
  });
});
