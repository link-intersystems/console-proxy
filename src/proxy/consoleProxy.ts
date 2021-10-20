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
  enableProxy(): DisableProxy;
  isProxyEnabled(): boolean;
};

export const consoleLogFnNames = Object.freeze([
  "log",
  "info",
  "warn",
  "debug",
  "error",
]);

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

export type DisableProxy = () => void;

type ProxyFunction = {
  name: ConsoleFunctionName;
  fn: any;
};

export function createConsoleProxy(
  targetConsoleArg: Partial<Console> = console,
  defaultConsoleInterceptor?: DefaultConsoleInterceptor
): ConsoleProxy {
  let targetFunctions: Partial<Console>;
  let targetConsole: Partial<Console>;

  function getTargetConsole() {
    return targetConsoleArg;
  }

  function setTargetConsole(target: Partial<Console>) {
    targetFunctions = { ...target };
    targetConsole = target;
  }

  function getTargetFunction(fnName: ConsoleFunctionName) {
    return (targetFunctions as any)[fnName];
  }

  function getTargetFunctions() {
    return targetFunctions;
  }

  setTargetConsole(targetConsoleArg);

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

      const targetFn = getTargetFunction(fnName);

      function proceed(invokeWithArgs?: any[]) {
        const effectiveArgs = invokeWithArgs ? invokeWithArgs : args;
        return targetFn.apply(targetFunctions, effectiveArgs);
      }

      const invocation: ConsoleInvocation = {
        target: getTargetFunctions(),
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
          const partialConsole = interceptor as Partial<Console>;
          const interceptorFn = partialConsole[invocation.fnName] as <R>() => R;
          return interceptorFn.apply(interceptor, invocation.args as []);
        },
      };
    }
  }

  function setInterceptorFunction(
    fnName: ConsoleFunctionName,
    interceptorFn: (...args: any[]) => any
  ) {
    const targetFunctions = getTargetFunctions();
    if (!(fnName in targetFunctions)) {
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
      if (targetFunctions[fn as ConsoleFunctionName]) {
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

  function createProxyFunctions(target: any): ProxyFunction[] {
    const proxyFunctions: ProxyFunction[] = [];

    consoleFnNames.forEach((fnName) => {
      if (typeof target[fnName] === "function") {
        const proxyFn = function () {
          return (target as any)[fnName].apply(target, arguments);
        };
        proxyFunctions.push({
          name: fnName as ConsoleFunctionName,
          fn: proxyFn,
        });
      }
    });

    return proxyFunctions;
  }

  const proxyFunctions = createProxyFunctions(proxy);

  function isProxyEnabled() {
    return proxyFunctions
      .map((pf) => (targetConsole as any)[pf.name] === pf.fn)
      .every((e) => e === true);
  }

  function enableProxy(): DisableProxy {
    const targetFunctions = getTargetFunctions();
    const disableProxy = () => {
      if (isProxyEnabled())
        proxyFunctions.forEach(
          (pf) =>
            // eslint-disable-next-line no-native-reassign
            ((targetConsole as any)[pf.name] = targetFunctions[pf.name])
        );
    };

    if (isProxyEnabled()) {
      return disableProxy;
    }

    proxyFunctions.forEach(
      (pf) => (targetConsole[pf.name as ConsoleFunctionName] = pf.fn)
    );

    return disableProxy;
  }

  proxy.enableProxy = enableProxy;
  proxy.isProxyEnabled = isProxyEnabled;

  return proxy;
}
