export type UnregisterConsoleInterceptor = () => void;

export type ConsoleFunctionName = keyof Console;

export type ConsoleInvocation = {
  target: Partial<Console>;
  fn: (...args: any[]) => any;
  fnName: ConsoleFunctionName;
  args: any[];
  proceed: (args?: any[]) => any;
};

export type ConsoleInterceptorFn = (invocation: ConsoleInvocation) => any;
export type ConsoleInterceptorObj = {
  invoke: ConsoleInterceptorFn;
};

export type ConsoleInterceptor = ConsoleInterceptorFn | ConsoleInterceptorObj;

export type DefaultConsoleInterceptor = ConsoleInterceptor | Partial<Console>;

export type ConsoleProxy = Console & {
  setInterceptor: (interceptor?: ConsoleInterceptor | Partial<Console>) => void;
  setInterceptorFunction(
    fnName: ConsoleFunctionName,
    interceptorFn: (...args: any[]) => any
  ): UnregisterConsoleInterceptor;
  setFunctionInterceptor(
    fnName: ConsoleFunctionName,
    interceptor: ConsoleInterceptor
  ): UnregisterConsoleInterceptor;
  getTargetConsole: () => Console;
  setTargetConsole: (target: Partial<Console>) => void;
};

export const consoleFnNames = Object.freeze([
  "assert",
  "clear",
  "count",
  "countReset",
  "debug",
  "dir",
  "dirxml",
  "error",
  "exception",
  "group",
  "groupCollapsed",
  "groupEnd",
  "info",
  "log",
  "profile",
  "profileEnd",
  "table",
  "time",
  "timeEnd",
  "timeLog",
  "timeStamp",
  "trace",
  "warn",
]);

export function createConsoleProxy(
  targetConsole: Partial<Console> = console,
  defaultConsoleInterceptor?: DefaultConsoleInterceptor
): ConsoleProxy {
  let origTargetConsoleFunctions: Partial<Console>;
  let targetConsoleToUse: Partial<Console>;

  setTargetConsole(targetConsole);

  function getTargetConsole() {
    return targetConsole;
  }

  function setTargetConsole(target: Partial<Console>) {
    origTargetConsoleFunctions = { ...target };
    targetConsoleToUse = target;
  }

  let defaultInterceptor: ConsoleInterceptor | undefined;
  const fnInterceptors = new Map<string, ConsoleInterceptor>();

  function getInterceptor(fnName: string): ConsoleInterceptor | undefined {
    const fnInterceptor = fnInterceptors.get(fnName);
    return fnInterceptor ? fnInterceptor : defaultInterceptor;
  }

  function invokeInterceptor(
    interceptor: ConsoleInterceptor,
    invocation: ConsoleInvocation
  ) {
    if ("invoke" in interceptor) {
      return interceptor.invoke(invocation);
    }

    return interceptor(invocation);
  }

  function createProxyFn(fnName: ConsoleFunctionName): any {
    const proxyFn = function () {
      const args = Array.from(arguments) as [];

      const targetFn = (origTargetConsoleFunctions as any)[fnName];

      function proceed(invokeWithArgs?: any[]) {
        const effectiveArgs = invokeWithArgs ? invokeWithArgs : args;
        return targetFn.apply(origTargetConsoleFunctions, effectiveArgs);
      }

      const invocation: ConsoleInvocation = {
        target: origTargetConsoleFunctions,
        fn: targetFn,
        fnName: fnName,
        args,
        proceed,
      };

      const interceptor = getInterceptor(fnName);

      return interceptor
        ? invokeInterceptor(interceptor, invocation)
        : invocation.proceed();
    };

    return proxyFn;
  }

  function setInterceptor(interceptor?: ConsoleInterceptor | Partial<Console>) {
    if (interceptor == null) {
      defaultInterceptor = undefined;
    } else if ("invoke" in interceptor || typeof interceptor === "function") {
      defaultInterceptor = interceptor;
    } else {
      defaultInterceptor = {
        invoke(invocation: ConsoleInvocation) {
          const targetObj = interceptor as any;
          const interceptorFn = targetObj[invocation.fnName] as <R>() => R;
          return interceptorFn.apply(interceptor, invocation.args as []);
        },
      };
    }
  }

  function setInterceptorFunction(
    fnName: ConsoleFunctionName,
    interceptorFn: (...args: any[]) => any
  ) {
    if (!(fnName in targetConsoleToUse)) {
      const msg = `Console doesn't have a function named ${fnName}`;
      throw new Error(msg);
    }

    const functionInterceptor = {
      invoke(invocation: ConsoleInvocation) {
        return interceptorFn.apply(proxy, invocation.args);
      },
    };

    return setFunctionInterceptor(fnName, functionInterceptor);
  }

  function setFunctionInterceptor(
    fnName: ConsoleFunctionName,
    interceptor: ConsoleInterceptor
  ) {
    fnInterceptors.set(fnName, interceptor);
    return () => {
      fnInterceptors.delete(fnName);
    };
  }

  const proxy = consoleFnNames.reduce(
    (proxy, fn) => {
      if (origTargetConsoleFunctions[fn as ConsoleFunctionName]) {
        const proxyFn = createProxyFn(fn as ConsoleFunctionName);
        (proxy as any)[fn] = proxyFn.bind(proxy);
      }
      return proxy;
    },
    {
      setInterceptorFunction,
      setFunctionInterceptor,
      setInterceptor,
      getTargetConsole,
      setTargetConsole,
    } as ConsoleProxy
  );

  setInterceptor(defaultConsoleInterceptor);

  return proxy;
}
