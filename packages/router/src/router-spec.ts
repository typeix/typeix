import {Router} from "./router";
import {Injectable, Injector, verifyProvider} from "@typeix/di";
import {IRoute, IResolvedRoute, URI} from "./iroute";
import {RouterError} from "./router-error";
import {Server, Socket} from "net";
import {IncomingMessage, ServerResponse} from "http";
import {ResolvedRoute} from "./route-rule";

describe("Router", () => {

  let router: Router;

  function expectEqual(route, url, method, params) {
    expect(route.path).toBe(url);
    expect(route.method).toBe(method);
    expect(route.params).toEqual(params);
  }

  async function fireRequest(server: Server, url, method, headers = {}): Promise<any> {
    let request = new IncomingMessage(new Socket());
    request.url = url;
    request.method = method;
    request.headers = headers;
    let response = new ServerResponse(request);
    server.emit("request", request, response);
    return await new Promise(resolve => {
      process.nextTick(() => {
        response.emit("finish");
        resolve(1);
      });
    });
  }

  beforeEach(async () => {
    let injector = await Injector.createAndResolve(Router, []);
    router = injector.get(Router);
  });

  test("Parse request and create dynamic url", () => {

    @Injectable()
    class DynamicRule implements IRoute {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      parseRequest(uri: URI, method: string, headers: { [key: string]: any }): Promise<IResolvedRoute> {
        return Promise.resolve(null);
      }
    }

    router.addRule(DynamicRule);

    return router.parseRequest("/", "GET", {}).then((data) => {
      let result = [];
      expect(data).toEqual(result);
    })
      .catch((error: RouterError) => {
        expect(error.getMessage()).toBe("Router.parseRequest: / no route found, method: GET");
      });
  });


  test("Parse request", () => {

    router.get("/home/<id:(\\d+)>", () => void 0);
    router.get("/home", () => void 0);
    router.get("*", () => void 0);
    router.post("/", () => void 0);

    return Promise.all([
      router.parseRequest("/", "POST", {}),
      router.parseRequest("/authenticate", "GET", {}),
      router.parseRequest("/home", "GET", {}),
      router.parseRequest("/home/123", "GET", {})
    ]).then((data) => {
      let route1 = data.shift();
      let route2 = data.shift();
      let route3 = data.shift();
      let route4 = data.shift();
      expectEqual(route1, "/", "POST", {});
      expectEqual(route2, "/authenticate", "GET", {});
      expectEqual(route3, "/home", "GET", {});
      expectEqual(route4, "/home/123", "GET", {id: "123"});
    });
  });

  test("Parent injector", async () => {
    let parent = new Injector();
    let injector = await Injector.createAndResolve(Router, []);
    injector.get(Router).setParentInjector(parent);
    const cParent: Injector = Reflect.get(injector.get(Router), "injector");
    expect(cParent.getParent()).toEqual(parent);
  });

  test("Should add rules and execute", async () => {
    let count = 0;
    let obj = {
      handler: (injector: Injector, route: IResolvedRoute) => {
        count += 1;
        return Buffer.from("1");
      },
      error: (injector: Injector, route: IResolvedRoute) => {
        count += 1;
        return {a: 1, b: 1};
      }
    }

    let spy = spyOn(obj, "handler").and.callThrough();
    let spy2 = spyOn(obj, "error").and.callThrough();

    router.addRules([
      {
        path: "/",
        method: "GET",
        handler: obj.handler.bind(obj)
      }
    ]);
    router.get("/end", () => {
      count += 1;
    });
    router.head("/", obj.handler.bind(obj));
    router.put("/", obj.handler.bind(obj));
    router.delete("/", obj.handler.bind(obj));
    router.connect("/", obj.handler.bind(obj));
    router.options("/", obj.handler.bind(obj));
    router.trace("/", obj.handler.bind(obj));
    router.patch("/", obj.handler.bind(obj));


    let server = new Server();
    router.pipe(server);

    await fireRequest(server, "/", "GET");


    expect(count).toBe(1);
    await fireRequest(server, "/", "HEAD");
    expect(count).toBe(2);
    await fireRequest(server, "/", "PUT");
    expect(count).toBe(3);
    await fireRequest(server, "/", "DELETE");
    expect(count).toBe(4);
    await fireRequest(server, "/", "CONNECT");
    expect(count).toBe(5);
    await fireRequest(server, "/", "OPTIONS");
    expect(count).toBe(6);
    await fireRequest(server, "/", "TRACE");
    expect(count).toBe(7);
    await fireRequest(server, "/", "PATCH");
    expect(count).toBe(8);

    router.onError("*", obj.error);
    await fireRequest(server, "/abc", "GET");
    expect(count).toBe(9);

    await fireRequest(server, "/end", "GET");
    expect(count).toBe(10);

    expect(spy).toHaveBeenCalledTimes(8);
    expect(spy2).toHaveBeenCalledTimes(1);


  });



  test("Should handle errors", async () => {
    let count = 0;
    let obj = {
      error: (injector: Injector, route: IResolvedRoute) => {
        count += 1;
        return {a: 1, b: 1};
      }
    }

    let spy = spyOn(obj, "error").and.callThrough();
    let server = new Server();
    router.pipe(server);
    router.onError("*", obj.error);
    await fireRequest(server, "/abc", "GET");
    expect(count).toBe(1);
    expect(spy).toHaveBeenCalledTimes(1);
  });


  test("Should handle string type", async () => {

    @Injectable()
    class A {
      @ResolvedRoute() route: IResolvedRoute;
    }
    let count = 0, resolvedRoute;
    let obj = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      handler: async (injector: Injector, route: IResolvedRoute) => {
        resolvedRoute =  (await injector.createAndResolve(verifyProvider(A), [])).route;
        count += 1;
        return "1";
      }
    };

    let spy = spyOn(obj, "handler").and.callThrough();

    router.addRules([
      {
        path: "/",
        method: "GET",
        handler: obj.handler.bind(obj)
      }
    ]);


    let server = new Server();
    router.pipe(server);

    await fireRequest(server, "/", "GET");
    expect(count).toBe(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(resolvedRoute.path).toBe("/");
    expect(resolvedRoute.method).toBe("GET");
  });


  test("Should throw error", async () => {
    let count = 0;
    let obj = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      handler: (injector: Injector, route: IResolvedRoute) => {
        count += 1;
        throw new RouterError("whatever", 500);
      }
    };

    let spy = spyOn(obj, "handler").and.callThrough();

    router.addRules([
      {
        path: "/",
        method: "GET",
        handler: obj.handler.bind(obj)
      }
    ]);


    let server = new Server();
    router.pipe(server);

    await fireRequest(server, "/", "GET");
    expect(count).toBe(1);
    expect(spy).toHaveBeenCalledTimes(1);

  });

  test("RouterError",  () => {
    let obj = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      handler: (injector: Injector, route: IResolvedRoute) => {
        return Buffer.from("1");
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      error: (injector: Injector, route: IResolvedRoute) => {
        return {a: 1, b: 1};
      }
    };
    let err = new RouterError("Router", 500, obj);
    expect(err.getData()).toEqual(obj);
    expect(RouterError.from(new Error("Abc"), 500)).toBeInstanceOf(RouterError);
  });
});

