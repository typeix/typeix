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

[![Build Status][travis-img]][travis-url]
[![Coverage Status][coverage-img]][coverage-url]
![npm][npm-version-img]

* [Typeix Official && Documentation](https://typeix.com)
* `@typeix/resty` is typescript lightweight framework for node js
* Works with node version >= 12.9.x > latest

# Resty
Fast, unopinionated, minimalist REST framework for building efficient and scalable applications.
It uses modern TypeScript and combines elements of OOP, Functional Programming and Reactive Programming.

Resty has unique features:

* Dependency Injection
* Method Interceptors
* Modular Application Design
* Request Interceptors
* Routing (Dynamic & Static)
* AWS Lambda Adapter
* Supports MVC Structure


Fast start with [application starter kit](https://github.com/typeix/resty-webapp-starter).

Documentation will be updated and each decorator and interface will be explained in separate section.

## Usage
In example below you can find basic application server starter:
```ts
import {
  pipeServer, Controller, Inject, ResolvedRoute,
  GET, POST, OnError, RootModule, Logger, Router,
  addRequestInterceptor, BodyAsBufferInterceptor
} from "@typeix/resty";
import {IncomingMessage, ServerResponse, createServer} from "http";
// resty supports http, https, http2

@Controller({
  path: "/",
  interceptors: [], // controller request interceptors executed in order
  providers: []  // providers created on each request
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
  @addRequestInterceptor(BodyAsBufferInterceptor)
  actionAjax(body: Buffer) {
    return JSON.stringify(body.toString());
  }

  // will match all routes on this controller
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
  imports: [], // import other modules, created at application bootstrap
  shared_providers: [
    {
      provide: Logger,
      useFactory: () => new Logger({ options: {level: "debug"}})
    },
    Router
  ],
  providers: [], // providers created at application bootstrap
  controllers: [HomeController] // define controllers
})
class ApplicationModule {}

// START SERVER
const server = createServer();
pipeServer(server, ApplicationModule);
server.listen(4000);
```

[travis-url]: https://travis-ci.com/typeix/typeix
[travis-img]: https://travis-ci.com/typeix/typeix.svg?branch=main
[npm-version-img]: https://img.shields.io/npm/v/@typeix/resty
[coverage-img]: https://coveralls.io/repos/github/typeix/typeix/badge.svg?branch=main
[coverage-url]: https://coveralls.io/github/typeix/typeix?branch=main
