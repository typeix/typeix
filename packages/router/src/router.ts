import {isArray, isDefined, isObject} from "@typeix/utils";
import {Inject, Injectable, Injector} from "@typeix/di";
import {IResolvedRoute, IRoute, IRouteHandler, IRouteConfig, TRoute, URI} from "./iroute";
import {ResolvedRoute, RouteRule, RouteConfig} from "./route-rule";
import {RouterError} from "./router-error";
import {IncomingMessage, ServerResponse} from "http";
import {Http2ServerResponse, Http2ServerRequest} from "http2";
import {Server} from "net";
import {URLSearchParams} from "url";

/**
 * Proxy Protocol Headers
 */
const protoXFP = "x-forwarded-proto";
const protoMS = "x-forwarded-protocol";
/**
 * GROUP 1 ([scheme][authority][host][port])
 * GROUP 2 (scheme)
 * GROUP 3 (authority)
 * GROUP 4 (host)
 * GROUP 5 (port)
 * GROUP 6 (path)
 * GROUP 7 (?query)
 * GROUP 8 (query)
 * GROUP 9 (fragment)
 */
const URL_RE = /^(([^:\/\s]+):\/?\/?([^\/\s@]*@)?([^\/@:]*)?:?(\d+)?)?(\/[^?]*)?(\?([^#]*))?(#[\s\S]*)?$/;

/**
 * @since 1.0.0
 * @class
 * @name Router
 * @constructor
 * @description
 * Router is a component for handling routing in system.
 * All routes should be added during bootstrap process
 */

@Injectable()
export class Router {

  static readonly ERROR = "@typeix:TRACE";
  /**
   * @param {Injector} injector
   */
  @Inject() private injector: Injector;
  /**
   * @param {Array<Promise<IRoute>>} routes
   */
  private routes: Array<Promise<IRoute>> = [];

  /**
   * Helper to parse request.url
   * @param path
   * @param headers
   * @param defaultHost
   */
  static parseURI(path: string, headers: { [key: string]: any }, defaultHost = "localhost"): URI {
    const host = Reflect.get(headers, "host") ?? defaultHost;
    let protocol = "http";
    if (Reflect.has(headers, protoXFP)) {
      protocol = Reflect.get(headers, protoXFP);
    } else if (Reflect.has(headers, protoMS)) {
      protocol = Reflect.get(headers, protoMS);
    }
    const href = `${protocol}://${host}${path}`;
    const matches = URL_RE.exec(href);
    if (isArray(matches)) {
      const hash = matches[9];
      const searchParams = matches[8];
      const search = matches[7];
      const pathname = matches[6];
      const port = matches[5];
      const host = matches[4];
      const authority = matches[3];
      const protocol = matches[2];
      const origin = matches[1];
      return {
        pathname,
        hash,
        searchParams: new URLSearchParams(searchParams),
        search,
        protocol,
        href,
        port,
        host,
        origin,
        authority
      };
    }
    return {
      pathname: path
    };
  }

  /**
   * Attach parent injector to current injector
   * @param injector
   */
  setParentInjector(injector: Injector) {
    injector.addChild(this.injector);
  }

  /**
   * @since 1.0.0
   * @function
   * @name Router#addRules
   * @param {Array<IRouteConfig>} rules
   *
   * @description
   * Add route to routes list.
   * All routes must be inherited from Route interface.
   */
  addRules(rules: Array<IRouteConfig>): void {
    for (const config of rules) {
      this.routes.push(this.createRule(RouteRule, config));
    }
  }

  /**
   * @since 1.0.0
   * @function
   * @name Router#addRule
   * @param {Function} Class
   * @param {IRouteConfig} config
   *
   * @description
   * Create rule and add rule to list
   */
  addRule(Class: TRoute, config?: IRouteConfig): void {
    this.routes.push(this.createRule(Class, config));
  }

  /**
   * @since 1.0.0
   * @function
   * @name Router#parseRequest
   * @param {string} path
   * @param {String} method
   * @param {[key: string]: any} headers
   *
   * @description
   * Parse request based on pathName and method
   */
  async parseRequest(path: string, method: string, headers: { [key: string]: any }): Promise<IResolvedRoute> {
    const uri = Router.parseURI(path, headers);
    for (let route of this.routes) {
      let result = await (await route).parseRequest(uri, method, headers);
      if (isObject(result)) {
        return result;
      }
    }
    throw new RouterError(
      `Router.parseRequest: ${path} no route found, method: ${method}`,
      404,
      {
        path,
        method
      }
    );
  }

  /**
   * Pipe server
   * @param {Server} server
   */
  pipe(server: Server): Server {
    server.on("request", async (
      request: IncomingMessage | Http2ServerRequest,
      response: ServerResponse | Http2ServerResponse
    ) => {
      let injector = new Injector(this.injector);
      response.on("finish", () => injector.destroy());
      injector.set(request.constructor, request);
      injector.set(response.constructor, response);
      await this.requestHandler(request, response, injector);
    });
    return server;
  }

  /**
   * Http Servers request handlers
   * @param request
   * @param response
   * @param injector
   * @param error
   */
  async requestHandler(
    request: IncomingMessage | Http2ServerRequest,
    response: ServerResponse | Http2ServerResponse,
    injector: Injector,
    error?: RouterError
  ): Promise<any> {
    try {
      let route: IResolvedRoute = await this.parseRequest(request.url, !!error ? Router.ERROR : request.method, request.headers);
      if (!injector.has(ResolvedRoute)) {
        injector.set(ResolvedRoute, route);
      }
      let result = await route.handler(injector, route);
      if (!response.writableEnded && Buffer.isBuffer(result)) {
        response.end(result);
      } else if (!response.writableEnded && isDefined(result)) {
        response.end(isObject(result) ? JSON.stringify(result) : result);
      } else if (!response.writableEnded) {
        response.end();
      }
      return result;
    } catch (e) {
      if (e instanceof RouterError) {
        response.statusCode = e.getCode();
      }
      if (!error) {
        if (!injector.has(RouterError)) {
          injector.set(RouterError, e);
        }
        return await this.requestHandler(request, response, injector, RouterError.from(e, 500));
      }
      let result = JSON.stringify({
        message: error.getMessage(),
        stack: error.stack.split("\n"),
        request: {
          method: request.method,
          url: request.url,
          headers: request.headers
        },
        statusCode: response.statusCode
      });
      if (!response.writableEnded) {
        response.end(result);
      }
      return result;
    }
  }


  /**
   * Get route
   * @param path
   * @param handler
   */
  get(path: string, handler: IRouteHandler): this {
    this.addRule(RouteRule, {
      path,
      handler,
      method: "GET"
    });
    return this;
  }

  /**
   * Head route
   * @param path
   * @param handler
   */
  head(path: string, handler: IRouteHandler): this {
    this.addRule(RouteRule, {
      path,
      handler,
      method: "HEAD"
    });
    return this;
  }

  /**
   * Post route
   * @param path
   * @param handler
   */
  post(path: string, handler: IRouteHandler): this {
    this.addRule(RouteRule, {
      path,
      handler,
      method: "POST"
    });
    return this;
  }

  /**
   * Put route
   * @param path
   * @param handler
   */
  put(path: string, handler: IRouteHandler): this {
    this.addRule(RouteRule, {
      path,
      handler,
      method: "PUT"
    });
    return this;
  }

  /**
   * Delete route
   * @param path
   * @param handler
   */
  delete(path: string, handler: IRouteHandler): this {
    this.addRule(RouteRule, {
      path,
      handler,
      method: "DELETE"
    });
    return this;
  }

  /**
   * Connect route
   * @param path
   * @param handler
   */
  connect(path: string, handler: IRouteHandler): this {
    this.addRule(RouteRule, {
      path,
      handler,
      method: "CONNECT"
    });
    return this;
  }

  /**
   * Options route
   * @param path
   * @param handler
   */
  options(path: string, handler: IRouteHandler): this {
    this.addRule(RouteRule, {
      path,
      handler,
      method: "OPTIONS"
    });
    return this;
  }


  /**
   * Trace route
   * @param path
   * @param handler
   */
  trace(path: string, handler: IRouteHandler): this {
    this.addRule(RouteRule, {
      path,
      handler,
      method: "TRACE"
    });
    return this;
  }


  /**
   * Patch route
   * @param path
   * @param handler
   */
  patch(path: string, handler: IRouteHandler): this {
    this.addRule(RouteRule, {
      path,
      handler,
      method: "PATCH"
    });
    return this;
  }

  /**
   * OnError route
   * @param path
   * @param handler
   */
  onError(path: string, handler: IRouteHandler): this {
    this.addRule(RouteRule, {
      path,
      handler,
      method: Router.ERROR
    });
    return this;
  }

  /**
   * @since 1.0.0
   * @function
   * @name Router#createRule
   * @param {Function} Class
   * @param {IRouteConfig} config
   *
   * @description
   * Initialize rule
   */
  private async createRule(Class: TRoute, config?: IRouteConfig): Promise<IRoute> {
    let injector = await Injector.createAndResolveChild(
      this.injector,
      Class,
      isDefined(config) ? [{provide: RouteConfig, useValue: config}] : []
    );
    return injector.get(Class);
  }
}
