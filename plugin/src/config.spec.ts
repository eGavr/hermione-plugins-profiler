import { parseConfig } from "./config";

describe("JsonStreamWriter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should throw if 'enabled' is not the boolean", () => {
    const opts = { enabled: "asd" } as unknown as any;

    expect(() => parseConfig(opts)).toThrow(/'enabled' must be a boolean/);
  });

  test("should throw if 'reportPath' is not presented", () => {
    const opts = { enabled: false } as any;

    expect(() => parseConfig(opts)).toThrow(/'reportPath' must be presented/);
  });

  test("should parse config", () => {
    const opts = {
      enabled: false,
      reportPath: "some/path",
    } as any;

    const res = parseConfig(opts);

    expect(res).toMatchObject({ enabled: false, reportPath: "some/path" });
  });
});
