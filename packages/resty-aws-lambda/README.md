<p align="center">
  <a href="https://typeix.com" target="blank">
    <img src="https://avatars.githubusercontent.com/u/38910665?s=200&v=4" width="120" alt="Typeix Logo" />
  </a>
</p>
<p align="center">
A progressive <a href="https://nodejs.org" target="_blank">Node.js</a>
framework for building scalable applications.
</p>

# @typeix/resty Typescript framework for Node.js

[![Build Status][travis-url]][travis-img]
[![Coverage Status][coverage-img]][coverage-url]
![npm][npm-version-img]

* [Typeix Official && Documentation](https://typeix.com)
* `@typeix/resty` is typescript lightweight framework for node js
* Works with node version >= 12.9.x > latest

# Starters
* [Resty Starter WebApp][node-resty-starter]

## Features
* Dependency Injection
* Modular design
* Interceptors
* Routing

## Example Usage
```ts
import {
  pipeServer, Controller, Inject, ResolvedRoute, 
  GET, POST, OnError, RootModule, Logger, Router
} from "@typeix/resty";
import {IncomingMessage, ServerResponse, createServer} from "http";
// resty supports http, https, http2

// define controller
@Controller({
  path: "/"
})
class HomeController {

  @Inject()
  private request: IncomingMessage;

  @Inject()
  private response: ServerResponse;

  @ResolvedRoute()
  private route: IResolvedRoute;

  @GET()
  actionGet() {
    return this.route.method.toUpperCase() + " ACTION";
  }

  @POST()
  actionAjax(@RequestBody() body: Buffer) {
    return JSON.stringify(body.toString());
  }

  @OnError("*")
  errorCase() {
    return "FIRE ERROR CASE";
  }

  @GET("redirect")
  actionRedirect() {
    this.response.setHeader("Location", "/mypage");
    this.response.writeHead(307);
    this.response.end();
  }
}

// DEFINE MODULE 
@RootModule({
  imports: [], // here you can import other modules
  shared_providers: [
    {
      provide: Logger,
      useFactory: () => new Logger(Logger.defaultConfig("info"))
    },
    Router
  ],
  providers: [],
  controllers: [HomeController]
})
class ApplicationModule {}

// START SERVER
const server = createServer();
pipeServer(server, ApplicationModule);
server.listen(9000);
```

[travis-url]: https://travis-ci.com/typeix/typeix.svg?branch=master
[travis-img]: https://travis-ci.com/typeix/typeix
[npm-version-img]: https://img.shields.io/npm/v/@typeix/resty
[coverage-img]: https://coveralls.io/repos/github/typeix/typeix/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/typeix/typeix?branch=master
