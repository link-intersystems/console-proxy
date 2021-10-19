# Console Redirection

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/link-intersystems/console-redirection/Node.js%20CI)
![Coveralls](https://img.shields.io/coveralls/github/link-intersystems/console-redirection)
![GitHub issues](https://img.shields.io/github/issues-raw/link-intersystems/console-redirection)
[![GitHub](https://img.shields.io/github/license/link-intersystems/console-redirection?label=license)](LICENSE.md)

A library to intercept console function calls and redirect them wherever you like.

## Console Template Module

The console template module provides template methods that ensure that the console is properly proxies when the target function executes. [Read more](src/template/README.md)

    logEnablementHandler.setLevelEnabled("info", false);
    consoleTemplate.execFn(codeThatLogs)

## Console Proxy Module

The consoleProxy module provides support for intercepting a console, usually the default console. [Read more](src/proxy/README.md)

    let lastInfoLog: string;

    const consoleProxy = createConsoleProxy();
    consoleProxy.setInterceptorFunction("info", (...args) => {
        lastInfoLog = args.join(" ");
    })

    consoleProxy.setInterceptorFunction("log", (...args) => {
        // log diabled
    })

## Console Proxy Interceptors

This module contains interceptors for the [ConsoleProxy](../proxy/README.md). [Read more](src/interceptors/README.md)

     const logEnablementInterceptor = createLogEnablementInterceptor();
     logEnablementInterceptor.setLevelEnabled("log", false);

     consoleProxy.setInterceptor(logEnablementInterceptor);
