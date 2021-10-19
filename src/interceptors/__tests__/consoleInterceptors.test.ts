import {
  ConsoleFunctionName,
  ConsoleInvocation,
} from "../../proxy/consoleProxy";
import { createConsoleMock } from "../../proxy/__tests__/consoleProxy.test";
import {
  createLogEnablementInterceptor,
  LogEnablementInterceptor,
} from "../consoleInterceptors";

describe("ConsoleHandler Tests", () => {
  let consoleMock: Console;
  let logEnablementInterceptor: LogEnablementInterceptor;

  beforeEach(() => {
    consoleMock = createConsoleMock();
    logEnablementInterceptor = createLogEnablementInterceptor(consoleMock);
  });

  test("logEnablementInterceptor - all levels enabled per default", () => {
    log("log1", "log2");
    expect(consoleMock.log).toHaveBeenCalledWith("log1", "log2");

    info("info1", "info2");
    expect(consoleMock.info).toHaveBeenCalledWith("info1", "info2");

    warn("warn1", "warn2");
    expect(consoleMock.warn).toHaveBeenCalledWith("warn1", "warn2");

    debug("debug1", "debug2");
    expect(consoleMock.debug).toHaveBeenCalledWith("debug1", "debug2");

    error("error1", "error2");
    expect(consoleMock.error).toHaveBeenCalledWith("error1", "error2");
  });

  test("logEnablementInterceptor - disable all levels", () => {
    logEnablementInterceptor.setAllLevelsEnabled(false);

    log("log");
    info("info");
    warn("warn");
    debug("debug");
    error("error");

    expect(consoleMock.log).toHaveBeenCalledTimes(0);
    expect(consoleMock.info).toHaveBeenCalledTimes(0);
    expect(consoleMock.warn).toHaveBeenCalledTimes(0);
    expect(consoleMock.debug).toHaveBeenCalledTimes(0);
    expect(consoleMock.error).toHaveBeenCalledTimes(0);
  });
  test("logEnablementInterceptor - reenable all levels", () => {
    logEnablementInterceptor.setAllLevelsEnabled(false);
    logEnablementInterceptor.setAllLevelsEnabled(true);

    log("log");
    info("info");
    warn("warn");
    debug("debug");
    error("error");

    expect(consoleMock.log).toHaveBeenCalledWith("log");
    expect(consoleMock.info).toHaveBeenCalledWith("info");
    expect(consoleMock.warn).toHaveBeenCalledWith("warn");
    expect(consoleMock.debug).toHaveBeenCalledWith("debug");
    expect(consoleMock.error).toHaveBeenCalledWith("error");
  });

  test("logEnablementInterceptor - disable all levels using all level", () => {
    logEnablementInterceptor.setLevelEnabled("all", false);

    log("log");
    info("info");
    warn("warn");
    debug("debug");
    error("error");

    expect(consoleMock.log).toHaveBeenCalledTimes(0);
    expect(consoleMock.info).toHaveBeenCalledTimes(0);
    expect(consoleMock.warn).toHaveBeenCalledTimes(0);
    expect(consoleMock.debug).toHaveBeenCalledTimes(0);
    expect(consoleMock.error).toHaveBeenCalledTimes(0);
  });
  test("logEnablementInterceptor - reenable all levels using all level", () => {
    logEnablementInterceptor.setLevelEnabled("all", false);
    logEnablementInterceptor.setLevelEnabled("all", true);

    log("log");
    info("info");
    warn("warn");
    debug("debug");
    error("error");

    expect(consoleMock.log).toHaveBeenCalledWith("log");
    expect(consoleMock.info).toHaveBeenCalledWith("info");
    expect(consoleMock.warn).toHaveBeenCalledWith("warn");
    expect(consoleMock.debug).toHaveBeenCalledWith("debug");
    expect(consoleMock.error).toHaveBeenCalledWith("error");
  });

  test("logEnablementInterceptor - disable log", () => {
    logEnablementInterceptor.setLevelEnabled("log", false);

    log("log");

    expect(consoleMock.log).toHaveBeenCalledTimes(0);
  });

  test("logEnablementInterceptor - disable info", () => {
    logEnablementInterceptor.setLevelEnabled("info", false);

    info("info");

    expect(consoleMock.info).toHaveBeenCalledTimes(0);
  });

  test("logEnablementInterceptor - disable warn", () => {
    logEnablementInterceptor.setLevelEnabled("warn", false);

    warn("warn");

    expect(consoleMock.warn).toHaveBeenCalledTimes(0);
  });

  test("logEnablementInterceptor - disable debug", () => {
    logEnablementInterceptor.setLevelEnabled("debug", false);

    debug("debug");

    expect(consoleMock.debug).toHaveBeenCalledTimes(0);
  });

  test("logEnablementInterceptor - disable error", () => {
    logEnablementInterceptor.setLevelEnabled("error", false);

    error("error");

    expect(consoleMock.error).toHaveBeenCalledTimes(0);
  });

  test("proceed non log functions", () => {
    logEnablementInterceptor.invoke(invocation("clear", []));

    expect(consoleMock.clear).toHaveBeenCalledTimes(1);
  });

  test("logEnablementInterceptor default console", () => {
    const origConsole = console;
    const logFnMock = jest.fn();
    console.log = logFnMock;

    logEnablementInterceptor = createLogEnablementInterceptor();

    try {
      log("log");
    } finally {
      console.log = origConsole.log;
    }

    expect(logFnMock).toHaveBeenCalledWith("log");
  });

  function log(...args: any[]) {
    logEnablementInterceptor.invoke(invocation("log", args));
  }

  function info(...args: any[]) {
    logEnablementInterceptor.invoke(invocation("info", args));
  }

  function warn(...args: any[]) {
    logEnablementInterceptor.invoke(invocation("warn", args));
  }

  function debug(...args: any[]) {
    logEnablementInterceptor.invoke(invocation("debug", args));
  }

  function error(...args: any[]) {
    logEnablementInterceptor.invoke(invocation("error", args));
  }

  function invocation(
    fnName: ConsoleFunctionName,
    args: any[]
  ): ConsoleInvocation {
    function proceed(proceedArgs?: any[]) {
      return (consoleMock[fnName] as any).apply(
        consoleMock,
        proceedArgs ? proceedArgs : args
      );
    }

    return {
      target: consoleMock,
      fn: consoleMock[fnName] as any,
      fnName,
      args,
      proceed,
    };
  }
});
