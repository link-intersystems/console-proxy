import {
  consoleFnNames,
  ConsoleProxy,
  createConsoleProxy,
  ConsoleFunctionName,
} from "../consoleProxy";

export function createConsoleMock() {
  return consoleFnNames.reduce((proxy, fn) => {
    (proxy as any)[fn] = jest.fn();
    return proxy;
  }, {} as Console);
}

describe("ConsoleProxy Tests", () => {
  let consoleMock: Console;
  let consoleProxy: ConsoleProxy;

  beforeAll(() => {});

  beforeEach(() => {
    consoleMock = createConsoleMock();
    consoleProxy = createConsoleProxy(consoleMock);
  });

  afterEach(() => {});

  test("consoleFnNames are froozen", () => {
    const fnName = consoleFnNames[0];
    expect(() => ((consoleFnNames as any)[0] = "test")).toThrowError();
    expect(consoleFnNames[0]).toEqual(fnName);
  });

  test("do not create function proxies for undefined target functions", () => {
    delete (consoleMock as any).clear;

    consoleProxy = createConsoleProxy(consoleMock);

    expect(consoleProxy.clear).toBeUndefined();
  });

  test("setInterceptor", () => {
    const defaultHandlerMock = jest.fn();
    consoleProxy.setInterceptor(defaultHandlerMock);

    consoleProxy.log("enabled");

    expect(defaultHandlerMock).toHaveBeenCalledWith({
      target: consoleMock,
      fn: consoleMock.log,
      fnName: "log",
      args: ["enabled"],
      proceed: expect.any(Function),
    });
  });

  test("Reset setInterceptor", () => {
    const defaultHandlerMock = jest.fn();
    consoleProxy.setInterceptor(defaultHandlerMock);
    consoleProxy.setInterceptor();

    consoleProxy.log("enabled");
    expect(consoleMock.log).toHaveBeenCalledWith("enabled");
  });

  test("setInterceptor with partial console", () => {
    const defaultHandlerMock = jest.fn();
    consoleProxy.setInterceptor({
      log: defaultHandlerMock,
    });

    consoleProxy.log("enabled");

    expect(defaultHandlerMock).toHaveBeenCalledWith("enabled");
  });

  test("create with partial console", () => {
    const defaultHandlerMock = jest.fn();
    consoleProxy = createConsoleProxy(consoleMock, {
      log: defaultHandlerMock,
    });

    consoleProxy.log("enabled");

    expect(defaultHandlerMock).toHaveBeenCalledWith("enabled");
  });

  test("create with default console", () => {
    const origConsole = { ...console };
    const logFn = jest.fn();
    console.log = logFn;

    try {
      consoleProxy = createConsoleProxy();

      consoleProxy.log("enabled");

      expect(logFn).toHaveBeenCalledWith("enabled");
    } finally {
      console.log = origConsole.log;
    }
  });

  test("create with custom console", () => {
    const customConsole = createConsoleMock();
    consoleProxy = createConsoleProxy(customConsole);

    consoleProxy.log("enabled");

    expect(customConsole.log).toHaveBeenCalledWith("enabled");
    expect(consoleMock.log).not.toHaveBeenCalledWith("enabled");
  });

  test("setInterceptorFunction", () => {
    const logFnMock = jest.fn();
    consoleProxy.setInterceptorFunction("log", logFnMock);

    consoleProxy.log("test");
    expect(logFnMock).toHaveBeenCalledWith("test");

    consoleProxy.log();
    expect(logFnMock).toHaveBeenCalledWith();
  });

  test("proceed with custom args", () => {
    consoleProxy.setFunctionInterceptor("log", (invocation) => {
      const customArgs = ["LOGGED"];
      customArgs.push(invocation.args[0]);
      invocation.proceed(customArgs);
    });

    consoleProxy.log("test");
    expect(consoleMock.log).toHaveBeenCalledWith("LOGGED", "test");
  });

  test("setInterceptorFunction unknown function", () => {
    expect(() =>
      consoleProxy.setInterceptorFunction(
        "foobar" as ConsoleFunctionName,
        jest.fn()
      )
    ).toThrowError();
  });

  test("setFunctionInterceptor", () => {
    const logFnHandlerMock = jest.fn();
    consoleProxy.setFunctionInterceptor("log", logFnHandlerMock);

    consoleProxy.log("test");
    expect(logFnHandlerMock).toHaveBeenCalledWith({
      target: consoleMock,
      fn: consoleMock.log,
      fnName: "log",
      args: ["test"],
      proceed: expect.any(Function),
    });

    consoleProxy.log();
    expect(logFnHandlerMock).toHaveBeenCalledWith({
      target: consoleMock,
      fn: consoleMock.log,
      fnName: "log",
      args: [],
      proceed: expect.any(Function),
    });
  });

  test("getTargetConsole", () => {
    const targetConsole = consoleProxy.getTargetConsole();

    expect(targetConsole).toBe(consoleMock);
  });

  test("setTargetConsole", () => {
    const newTargetConsole = createConsoleMock();
    consoleProxy.setTargetConsole(newTargetConsole);

    consoleProxy.info("log new target");

    expect(newTargetConsole.info).toHaveBeenCalledWith("log new target");
  });

  test("proxy only has methods of target console", () => {
    consoleProxy = createConsoleProxy({ log: () => null } as any as Console);

    const notContainedConsoleFns = [...consoleFnNames].filter(
      (fn) => fn !== "log"
    );
    expect(Object.keys(consoleProxy)).toContain("log");

    notContainedConsoleFns.forEach((fn) =>
      expect(Object.keys(consoleProxy)).not.toContain(fn)
    );
  });

  test("enable/disable", () => {
    const logFnHandlerMock = jest.fn();
    consoleProxy.setInterceptorFunction("log", logFnHandlerMock);
    const disableProxy = consoleProxy.enableProxy();

    consoleMock.log("test");

    expect(logFnHandlerMock).toHaveBeenCalledWith("test");

    disableProxy();

    consoleMock.log("test2");
    expect(logFnHandlerMock).not.toHaveBeenCalledWith("test2");
  });

  test("enable/disable twice", () => {
    const logFnHandlerMock = jest.fn();
    consoleProxy.setInterceptorFunction("log", logFnHandlerMock);
    const disableProxy1 = consoleProxy.enableProxy();
    const disableProxy2 = consoleProxy.enableProxy();

    consoleMock.log("test");

    expect(logFnHandlerMock).toHaveBeenCalledWith("test");

    disableProxy1();
    disableProxy2();

    consoleMock.log("test2");
    expect(logFnHandlerMock).not.toHaveBeenCalledWith("test2");
  });

  test("assert", () => {
    testConsoleMethod("assert", true, {
      msg: "assertCalled",
    });
  });

  test("clear", () => {
    testConsoleMethod("clear");
  });

  test("count", () => {
    testConsoleMethod("count", "label");
  });

  test("countReset", () => {
    testConsoleMethod("countReset", "label");
  });

  test("debug", () => {
    testConsoleMethod("debug", { name: "someObject" }, "arg1", "arg2");
  });

  test("dir", () => {
    testConsoleMethod("dir", { name: "someObject" });
  });

  test("dirxml", () => {
    testConsoleMethod("dirxml", { name: "someObject" });
  });

  test("error", () => {
    testConsoleMethod("error", { name: "someObject" }, "arg1", "arg2");
  });

  test("exception", () => {
    testConsoleMethod(
      "exception" as ConsoleFunctionName,
      { name: "someObject" },
      "arg1",
      "arg2"
    );
  });

  test("group", () => {
    testConsoleMethod("group", "label");
  });

  test("groupCollapsed", () => {
    testConsoleMethod("groupCollapsed", "label");
  });

  test("groupEnd", () => {
    testConsoleMethod("groupEnd");
  });

  test("info", () => {
    testConsoleMethod("info");
  });

  test("log", () => {
    testConsoleMethod("log", { name: "someObject" }, "arg1", "arg2");
  });

  test("profile", () => {
    testConsoleMethod("profile", "profileName");
  });

  test("profileEnd", () => {
    testConsoleMethod("profileEnd", "profileName");
  });

  test("table", () => {
    testConsoleMethod("table", ["apples", "oranges", "bananas"]);
  });

  test("time", () => {
    testConsoleMethod("time", "label");
  });

  test("timeEnd", () => {
    testConsoleMethod("timeEnd", "label");
  });

  test("timeLog", () => {
    testConsoleMethod("timeLog", "label");
  });

  test("timeStamp", () => {
    testConsoleMethod("timeStamp", "label");
  });

  test("trace", () => {
    testConsoleMethod("trace", { name: "someObject" }, "arg1", "arg2");
  });

  test("warn", () => {
    testConsoleMethod("warn", { name: "someObject" }, "arg1", "arg2");
  });

  function testIntercepted(fnName: ConsoleFunctionName, ...args: any[]) {
    (consoleProxy as any)[fnName].apply(consoleProxy, args);

    expect((consoleMock as any)[fnName]).toHaveBeenCalledTimes(1);
    expect((consoleMock as any)[fnName]).toHaveBeenCalledWith(...args);
  }

  function testNotIntercepted(fnName: ConsoleFunctionName, ...args: any[]) {
    (consoleMock as any)[fnName] = jest.fn();

    const unset = consoleProxy.setFunctionInterceptor(fnName, () => {});
    try {
      (consoleProxy as any)[fnName].apply(consoleProxy, args);
    } finally {
      unset();
    }

    expect((consoleMock as any)[fnName]).not.toHaveBeenCalledWith(...args);
  }

  function testConsoleMethod(fnName: ConsoleFunctionName, ...args: any[]) {
    testIntercepted(fnName, args);
    testNotIntercepted(fnName, args);
  }
});
