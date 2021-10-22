# Console Proxy Library

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/link-intersystems/console-proxy/Node.js%20CI)
![Coveralls](https://img.shields.io/coveralls/github/link-intersystems/console-proxy)
![GitHub issues](https://img.shields.io/github/issues-raw/link-intersystems/console-proxy)
[![GitHub](https://img.shields.io/github/license/link-intersystems/console-proxy?label=license)](LICENSE.md)

A library to intercept console function calls.

## Install

     npm i "@link-intersystems/console-proxy"

## Use

    import {
        createConsoleProxy,
        createConsoleTemplate,
        createLogEnablementInterceptor,
    } from "@link-intersystems/console-proxy";

    const logEnablement = createLogEnablementInterceptor();
    const consoleProxy = createConsoleProxy(console, logEnablement);

    logEnablement.setLevelEnabled("debug", false)


    consoleProxy.info("INFO", "Hello", "World");
    consoleProxy.debug("DEBUG", "Hellow", "World");     
    // Since debug is disabled only info is logged.
    // OUTPUT:
    // INFO Hello World

A consoleProxy does not change the default console. 
If you want to change the default console you can either use the console template

    function codeThatLogs() {
        console.log("Hello");
        console.info("World");
    }

    logEnablement.setLevelEnabled("info", false)

    consoleTemplate.execFn(codeThatLogs)
    // OUTPUT:
    // Hello

or manually enable/disable the console proxy.

    const disableConsoleProxy = consoleProxy.enable();
    // The target console's functions will be redirected through the proxy.

    console.log("Hello", "World"); // is proxied

    disableConsoleProxy();
    // The target console's functions are restored.

    console.log("Hello", "World"); // is not proxied

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
