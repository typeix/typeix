<p align="center">
  <a href="https://typeix.com" target="blank">
    <img src="https://avatars.githubusercontent.com/u/38910665?s=200&v=4" width="120" alt="Typeix Logo" />
  </a>
</p>
<p align="center">
A progressive <a href="https://nodejs.org" target="_blank">Node.js</a>
tools for building efficient and scalable applications.
</p>

# @typeix/router

[![Build Status][travis-img]][travis-url]
[![Coverage Status][coverage-img]][coverage-url]
![npm][npm-version-img]

Versions from 6.x are not compatible with prior versions, router works with http, https, http2 protocols.

## Required
- Node.js gte 6.x
- Typescript gte 2.x

## Installing:
```bash
npm i @typeix/di @typeix/router @typeix/utils --save
npm i @types/node --save-dev
```

## Simple usage:
```ts
import {Router, Injector} from "@typeix/router";
import {createServer, IncomingMessage, ServerResponse} from "http";

let router: Router = Injector.createAndResolve(Router, []).get(Router);
/**
 * Route handler example
 * @param injector
 */
function handler(injector: Injector, route: IResolvedRoute) {
  return {
    ...route,
    handler: "[Function handler]"
  };
}
router.get("/", handler);
router.get("/home", handler);
router.get("/home/<id:(\\d+)>", handler);
router.get("/home/<id:(\\d+)>/handler", handler);
router.get("/favicon.ico", () => {
    return Buffer.from("favicon.ico");
  }
);
/**
 * Add custom error route, internally if exception happens router forwards error to custom route if no error route is defined
 * router will display json output as error message, if you want to catch all errors in single route set "*" as url router.onError("*", injector => {})
 */
router.onError("/home/(.*)", (injector: Injector, route: IResolvedRoute) => {
  return {...route, handler: "[Function handler]", statusCode: response.statusCode};
});
/**
 * Request handler example
 * @param {module:http.IncomingMessage} request
 * @param {module:http.ServerResponse} response
 * @returns {Promise<void>}
 */
let server = router.pipe(createServer());
server.listen(4000);
```

## Extended API usage:

```typescript
import {Router, Injector} from "@typeix/router";
import {createServer, IncomingMessage, ServerResponse} from "http";

let router: Router = Injector.createAndResolve(Router, []).get(Router);
/**
 * Route handler example
 * @param injector
 */
function handler(injector: Injector, route: IResolvedRoute) {
  let request = injector.get(IncomingMessage);
  let response = injector.get(ServerResponse);
  let body = JSON.stringify({
    ...route,
    handler: "[Function handler]",
    request: {
      url: request.url,
      method: request.method,
      headers: request.headers
    }
  }, null, " ");
  response.end(body);
}

/**
 * Add routes
 */
router.get("/", handler);
router.get("/home", handler);
router.get("/home/<id:(\\d+)>", handler);
router.get("/home/<id:(\\d+)>/handler", handler);
router.get("/favicon.ico",
  (injector: Injector) => {
    let response = injector.get(ServerResponse);
    response.end(Buffer.from("favicon.ico"));
  }
);
/**
 * Add custom error route, internally if exception happens router forwards error to custom route if no error route is defined
 * router will display json output as error message, if you want to catch all errors in single route set "*" as url router.onError("*", injector => {})
 */
router.onError("/home/(.*)", (injector: Injector, route: IResolvedRoute) => {
  let response = injector.get(ServerResponse);
  let body = JSON.stringify({...route, handler: "[Function handler]", statusCode: response.statusCode}, null, " ");
  response.end(body);
});
/**
 * Request handler example
 * @param {module:http.IncomingMessage} request
 * @param {module:http.ServerResponse} response
 * @returns {Promise<void>}
 */
let server = router.pipe(createServer());
server.listen(4000);
```

### Running routes:
- ```/``` outputs ```{"url":"/", "method":"GET", "params":{}}```
- ```/home```  outputs ```{"url":"/home", "method":"GET", "params":{}}```
- ```/home/123```  outputs ```{"url":"/home/123", "method":"GET", "params":{"id":"123"}}```
- ```/home/444```  outputs ```{"url":"/home/123", "method":"GET", "params":{"id":"444"}}```
- ```/home/444d```  outputs ```{"url":"/home/444d", "method":"TRACE", "params":{}, statusCode: 404}```it does not match  "/home/<id:(\\d+)>" regex
- ```/favicon.ico```  outputs ```{"url":"/favicon.ico", "method":"GET", "params":{}}```


[travis-url]: https://travis-ci.com/typeix/typeix
[travis-img]: https://travis-ci.com/typeix/typeix.svg?branch=main
[npm-version-img]: https://img.shields.io/npm/v/@typeix/resty
[coverage-img]: https://coveralls.io/repos/github/typeix/typeix/badge.svg?branch=main
[coverage-url]: https://coveralls.io/github/typeix/typeix?branch=main
