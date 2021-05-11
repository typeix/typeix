import {RouteRule, RouteConfig} from "./route-rule";
import {Injector} from "@typeix/di";
import {Router} from "./router";

describe("RouteRule", () => {
  it("Parse route", async () => {
    let config = {
      method: "GET",
      handler: () => void 0,
      path: "/home/<id:(\\d+)>"
    };
    let injector = await Injector.createAndResolve(RouteRule, [ {provide: RouteConfig, useValue: config} ]);
    let route = injector.get(RouteRule);
    expect(route).not.toBeNull();
    let result = await route.parseRequest(Router.parseURI("/home/123", {}), "GET", {});
    const expected = {...config,
      path: "/home/123",
      params: {id: "123"},
      url: Router.parseURI("/home/123", {}),
      headers: {}
    };
    expect(result).toEqual(expected);
    let path = "/home/123?query=1&base=2&query=2";
    result = await route.parseRequest(Router.parseURI(path, {}), "GET", {});
    let uri = Router.parseURI(path, {})
    expect(result).toEqual({...expected, path: uri.pathname,  url: uri});

    path = "/home/123-not-found?query=1&base=2&query=2";
    uri = Router.parseURI(path, {})
    result = await route.parseRequest(uri, "GET", {});
    expect(result).toEqual(null);

    path = "/home/123/abc?query=1&base=2&query=2";
    uri = Router.parseURI(path, {})
    result = await route.parseRequest(uri, "GET", {});
    expect(result).toEqual(null);
  });

  it("Parse query", async () => {
    let config = {
      method: "GET",
      handler: () => void 0,
      path: "/home/<id:(\\d+)>"
    };
    let injector = await Injector.createAndResolve(RouteRule, [ {provide: RouteConfig, useValue: config} ]);
    let route = injector.get(RouteRule);
    expect(route).not.toBeNull();
    let path = "/home/123?query=1&base=2&query=2";
    let uri = Router.parseURI(path, {});
    let result = await route.parseRequest(uri, "GET", {});
    expect(result).toEqual({
      ...config,
      path: uri.pathname,
      params: {id: "123"},
      headers: {},
      url: uri,
    });
  });


  it("Parse HostCheck", async () => {
    let config = {
      method: "GET",
      handler: () => void 0,
      path: "/"
    };
    let injector = await Injector.createAndResolve(RouteRule, [ {provide: RouteConfig, useValue: config} ]);
    let route = injector.get(RouteRule);
    expect(route).not.toBeNull();
    let path = "/";
    let headers = {"x-forwarded-proto": "https", "host": "typeix.com"};
    let uri = Router.parseURI(path, headers);
    let result = await route.parseRequest(uri, "GET", headers);
    expect(result).toEqual({
      ...config,
      path,
      params: {},
      headers: headers,
      url:Router.parseURI("/", headers)
    });

    let headers1 = {"x-forwarded-protocol": "https", "host": "typeix.com"};
    uri = Router.parseURI(path, headers1);
    result = await route.parseRequest(uri, "GET", headers1);
    expect(result).toEqual({
      ...config,
      path,
      params: {},
      headers: headers1,
      url: uri
    });
  });
});
