<p align="center">
  <a href="https://typeix.com" target="blank">
    <img src="https://avatars.githubusercontent.com/u/38910665?s=200&v=4" width="120" alt="Typeix Logo" />
  </a>
</p>
<p align="center">
A progressive <a href="https://nodejs.org" target="_blank">Node.js</a>
tools for building efficient and scalable applications.
</p>

# @typeix/logger 

[![Build Status][travis-img]][travis-url]
[![Coverage Status][coverage-img]][coverage-url]
![npm][npm-version-img]

# Logger

Resty comes with a built-in [Pino](https://github.com/pinojs/pino) logger wrapper which is used during application
bootstrapping such as displaying scanned routing info (i.e., system logging, bootstrap errors).

You can fully control the behavior of the logging system:

* disable logging entirely
* specify the log level of detail (e.g., display errors, warnings, debug information, etc.)
* customize the default logger by extending it
* create your own custom implementation, to log your own application-level events and messages.

For more advanced logging functionality, you can make use of any Node.js logging package, such
as [Winston](https://github.com/winstonjs/winston), to implement a completely custom, production grade logging system.

## Usage
```ts
interface LoggerOptions {
  options: pino.LoggerOptions;
  stream?: pino.DestinationStream;
}
const options: LoggerOptions = {
    options: {
        level: "error"
    }
};
const logger = new Logger(options);
logger.info({id: 1, whatever: 2}, "Some nice custom message");
```
[travis-url]: https://travis-ci.com/typeix/typeix
[travis-img]: https://travis-ci.com/typeix/typeix.svg?branch=main
[npm-version-img]: https://img.shields.io/npm/v/@typeix/resty
[coverage-img]: https://coveralls.io/repos/github/typeix/typeix/badge.svg?branch=main
[coverage-url]: https://coveralls.io/github/typeix/typeix?branch=main
