# Console Proxy

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/link-intersystems/console-redirection/Node.js%20CI)
![Coveralls](https://img.shields.io/coveralls/github/link-intersystems/console-redirection)
![GitHub issues](https://img.shields.io/github/issues-raw/link-intersystems/console-redirection)
[![GitHub](https://img.shields.io/github/license/link-intersystems/console-redirection?label=license)](LICENSE.md)

The consoleProxy module provides support for intercepting a console, usually the default console.

## createConsoleProxy

Create a console proxy with the default console as target.

    const consoleProxy = createConsoleProxy();

Create a console proxy with a custom target object that fulfills the [console API](https://developer.mozilla.org/en-US/docs/Web/API/Console).

    const someOtherConsole = ... // another object with the console API
    const consoleProxy = createConsoleProxy(someOtherConsole);

Create a console proxy with an interceptor that intercepts calls to the target console. The interceptor can also be set later with `ConsoleProxy.setInterceptor`.

    const logEnablementHandler = createLogEnablementHandler();
    const consoleProxy = createConsoleProxy(console, logEnablementHandler);

## ConsoleProxy.setInterceptor(interceptor?: ConsoleInterceptor | Partial<Console>) => void;

The interceptor will intercept all invocations if no function interceptor is registered. To register a function interceptor see `ConsoleProxy.setInterceptorFunction` and `ConsoleProxy.setFunctionInterceptor`

## ConsoleProxy.setFunctionInterceptor(fnName: ConsoleFunctionName, interceptor: ConsoleInterceptor): UnregisterHandler;

Register a function interceptor for a specific function. A function interceptor has access to the invocation context and therefore can be used to implement more complex logic in contrast to a `ConsoleProxy.setInterceptorFunction`.

    // Prefix all info logs with >>
    consoleProxy.setInterceptorFunction("info", (invocation) => {
        const argMsg = invocation.args.join(" ");
        const msg = `>> ${argMsg}`;
        return invocation.proceed([msg]);
    });

    consoleProxy.log("Hello World");
    consoleProxy.info("Hello World");

    // Output:
    // Hello World
    // >> Hello World

## ConsoleProxy.setInterceptorFunction(fnName: ConsoleFunctionName, interceptorFn: (...args: any[]) => any): UnregisterHandler;

An interceptor function is a more simple API of the function interceptor. You only have to provide a function with the target function's signature.

    let lastInfoLog: string = ""

    consoleProxy.setInterceptorFunction("info", (...args) => {
        lastInfoLog = args.join(" ");
    });

    consoleProxy.info("Hello", "World");

    // value of lastInfoLog is "Hello World". Nothing is logged.

## ConsoleProxy.setTargetConsole(console: Partial<Console>): void;

Set the target console to the specified console,

