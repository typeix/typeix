import {IAfterConstruct, Inject, Injectable, Injector} from "@typeix/di";
import {RouteParser} from "./parser";
import {IResolvedRoute, IRoute, IRouteConfig, URI} from "./iroute";
/**
 * ResolvedRoute
 * @decorator
 */
export function ResolvedRoute() {
  return Inject(ResolvedRoute);
}
/**
 * RuleConfig
 * @decorator
 */
export function RouteConfig() {
  return Inject(RouteConfig);
}
/**
 * @since 1.0.0
 * @function
 * @name RouteRule
 * @constructor
 *
 * @param {IRouteConfig} config
 *
 * @description
 * Route rule provider is used by router to parse request and create route url
 */
@Injectable()
export class RouteRule implements IRoute, IAfterConstruct {

  @RouteConfig() private config: IRouteConfig;
  @Inject() private injector: Injector;
  private routeParser: RouteParser;
  /**
   * @since 1.0.0
   * @function ``
   * @name RouteRule#afterConstruct
   * @private
   *
   * @description
   * After construct apply config data
   */
  afterConstruct(): void {
    this.routeParser = new RouteParser(this.config.path);
  }

  /**
   * @since 1.0.0
   * @function
   * @name RouteRule#parseRequest
   * @param uri
   * @param {String} method
   * @param {Object} headers
   * @private
   *
   * @description
   * Check if route is valid match
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async parseRequest(uri: URI, method: string, headers: { [key: string]: any }): Promise<IResolvedRoute> {
    if (this.routeParser.isValid(uri.pathname) && this.config.method === method) {
      let params = this.routeParser.getParams(uri.pathname);
      return {
        injector: this.injector,
        handler: this.config.handler,
        path: uri.pathname,
        url: uri,
        headers,
        method,
        params
      };
    }
    return null;
  }
}
