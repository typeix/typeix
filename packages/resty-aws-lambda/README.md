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
* `@typeix/resty-aws-lambda` is lambda adapter for resty server

# Starters
* TBD

## Example Usage
```ts
import {
  Controller, Inject, ResolvedRoute, 
  GET, POST, OnError, RootModule, Logger, Router
} from "@typeix/resty";
import {lambdaServer} from "@typeix/resty-aws-lambda";

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

// CREATE SERVER
export const handler = lambdaServer(ApplicationModule);
```

[travis-url]: https://travis-ci.com/typeix/typeix
[travis-img]: https://travis-ci.com/typeix/typeix.svg?branch=main
[npm-version-img]: https://img.shields.io/npm/v/@typeix/resty
[coverage-img]: https://coveralls.io/repos/github/typeix/typeix/badge.svg?branch=main
[coverage-url]: https://coveralls.io/github/typeix/typeix?branch=main
