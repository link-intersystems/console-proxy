import { ConsoleProxy, createConsoleProxy } from "../../proxy/consoleProxy";
import { createConsoleTemplate, ConsoleTemplate } from "../consoleTemplate";
import { createConsoleMock } from "../../proxy/__tests__/consoleProxy.test";

describe("ConsoleTemplate Tests", () => {
  let proxyTargetMock: Console;
  let proxy: ConsoleProxy;
  let consoleTemplate: ConsoleTemplate;
  let origConsole: Console;

  beforeEach(() => {
    origConsole = { ...console };
    proxyTargetMock = createConsoleMock();

    proxy = createConsoleProxy(proxyTargetMock);
    consoleTemplate = createConsoleTemplate(proxy);
  });

  afterEach(expectConsoleEqualsConsoleBeforeTest);

  function expectConsoleEqualsConsoleBeforeTest() {
    const consoleEntries = Object.entries(console);
    const origConsoleEntries = Object.entries(origConsole);

    expect(consoleEntries).toHaveLength(origConsoleEntries.length);

    const origConsoleEntriesMap = new Map(origConsoleEntries);

    consoleEntries.forEach(([key, value]) => {
      const origValue = origConsoleEntriesMap.get(key);
      expect(value).toEqual(origValue);
    });
  }

  test("createConsoleProxyControl with default console", () => {
    console.log = jest.fn();
    try {
      const consoleProxy = createConsoleProxy();
      consoleTemplate = createConsoleTemplate(consoleProxy);

      consoleTemplate.execFn(() => console.log("enabled"));

      expect(console.log).toHaveBeenCalledWith("enabled");
    } finally {
      console.log = origConsole.log;
    }
  });

  test("execTemplate", () => {
    function testFn() {
      proxyTargetMock.log("test");
      return "test logged";
    }

    const result = consoleTemplate.execFn(testFn);

    expect(result).toBe("test logged");
    expect(proxyTargetMock.log).toBeCalledWith("test");
  });

  test("redirected Template", () => {
    const logFnMock = jest.fn();
    proxy.setInterceptorFunction("log", logFnMock);

    function testFn() {
      proxyTargetMock.log("test");
      return "test logged";
    }
    const result = consoleTemplate.execFn(testFn);

    expect(result).toBe("test logged");
    expect(logFnMock).toBeCalledWith("test");
    expect(proxyTargetMock.log).not.toBeCalledWith("test");
  });

  test("redirected template - proxy already enabled", () => {
    const logFnMock = jest.fn();
    proxy.setInterceptorFunction("log", logFnMock);

    function testFn2() {
      proxyTargetMock.log("test2");
      return "test2 logged";
    }

    function testFn() {
      const result2 = consoleTemplate.execFn(testFn2);
      proxyTargetMock.log("test");
      return "test logged " + result2;
    }

    const result = consoleTemplate.execFn(testFn);

    expect(result).toBe("test logged test2 logged");
    expect(logFnMock).toBeCalledWith("test");
    expect(logFnMock).toBeCalledWith("test2");
  });

  test("wrapFn with direct handler", () => {
    const logFnMock = jest.fn();
    proxy.setInterceptorFunction("log", logFnMock);

    function testFn() {
      proxyTargetMock.log("wrapped function logged");
      return "wrapped function logged";
    }
    const wrappedFn = consoleTemplate.wrapFn(testFn);

    const result = wrappedFn();

    expect(result).toBe("wrapped function logged");
    expect(logFnMock).toBeCalledWith("wrapped function logged");
    expect(proxyTargetMock.log).not.toBeCalledWith("wrapped function logged");
  });

  test("wrapFn with handler", () => {
    const logFnHandlerMock = jest.fn();
    proxy.setFunctionInterceptor("log", logFnHandlerMock);

    function testFn() {
      proxyTargetMock.log("wrapped function logged");
      return "wrapped function logged";
    }
    const wrappedFn = consoleTemplate.wrapFn(testFn);

    const result = wrappedFn();

    expect(result).toBe("wrapped function logged");
    expect(logFnHandlerMock).toBeCalledWith({
      target: proxyTargetMock,
      fn: proxyTargetMock.log,
      fnName: "log",
      args: ["wrapped function logged"],
      proceed: expect.any(Function),
    });
    expect(proxyTargetMock.log).not.toBeCalledWith("wrapped function logged");
  });
});
