import {
  IControllerMetadata,
  IModuleMetadata
} from "./decorators";
import {IMetadata} from "@typeix/metadata";
import {Injector, IProvider} from "@typeix/di";
import {IResolvedRoute} from "@typeix/router";
import {IncomingMessage, ServerResponse} from "http";
import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {FakeIncomingMessage, FakeServerResponse} from "./helpers/mocks";


export const INTERCEPTOR_METHOD = "invoke";

export declare type RestyRequest = IncomingMessage | Http2ServerRequest | FakeIncomingMessage;
export declare type RestyResponse =  ServerResponse | Http2ServerResponse | FakeServerResponse;
/**
 * @since 7.0.0
 * @interface
 * @name InterceptedRequest
 *
 * @description
 * Method Interceptor
 */
export interface InterceptedRequest {
  handler: () => any;
  injector: Injector;
  route: IResolvedRoute;
  request: RestyRequest;
  response: RestyResponse;
  readonly args: any;
}

/**
 * @since 7.0.0
 * @interface
 * @name RequestInterceptor
 *
 * @description
 * Request Interceptor
 */
export interface RequestInterceptor {
  invoke(request: InterceptedRequest): Promise<any>;
}

/**
 * @since 7.0.0
 * @interface
 * @name ResolvedInterceptor
 * @private
 *
 * @description
 * Resolved interceptor
 */
export interface ResolvedInterceptor {
  provider: IProvider;
  args: any;
}

/**
 * @since 7.0.0
 * @interface
 * @name RequestInterceptorConstructor
 * @private
 *
 * @description
 * Interceptor constructor
 */
export interface RequestInterceptorConstructor {
  new(): RequestInterceptor;
}

/**
 * @since 7.0.0
 * @interface
 * @name RouteProvider
 *
 * @description
 * Router Provider
 */
export interface RouteProvider<P, M> {
  provider: P;
  metadata: M;
}

/**
 * @since 7.0.0
 * @interface
 * @name RouteDefinition
 *
 * @description
 * Router definitions
 */
export interface RouteDefinition {
  module?: RouteProvider<IProvider, IModuleMetadata>;
  controller: RouteProvider<IProvider, IControllerMetadata>;
  allControllerMetadata: Array<IMetadata>;
  method: IMetadata;
}

/**
 * @since 7.0.0
 * @interface
 * @name RouteMethodDefinition
 * @private
 *
 * @description
 * Route Method definition
 */
export interface RouteMethodDefinition {
  name: string;
  decorator: Function;
}
