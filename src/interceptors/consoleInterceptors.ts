import { ConsoleInvocation } from "../proxy/consoleProxy";

export type LogLevel = "log" | "info" | "warn" | "debug" | "error";

export type LogEnablementInterceptor = {
  invoke(invocation: ConsoleInvocation): any;
  setLevelEnabled(level: LogLevel | "all", enabled: boolean): void;
  setAllLevelsEnabled(enabled: boolean): void;
};

const logFnNames = ["log", "info", "warn", "debug", "error"];

export function createLogEnablementInterceptor(
  targetConsole: Pick<
    Console,
    "log" | "info" | "warn" | "debug" | "error"
  > = console
): LogEnablementInterceptor {
  const targetConsoleFunctions = { ...targetConsole };

  const levelEnablement = new Map<LogLevel, boolean>();
  levelEnablement.set("log", true);
  levelEnablement.set("info", true);
  levelEnablement.set("warn", true);
  levelEnablement.set("error", true);
  levelEnablement.set("debug", true);

  const setAllLevelsEnabled = (enabled: boolean) => {
    levelEnablement.set("log", enabled);
    levelEnablement.set("info", enabled);
    levelEnablement.set("warn", enabled);
    levelEnablement.set("error", enabled);
    levelEnablement.set("debug", enabled);
  };

  const setLevelEnabled = (level: LogLevel | "all", enabled: boolean) => {
    if (level === "all") {
      setAllLevelsEnabled(enabled);
    } else {
      levelEnablement.set(level, enabled);
    }
  };

  function log(level: LogLevel, args: any[]) {
    const enabled = levelEnablement.get(level);
    if (enabled) {
      const targetFn = targetConsoleFunctions[level];
      return targetFn.apply(targetConsole, args);
    }
  }

  const interceptor: LogEnablementInterceptor = {
    invoke(invocation) {
      if (logFnNames.includes(invocation.fnName)) {
        return log(invocation.fnName as LogLevel, invocation.args);
      }

      return invocation.proceed();
    },
    setLevelEnabled,
    setAllLevelsEnabled,
  };

  return interceptor;
}
