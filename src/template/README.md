# Console Template

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/link-intersystems/console-proxy/Node.js%20CI)
![Coveralls](https://img.shields.io/coveralls/github/link-intersystems/console-proxy)
![GitHub issues](https://img.shields.io/github/issues-raw/link-intersystems/console-proxy)
[![GitHub](https://img.shields.io/github/license/link-intersystems/console-proxy?label=license)](LICENSE.md)

The console template module provides template methods that ensure that the console is properly proxies when the target function executes.

## execFn<A extends any[], R>(fn: ANY_FN<A, R>, ...args: A) => R;

The execFn let you execute a single function with a proxied console.

    function codeThatLogs() {
        console.log("Hello");
        console.info("World");
    }

    const consoleProxy = createConsoleProxy();
    const logEnablementHandler = createLogEnablementHandler();
    consoleProxy.setDefaultHandler(logEnablementHandler);

    const consoleTemplate = createConsoleTemplate(consoleProxy);

    // will log "Hello" and "World" (info)
    consoleTemplate.execFn(codeThatLogs)

    // disable level "info"
    logEnablementHandler.setLevelEnabled("info", false);

    // will log "Hello"
    consoleTemplate.execFn(codeThatLogs)

The execFn signature allows any function with any args and supports return types.

    function logMsg(msg: string) {
        const msgToLog = `Hello ${msg}`;
        console.log(msgToLog);
        return msgToLog;
    }

    logEnablementHandler.setLevelEnabled("log", true);

    // will log "Hello World" and return "Hello World"
    const result1 = consoleTemplate.execFn(logMsg, "World")

    logEnablementHandler.setLevelEnabled("log", false);

    // will not log anything, but return "Hello World"
    const result2 = consoleTemplate.execFn(() => logMsg("World"))

## wrapFn<A extends any[], R>(fn: ANY_FN<A, R>) => ANY_FN<A, R>

Creates a function wrapper that ensures that the console is proxied whenever the wrapped function is executed.

    function codeThatLogs() {
        console.log("Hello");
        console.info("World");
    }

    const consoleProxy = createConsoleProxy();
    const logEnablementHandler = createLogEnablementHandler();
    consoleProxy.setDefaultHandler(logEnablementHandler);

    const consoleTemplate = createConsoleTemplate(consoleProxy);

    const wrappedCodeThatLogs = consoleTemplate.wrapFn(codeThatLogs);

    // disable level "info"
    logEnablementHandler.setLevelEnabled("info", false);

    // will log "Hello", but not "World" since info level is disabled
    wrappedCodeThatLogs()
