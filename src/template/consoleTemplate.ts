import { ConsoleProxy } from "../proxy/consoleProxy";

type ANY_FN<A = any, R = any> = (
  fn: (...args: A[]) => R
) => (...args: A[]) => R;

export type ConsoleTemplate = {
  execFn: ANY_FN;
  wrapFn: ANY_FN;
};

export function createConsoleTemplate(
  consoleProxy: ConsoleProxy
): ConsoleTemplate {
  const execFn = <R = any>(fn: () => R): R => {
    const disableProxy = consoleProxy.isProxyEnabled()
      ? null
      : consoleProxy.enableProxy();
    try {
      return fn();
    } finally {
      disableProxy?.();
    }
  };

  const wrapFn = <R = any>(fn: ANY_FN<any, R>) => {
    return function () {
      const args = Array.from(arguments);
      return execFn(() => (fn as any).apply((fn as any).this , args));
    };
  };

  return {
    execFn,
    wrapFn,
  };
}
