# Console Redirection

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/link-intersystems/console-redirection/Node.js%20CI)
![Coveralls](https://img.shields.io/coveralls/github/link-intersystems/console-redirection)
![GitHub issues](https://img.shields.io/github/issues-raw/link-intersystems/console-redirection)
[![GitHub](https://img.shields.io/github/license/link-intersystems/console-redirection?label=license)](LICENSE.md)

A library to intercept console function calls.

## Install

     npm i "@link-intersystems/console-redirection"

## Use

    import {
        createConsoleProxy,
        createConsoleTemplate,
        createLogEnablementInterceptor,
    } from "@link-intersystems/console-redirection";

    const logEnablement = createLogEnablementInterceptor();
    const consoleProxy = createConsoleProxy(console, logEnablement);

    logEnablement.setLevelEnabled("debug", false)


    consoleProxy.info("INFO", "Hello", "World");
    // Since debug is disabled only info is logged.
    consoleProxy.debug("DEBUG", "Hellow", "World");     
    // OUTPUT:
    // INFO Hello World

A consoleProxy does not change the default console. 
If you want to change the default console 
you can use the console template.

    function codeThatLogs() {
        console.log("Hello");
        console.info("World");
    }

    logEnablement.setLevelEnabled("info", false)

    consoleTemplate.execFn(codeThatLogs)
    // OUTPUT:
    // Hello

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
