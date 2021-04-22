import {Injector} from "./injector";

/**
 * ValueProvider
 */
export interface IProvider {
  provide: any;
  useValue?: any;
  useClass?: Function;
  useFactory?: Function;
  providers?: Array<MixedProvider>;
}
/**
 * Class or Interfaces
 */
export declare type MixedProvider = Function | IProvider;
/**
 * Type interface
 */
export interface Type<T> extends Function {
  new(...args: any[]): T;
}
/**
 * @since 1.0.0
 * @interface
 * @name IAfterConstruct
 *
 * @description
 * After construct interface
 */
export interface IAfterConstruct {
  afterConstruct(): void;
}

/**
 * Method
 */
export interface Method {
  invoke: () => any;
  transform: (data: any) => any;
  readonly injector: Injector;
  readonly decoratorArgs: any;
}

/**
 * Interceptor
 */
export interface Interceptor {
  invoke(method: Method): any;
}

/**
 * MethodConstructor
 */
export interface MethodConstructor {
  new(): Interceptor;
}

/**
 * InterceptorHandler
 */
export interface InterceptorHandler {
  handler: Interceptor;
  args: any;
}

/**
 * InterceptorProcessor
 */
export interface InterceptorProcessor {
  handler: (...args: any[]) => any;
  isAsync: boolean;
  interceptors: Array<InterceptorHandler>;
}
