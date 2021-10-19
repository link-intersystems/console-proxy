# Console Proxy Interceptors

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/link-intersystems/console-redirection/Node.js%20CI)
![Coveralls](https://img.shields.io/coveralls/github/link-intersystems/console-redirection)
![GitHub issues](https://img.shields.io/github/issues-raw/link-intersystems/console-redirection)
[![GitHub](https://img.shields.io/github/license/link-intersystems/console-redirection?label=license)](LICENSE.md)

This module contains interceptors for the [ConsoleProxy](../proxy/README.md).

## createLogEnablementInterceptor(targetConsole: Console = console): LogEnablementInterceptor

Creates an interceptor that only invokes the target console's log functions if they are enabled.

Create a LogEnablementInterceptor with the defaul console.

    const logEnablementInterceptor = createLogEnablementInterceptor();

Create a LogEnablementInterceptor with a specific console.

    const targetConsole = ... // object that fulfills the console API
    const logEnablementInterceptor = createLogEnablementInterceptor(targetConsole);

### setLevelEnabled(level: LogLevel | "all", enabled: boolean): void

    logEnablementInterceptor.setLevelEnabled("log", false);

Valid log levels are

    type LogLevel = "log" | "info" | "warn" | "debug" | "error";
