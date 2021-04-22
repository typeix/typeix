import {
  IProvider,
  Interceptor,
  MethodConstructor,
  InterceptorProcessor,
  InterceptorHandler,
  Method
} from "./interfaces";
import {createMethodDecorator, hasDecorator} from "@typeix/metadata";
import {isClass, isUndefined} from "@typeix/utils";
import {verifyProvider} from "./provider";
import {Injector} from "./injector";
import {AsyncInterceptor} from "./async-interceptor";

/**
 * @since 7.0.0
 * @decorator
 * @function
 * @name createMethodInterceptor
 *
 * @description
 * RequestInterceptor is used as pre controller and after controller actions
 *
 * @example
 * import {Injectable, Interceptor, Method, createMethodInterceptor} from "@typeix/di";
 *
 * \@Injectable()
 * class LoggerInterceptor implements Interceptor {
 *
 *   \@Inject() logger: Logger;
 *
 *   invoke(method: Method): any {
 *     let result = method.invoke();
 *     this.logger.log(result);
 *     return result;
 *   }
 * }
 *
 * export function Logger(value: string) {
 *   return createMethodInterceptor(Logger, LoggerInterceptor, {value});
 * }
 */
export function createMethodInterceptor(decorator: Function, Class: MethodConstructor, args: object) {
  Injector.__interceptors__.add(decorator);
  return createMethodDecorator(decorator, {Class, args});
}

/**
 * Create interceptor handlers
 * @param provider
 * @param injector
 */
export function createInterceptorHandlers(provider: IProvider, injector: Injector): Map<string | symbol, InterceptorProcessor> {
  const metadata = Injector.getAllMetadataForTarget(provider);
  const values = metadata.filter(item =>
    Injector.__interceptors__.has(item.decorator) && item.type === "method" && isClass(item.args?.Class)
  );
  const instance = injector.get(provider.provide);
  const interceptors = new Map<string | symbol, InterceptorProcessor>();
  for (const item of values) {
    const propertyKey = item.propertyKey;
    const handler = Reflect.get(instance, propertyKey).bind(instance);
    const isAsync = hasDecorator(AsyncInterceptor, provider.useClass.prototype, <string>item.propertyKey);
    const handlerProvider = verifyProvider(item.args.Class);
    const interceptor: Interceptor = injector.createAndResolve(handlerProvider, Injector.getProviders(<IProvider>handlerProvider));
    const interceptorHandler: InterceptorHandler = {
      handler: interceptor,
      args: item.args.args
    };
    if (interceptors.has(propertyKey)) {
      const mapItem = interceptors.get(propertyKey);
      mapItem.interceptors.push(interceptorHandler);
      interceptors.set(propertyKey, mapItem);
    } else {
      interceptors.set(propertyKey, {
        handler,
        isAsync,
        interceptors: [interceptorHandler]
      });
    }
  }
  return interceptors;
}

/**
 * Get all interceptors
 * @param provider
 * @param injector
 */
export function createInterceptors(provider: IProvider, injector: Injector): Map<string | symbol, InterceptorProcessor> {
  const interceptors = createInterceptorHandlers(provider, injector);
  const instance = injector.get(provider.provide);
  for (const [key, value] of interceptors.entries()) {
    const interceptor = (...args: any[]) => {
      const container = new Executor(() => value.handler(...args), value.isAsync);
      for (const interceptor of value.interceptors) {
        const method = new InterceptedMethod(
          injector,
          interceptor.args,
          container
        );
        container.addInterceptor(interceptor.handler, method);
      }
      return container.execute();
    }
    Reflect.defineProperty(instance, key, {
      value: interceptor,
      writable: false
    });
  }
  return interceptors;
}


const ASYNC = /^async[\s\S]+invoke|\.then\([\s\S]+\)/;

/**
 * @since 7.0.0
 * @decorator
 * @function
 * @name Executor
 * @private
 *
 * @description
 * Responsible for async or sync execution
 *
 */
class Executor {
  private result: any;
  private steps: Array<Function> = [];

  constructor(private handler: () => any, private isAsync: boolean) {
    if (!isAsync) {
      this.isAsync = ASYNC.test(handler.toString());
    }
  }

  /**
   * Add step to executor
   * @param interceptor
   * @param method
   */
  addInterceptor(interceptor: Interceptor, method: InterceptedMethod) {
    if (!this.isAsync) {
      this.isAsync = ASYNC.test(interceptor.invoke.toString());
    }
    this.steps.push(() => interceptor.invoke(method));
  }

  /**
   * Execute steps
   */
  execute(): any {
    if (this.isAsync) {
      return this.doAsync();
    }
    return this.doSync();
  }

  /**
   * Transform result
   * @param data
   */
  transform(data: any): any {
    if (this.isAsync) {
      this.result = Promise.resolve(data);
    } else {
      this.result = data;
    }
    return this.result;
  }

  /**
   * Invoke
   */
  invoke(): any {
    if (isUndefined(this.result)) {
      this.result = this.handler();
    }
    return this.result;
  }

  /**
   * Sync execution
   * @private
   */
  private doSync() {
    for (const step of this.steps) {
      step();
    }
    return this.invoke();
  }

  /**
   * Async execution
   * @private
   */
  private async doAsync(): Promise<any> {
    for (const step of this.steps) {
      await step();
    }
    return await this.invoke();
  }
}

/**
 * @since 7.0.0
 * @decorator
 * @function
 * @name InterceptedMethod
 * @private
 *
 * @description
 * InterceptedMethod is used by interceptors to create interceptor method
 *
 */
class InterceptedMethod implements Method {
  constructor(
    injector: Injector,
    decoratorArgs: any,
    private container: Executor
  ) {
    this.injector = injector;
    this.decoratorArgs = decoratorArgs;
  }

  invoke(): any {
    return this.container.invoke();
  }

  transform(data: any): any {
    return this.container.transform(data);
  }

  readonly injector: Injector;
  readonly decoratorArgs: any;


}
