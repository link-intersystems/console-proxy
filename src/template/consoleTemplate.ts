import { ConsoleProxy } from "../proxy/consoleProxy";

type ANY_FN<A extends any[], R = any> = (...args: A) => R;

export type ConsoleTemplate = {
  execFn: <A extends any[], R>(fn: ANY_FN<A, R>, ...args: A) => R;
  wrapFn: <A extends any[], R>(fn: ANY_FN<A, R>) => ANY_FN<A, R>;
};

export function createConsoleTemplate(
  consoleProxy: ConsoleProxy
): ConsoleTemplate {
  const execFn = <A extends any[] = any[], R = any>(
    fn: ANY_FN<A, R>,
    ...args: A
  ): R => {
    const disableProxy = consoleProxy.isProxyEnabled()
      ? null
      : consoleProxy.enableProxy();
    try {
      const fnThis = (fn as any).this;
      return fn.apply<any, A, R>(fnThis, args);
    } finally {
      if (disableProxy) disableProxy();
    }
  };

  const wrapFn = <A extends any[] = any[], R = any>(fn: ANY_FN<A, R>) => {
    return function (...args: A) {
      const fnThis = (fn as any).this;
      return execFn(() => fn.apply(fnThis, args));
    };
  };

  return {
    execFn,
    wrapFn,
  };
}
