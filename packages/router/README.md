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

# Router

Typeix Router is very fast lightweight wrapper around Node.js http, https, http2 servers, which supports dynamic
routing, regex name capturing in route definitions, error handling on each route (global, local error handlers).

Installing:
```bash
npm i @typeix/di @typeix/router --save
npm i @types/node --save-dev
```

Resolved or matched route will be delivered in route handler
```ts
interface IResolvedRoute {
  params: { [key: string]: string };
  headers: { [key: string]: any };
  url: URI;
  path: string;
  method: string;
}
```
Router API:
```ts
class Router {
    static parseURI(path: string, headers: { [key: string]: any; }, defaultHost?: string): URI;
    addRules(rules: Array<IRouteConfig>): void;
    addRule(Class: TRoute, config?: IRouteConfig): void;
    pipe(server: Server): Server;
    get(path: string, handler: IRouteHandler): this;
    head(path: string, handler: IRouteHandler): this;
    post(path: string, handler: IRouteHandler): this;
    put(path: string, handler: IRouteHandler): this;
    delete(path: string, handler: IRouteHandler): this;
    connect(path: string, handler: IRouteHandler): this;
    options(path: string, handler: IRouteHandler): this;
    trace(path: string, handler: IRouteHandler): this;
    patch(path: string, handler: IRouteHandler): this;
    onError(path: string, handler: IRouteHandler): this;
}
```

## Defining Routes
Creating routes can be done via REST method api or via addRules, dynamic router can be implemented via addRule
but requires implementation of custom RouteRule.

```ts
import {Router, Injector} from "@typeix/router";
import {createServer, IncomingMessage, ServerResponse} from "http";
import {readFileSync} from "fs";

const router: Router = Injector.createAndResolve(Router, []).get(Router);

router.get("/", (injector: Injector, route: IResolvedRoute) => {});
router.post("/api/users", (injector: Injector, route: IResolvedRoute) => {});
router.get("/api/users", (injector: Injector, route: IResolvedRoute) => {});
router.get("/api/users/<id:(\\d+)>", (injector: Injector, route: IResolvedRoute) => {
    return {
        id: route.params.id,
        name: "Igor"
    }
});
router.patch("/api/users/<id:(\\d+)>", async (injector: Injector, route: IResolvedRoute) => {
    const request = injector.get(IncomingMessage);
    return {
        id: route.params.id,
        name: "Igor"
    }
});
router.get("/favicon.ico", (injector: Injector, route: IResolvedRoute) => {
    const response = injector.get(ServerResponse);
    response.end(readFileSync("./public/favicon.ico"));
});
```

## Error Handling
If any errors is thrown in route handler, router will forward exception to internal route handler.
```ts
import {Router, Injector} from "@typeix/router";
import {createServer, IncomingMessage, ServerResponse} from "http";

const router: Router = Injector.createAndResolve(Router, []).get(Router);

router.get("/",  (injector: Injector, route: IResolvedRoute) => {});
router.post("/api/users",  (injector: Injector, route: IResolvedRoute) => {});
router.get("/api/users",  (injector: Injector, route: IResolvedRoute) => {});
router.get("/api/users/<id:(\\d+)>", (injector: Injector, route: IResolvedRoute) => {});
router.patch("/api/users/<id:(\\d+)>", (injector: Injector, route: IResolvedRoute) => {});

router.onError("/api/(.*)", (injector: Injector, route: IResolvedRoute) => {
    return {...route, handler: "[Function handler]", statusCode: response.statusCode};
});

router.onError("(.*)", (injector: Injector, route: IResolvedRoute) => {
    return "GLOBAL HANDLER";
});

const server = router.pipe(createServer());
server.listen(4000);
```

## Supported Servers
Router supports all implemented servers in Node.js however http2 is implemented via http2 compatibility API
`Http2ServerRequest, Http2ServerResponse
### HTTP

```ts
import {Router, Injector} from "@typeix/router";
import {createServer, IncomingMessage, ServerResponse} from "http";

const router: Router = Injector.createAndResolve(Router, []).get(Router);
router.get("/", (injector: Injector, route: IResolvedRoute) => {
    const request = injector.get(IncomingMessage);
    const response = injector.get(ServerResponse);
});

const server = router.pipe(createServer());
server.listen(4000);
```

### HTTPS

```ts
import {Router, Injector} from "@typeix/router";
import {createServer, IncomingMessage, ServerResponse} from "https";
import {readFileSync} from "fs";

const router: Router = Injector.createAndResolve(Router, []).get(Router);
router.get("/", (injector: Injector, route: IResolvedRoute) => {
    const request = injector.get(IncomingMessage);
    const response = injector.get(ServerResponse);
});

const options = {
    key: readFileSync('localhost-privkey.pem'),
    cert: readFileSync('localhost-cert.pem')
};

const server = router.pipe(createServer(options));
server.listen(4000);
```

### HTTP2

```ts
import {Router, Injector} from "@typeix/router";
import {createServer, Http2ServerRequest, Http2ServerResponse} from "http2";
import {readFileSync} from "fs";

const router: Router = Injector.createAndResolve(Router, []).get(Router);
router.get("/", (injector: Injector, route: IResolvedRoute) => {
    const request = injector.get(Http2ServerRequest);
    const response = injector.get(Http2ServerResponse);
});

const options = {
    key: readFileSync('localhost-privkey.pem'),
    cert: readFileSync('localhost-cert.pem')
};

const server = router.pipe(createServer(options));
server.listen(4000);
```


[travis-url]: https://travis-ci.com/typeix/typeix
[travis-img]: https://travis-ci.com/typeix/typeix.svg?branch=main
[npm-version-img]: https://img.shields.io/npm/v/@typeix/resty
[coverage-img]: https://coveralls.io/repos/github/typeix/typeix/badge.svg?branch=main
[coverage-url]: https://coveralls.io/github/typeix/typeix?branch=main
