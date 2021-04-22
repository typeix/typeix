import {getMethodDecorator, getMethodParams} from "../helpers";
import {
  CONNECT,
  Controller,
  DELETE,
  GET,
  HEAD,
  Module,
  OnError,
  OPTIONS,
  PATCH,
  POST,
  PUT,
  RootModule,
  TRACE
} from "../decorators";
import {getClassMetadata, IMetadata} from "@typeix/metadata";
import {InterceptedRequest, RequestInterceptor} from "../interfaces";
import {Injectable, Injector, verifyProvider} from "@typeix/di";
import {IncomingMessage, ServerResponse} from "http";
import {IRouteHandler, Router, RouterError, RouteRule} from "@typeix/router";
import {Server, Socket} from "net";
import {pipeServer} from "./server";
import {RootModuleMetadata} from "../decorators/module";
import {Logger} from "@typeix/logger";
import {Module as AModule} from "@typeix/modules";
import {createRoute} from "../helpers/server";

describe("server", () => {

  it("should get method decorator", () => {
    expect(getMethodDecorator("GET")).toBe(GET);
    expect(getMethodDecorator("HEAD")).toBe(HEAD);
    expect(getMethodDecorator("POST")).toBe(POST);
    expect(getMethodDecorator("PUT")).toBe(PUT);
    expect(getMethodDecorator("DELETE")).toBe(DELETE);
    expect(getMethodDecorator("CONNECT")).toBe(CONNECT);
    expect(getMethodDecorator("OPTIONS")).toBe(OPTIONS);
    expect(getMethodDecorator("TRACE")).toBe(TRACE);
    expect(getMethodDecorator("PATCH")).toBe(PATCH);
    expect(getMethodDecorator("OnError")).toBe(OnError);
  });

  it("should get method params", () => {
    let metadata: IMetadata = {
      type: "parameter",
      propertyKey: "name",
      metadataKey: "token",
      args: {
        token: "value"
      }
    };
    expect(getMethodParams([metadata], "name")).toEqual(["value"]);
  });

  it("should create route definition cache, intercept and return", async () => {

    const cache: Map<string, any> = new Map<string, any>();

    @Injectable()
    class CacheInterceptor implements RequestInterceptor {

      async invoke(method: InterceptedRequest): Promise<any> {
        if (cache.has(method.route.path)) {
          return cache.get(method.route.path);
        }
        cache.set(method.route.path, await method.handler());
      }
    }

    let hitCount = 0;

    @Controller({
      path: "/",
      interceptors: [CacheInterceptor]
    })
    class HomeController {
      @GET()
      indexAction() {
        hitCount += 1;
        return "HELLO_WORLD";
      }
    }
    let handler: IRouteHandler = createRoute(
      {
        name: "indexAction",
        decorator: GET
      },
      HomeController
    );

    let injector = new Injector();
    let request = new IncomingMessage(new Socket());
    request.url = "/";
    request.method = "GET";
    request.headers = {};
    injector.set(ServerResponse, new ServerResponse(request))
    injector.set(IncomingMessage, request);
    let result = await handler(injector, {
      params: {},
      headers: {},
      handler: () => {},
      path: "/",
      url: Router.parseURI("/", {}),
      method: "GET"
    });
    expect(result).toEqual("HELLO_WORLD");
    expect(hitCount).toBe(1);
    result = await handler(injector, {
      params: {},
      headers: {},
      handler: () => {},
      path: "/",
      url: Router.parseURI("/", {}),
      method: "GET"
    });
    expect(result).toEqual("HELLO_WORLD");
    expect(hitCount).toBe(1);
  });

  it("should create route definition cache, intercept without return and throw error", async () => {

    const cache: Map<string, any> = new Map<string, any>();

    @Injectable()
    class CacheInterceptor implements RequestInterceptor {

      async invoke(method: InterceptedRequest): Promise<any> {
        if (cache.has(method.route.path)) {
          let result = cache.get(method.route.path);
          method.response.end(result);
        } else {
          let result = await method.handler();
          cache.set(method.route.path, result);
        }
      }
    }

    let hitCount = 0;

    @Controller({
      path: "/",
      interceptors: [CacheInterceptor]
    })
    class HomeController {
      @GET()
      indexAction() {
        hitCount += 1;
        return "HELLO_WORLD";
      }
    }
    let handler: IRouteHandler = createRoute(
      {
        name: "indexAction",
        decorator: GET
      },
      HomeController
    );

    let injector = new Injector();
    let request = new IncomingMessage(new Socket());
    request.url = "/";
    request.method = "GET";
    request.headers = {};
    injector.set(ServerResponse, new ServerResponse(request))
    injector.set(IncomingMessage, request);
    let result = await handler(injector, {
      params: {},
      headers: {},
      handler: () => {},
      path: "/",
      url: Router.parseURI("/", {}),
      method: "GET"
    });
    expect(result).toEqual("HELLO_WORLD");
    expect(hitCount).toBe(1);
    try {
      await handler(injector, {
        params: {},
        headers: {},
        handler: () => {},
        path: "/",
        url: Router.parseURI("/", {}),
        method: "GET"
      });
    } catch (e) {
      expect(e.message).toContain("n response.end() invoke, interceptor must return value to preserve async behavior!");
    }
    expect(hitCount).toBe(1);
  });

  it("should create route definition cache, intercept response end and return", async () => {

    const cache: Map<string, any> = new Map<string, any>();

    @Injectable()
    class CacheInterceptor implements RequestInterceptor {

      async invoke(method: InterceptedRequest): Promise<any> {
        if (cache.has(method.route.path)) {
          let result = cache.get(method.route.path);
          method.response.end(result);
          return result;
        } else {
          let result = await method.handler();
          cache.set(method.route.path, result);
        }
      }
    }

    let hitCount = 0;

    @Controller({
      path: "/",
      interceptors: [CacheInterceptor]
    })
    class HomeController {
      @GET()
      indexAction() {
        hitCount += 1;
        return "HELLO_WORLD";
      }
    }
    let handler: IRouteHandler = createRoute(
      {
        name: "indexAction",
        decorator: GET
      },
      HomeController
    );

    let injector = new Injector();
    let request = new IncomingMessage(new Socket());
    request.url = "/";
    request.method = "GET";
    request.headers = {};
    injector.set(ServerResponse, new ServerResponse(request))
    injector.set(IncomingMessage, request);
    let result = await handler(injector, {
      params: {},
      headers: {},
      handler: () => {},
      path: "/",
      url: Router.parseURI("/", {}),
      method: "GET"
    });
    expect(result).toEqual("HELLO_WORLD");
    expect(hitCount).toBe(1);
    result = await handler(injector, {
      params: {},
      headers: {},
      handler: () => {},
      path: "/",
      url: Router.parseURI("/", {}),
      method: "GET"
    });
    expect(result).toEqual("HELLO_WORLD");
    expect(hitCount).toBe(1);
  });


  it("should pipe server", () => {
    @Module({providers: []})
    class BModule {}
    let server = new Server();
    expect(() => {
      pipeServer(server, BModule);
    }).toThrow(new RouterError("Server must be initialized on @RootModule", 500));
  });

  it("should add shared providers", () => {
    @RootModule({
      controllers: [],
      providers: [Logger],
      shared_providers: [verifyProvider(Router)]
    })
    class BModule {}
    let server = new Server();
    pipeServer(server, BModule);
    let metadata: RootModuleMetadata = getClassMetadata(AModule, BModule).args;
    expect(metadata.shared_providers).toEqual([verifyProvider(Router)]);
  });

  it("should create shared providers", () => {
    @Module({
      exports: [],
      providers: []
    })
    class MyAModule {

    }

    @RootModule({
      imports: [MyAModule],
      controllers: [],
      providers: [Logger]
    })
    class RooAModule {}
    let server = new Server();
    pipeServer(server, RooAModule);
    let metadata: RootModuleMetadata = getClassMetadata(AModule, RooAModule).args;
    expect(metadata.shared_providers).toEqual([verifyProvider(Router)]);
  });
});
