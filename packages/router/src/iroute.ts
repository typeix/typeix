import {Injector} from "@typeix/di";
import {URLSearchParams} from "url";

/**
 * @since 7.0.0
 * @interface
 * @name URI
 *
 * @description
 * Parsed URL
 */
export interface URI {
  pathname: string;
  hash?: string;
  host?: string;
  href?: string;
  origin?: string;
  authority?: string;
  port?: string;
  protocol?: string;
  search?: string;
  searchParams?: URLSearchParams;
}

/**
 * @since 7.0.0
 * @interface
 * @name IRouteHandler
 *
 * @description
 * Route handler
 */
export declare type IRouteHandler = (injector: Injector, route: IResolvedRoute) => any;

/**
 * @since 7.0.0
 * @interface
 * @name IRoute
 *
 * @description
 * Route definition
 */
export interface IRoute {
  parseRequest(uri: URI, method: string, headers: { [key: string]: any }): Promise<IResolvedRoute>;
}

/**
 * @since 7.0.0
 * @type
 * @name TRoute
 *
 * @description
 * TRoute declaration for type constructor
 */
export declare type TRoute = {
  new(): IRoute;
};

/**
 * @since 7.0.0
 * @interface
 * @name IRouteConfig
 *
 * @description
 * Route rule definition
 */
export interface IRouteConfig {
  path: string;
  handler: IRouteHandler;
  injector?: Injector;
  method: string;
}

/**
 * @since 7.0.0
 * @interface
 * @name IResolvedRoute
 *
 * @description
 * Resolver of route
 */
export interface IResolvedRoute extends IRouteConfig {
  params: { [key: string]: string };
  headers: { [key: string]: any };
  url: URI;
}


