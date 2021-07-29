import type Hermione from "hermione";
import _ from "lodash";

import { executeWithHooks } from "./execute-with-hooks";
import { wrapHermioneHandler } from "./wrap-hermione-handler";
import { IWriter } from "./writer";

jest.mock("./execute-with-hooks");
jest.mock("./parse-plugin-name", () => ({
  parsePluginName: jest.fn().mockReturnValue("some-name"),
}));

describe("wrapHermioneHandler", () => {
  let originOnHandlerMock: jest.Mock;
  let hermioneMock: any;
  let writerMock: any;

  beforeEach(() => {
    originOnHandlerMock = jest.fn();
    hermioneMock = {
      on: originOnHandlerMock,
      isWorker: () => true,
    };
    writerMock = {
      write: jest.fn(),
    };

    wrapHermioneHandler("on", hermioneMock as Hermione, writerMock as IWriter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should pass event and wrapper to the original handler", () => {
    hermioneMock.on("someEvent");

    expect(originOnHandlerMock).toBeCalledWith(
      "someEvent",
      expect.any(Function)
    );
  });

  test("should not perform measurement if event('cli') has to be skipped", () => {
    const eventHandler = jest.fn();

    hermioneMock.on("cli", eventHandler);

    const [call] = originOnHandlerMock.mock.calls;
    const [event, wrapper] = call;

    wrapper(event);

    expect(eventHandler).toBeCalledWith("cli");
    expect(executeWithHooks).not.toBeCalled();
  });

  test("should perform measurement if event hasn't to be skipped", () => {
    const event = "testPass";

    hermioneMock.on(event, jest.fn());

    const [, wrapper] = _.first(originOnHandlerMock.mock.calls);

    wrapper(event);

    expect(executeWithHooks).toBeCalledWith(
      expect.objectContaining({
        fn: expect.any(Function),
        before: expect.any(Function),
        after: expect.any(Function),
      })
    );
  });

  test("should pass origin handler to 'executeWithHooks'", () => {
    const eventHandler = jest.fn();
    const event = "testPass";

    hermioneMock.on(event, eventHandler);

    const [, wrapper] = _.first(originOnHandlerMock.mock.calls);

    wrapper(event, { some: "data" });

    const [executeWithHooksArgs] = _.first(
      (executeWithHooks as jest.Mock).mock.calls
    );

    executeWithHooksArgs.fn();

    expect(eventHandler).toBeCalledWith("testPass", { some: "data" });
  });

  describe("measurement", () => {
    const event = "testPass";
    let executeWithHooksArgs: any;

    beforeEach(() => {
      jest.useFakeTimers();

      hermioneMock.on(event, jest.fn());

      const [, wrapper] = _.first(originOnHandlerMock.mock.calls);

      wrapper(event, { some: "data" });

      const args = _.first((executeWithHooks as jest.Mock).mock.calls);

      executeWithHooksArgs = _.first(args);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test("should write measurement", () => {
      executeWithHooksArgs.before();

      jest.advanceTimersByTime(1000);

      executeWithHooksArgs.after();

      expect(writerMock.write).toBeCalledWith(
        expect.objectContaining({
          duration: 1000,
          end: expect.any(Number),
          event: "testPass",
          listenerName: "on",
          pid: expect.any(Number),
          pluginName: "some-name",
          start: expect.any(Number),
          worker: true,
        })
      );
    });

    test("should not write data if duration is less than required limit", () => {
      executeWithHooksArgs.before();

      jest.advanceTimersByTime(1);

      executeWithHooksArgs.after();

      expect(writerMock.write).not.toBeCalled();
    });
  });
});
