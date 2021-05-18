import {
  IProvider,
  Interceptor,
  MethodConstructor,
  InterceptorProcessor,
  InterceptorHandler,
  Method
} from "../interfaces";
import {createMethodDecorator, hasDecorator, IMetadata} from "@typeix/metadata";
import {isClass, isUndefined} from "@typeix/utils";
import {verifyProvider} from "./provider";
import {Injector, SyncInjector} from "../injector";
import {AsyncInterceptor} from "../decorators";

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
  SyncInjector.__interceptors__.add(decorator);
  return createMethodDecorator(decorator, {Class, args});
}

/**
 * Create interceptor handler
 * @param {Map<string | symbol, InterceptorProcessor>} interceptors
 * @param {Interceptor} interceptor
 * @param {IMetadata} metadata
 * @param {IProvider} provider
 * @param {object} instance
 * @private
 */
function createInterceptorHandler(
  interceptors: Map<string | symbol, InterceptorProcessor>,
  interceptor: Interceptor,
  metadata: IMetadata,
  provider: IProvider,
  instance: object
): void {
  const propertyKey = metadata.propertyKey;
  const isAsync = hasDecorator(AsyncInterceptor, provider.useClass.prototype, <string>metadata.propertyKey);
  const interceptorHandler: InterceptorHandler = {
    handler: interceptor,
    args: metadata.args.args
  };
  if (interceptors.has(propertyKey)) {
    const mapItem = interceptors.get(propertyKey);
    mapItem.interceptors.push(interceptorHandler);
    interceptors.set(propertyKey, mapItem);
  } else {
    interceptors.set(propertyKey, {
      handler: Reflect.get(instance, propertyKey).bind(instance),
      isAsync,
      interceptors: [interceptorHandler]
    });
  }
}

/**
 * Create interceptor handlers
 * @param provider
 * @param injector
 */
export function createInterceptorHandlers(
  provider: IProvider,
  injector: Injector | SyncInjector
): Map<string | symbol, InterceptorProcessor> {
  const metadata = SyncInjector.getAllMetadataForTarget(provider);
  const values = metadata.filter(item =>
    SyncInjector.__interceptors__.has(item.decorator) && item.type === "method" && isClass(item.args?.Class)
  );
  const instance = injector.get(provider.provide);
  const interceptors = new Map<string | symbol, InterceptorProcessor>();
  for (const item of values) {
    const handlerProvider = verifyProvider(item.args.Class);
    const interceptor: Interceptor = injector.createAndResolve(
      handlerProvider,
      SyncInjector.getProviders(<IProvider>handlerProvider)
    );
    createInterceptorHandler(interceptors, interceptor, item, provider, instance);
  }
  return interceptors;
}

/**
 * Create interceptor handlers
 * @param provider
 * @param injector
 */
export async function createInterceptorHandlersAsync(
  provider: IProvider,
  injector: Injector | SyncInjector
): Promise<Map<string | symbol, InterceptorProcessor>> {
  const metadata = SyncInjector.getAllMetadataForTarget(provider);
  const values = metadata.filter(item =>
    SyncInjector.__interceptors__.has(item.decorator) && item.type === "method" && isClass(item.args?.Class)
  );
  const instance = injector.get(provider.provide);
  const interceptors = new Map<string | symbol, InterceptorProcessor>();
  for (const item of values) {
    const handlerProvider = verifyProvider(item.args.Class);
    const interceptor: Interceptor = await injector.createAndResolve(
      handlerProvider,
      SyncInjector.getProviders(<IProvider>handlerProvider)
    );
    createInterceptorHandler(interceptors, interceptor, item, provider, instance);
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

  constructor(private args: any[], private handler: (...handlerArgs: any[]) => any, private isAsync: boolean) {
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
   * Override arguments
   * @param args
   */
  overrideArgs(...args: any[]) {
    this.args = args;
  }
  /**
   * Invoke
   */
  invoke(): any {
    if (isUndefined(this.result)) {
      this.result = this.handler(...this.args);
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

  readonly injector: Injector | SyncInjector;
  readonly decoratorArgs: any;
  readonly args: any;

  constructor(
    injector: Injector | SyncInjector,
    args: any,
    decoratorArgs: any,
    private container: Executor
  ) {
    this.injector = injector;
    this.decoratorArgs = decoratorArgs;
    this.args = args;
  }

  invoke(): any {
    return this.container.invoke();
  }

  transform(data: any): any {
    return this.container.transform(data);
  }

  invokeWithArgs(...args: []): any {
    this.container.overrideArgs(...args);
    return this.container.invoke();
  }
}

/**
 * Apply interceptors
 * @param {Map<string | symbol, InterceptorProcessor>} interceptors
 * @param {IProvider} provider
 * @param {Injector | SyncInjector} injector
 * @private
 */
function applyInterceptors(
  interceptors: Map<string | symbol, InterceptorProcessor>,
  provider: IProvider,
  injector: Injector | SyncInjector
) {
  const instance = injector.get(provider.provide);
  for (const [key, value] of interceptors.entries()) {
    const interceptor = (...args: any[]) => {
      const container = new Executor(args, (...handlerArgs: any[]) => value.handler(...handlerArgs), value.isAsync);
      for (const item of value.interceptors) {
        const method = new InterceptedMethod(
          injector,
          args,
          item.args,
          container
        );
        container.addInterceptor(item.handler, method);
      }
      return container.execute();
    };
    Reflect.defineProperty(instance, key, {
      value: interceptor,
      writable: false
    });
  }
}
/**
 * Get all interceptors
 * @param provider
 * @param injector
 */
export function createInterceptors(provider: IProvider, injector: Injector | SyncInjector): Map<string | symbol, InterceptorProcessor> {
  const interceptors = createInterceptorHandlers(provider, injector);
  applyInterceptors(interceptors, provider, injector);
  return interceptors;
}

/**
 * Get all interceptors
 * @param provider
 * @param injector
 */
export async function createInterceptorsAsync(
  provider: IProvider,
  injector: Injector | SyncInjector
): Promise<Map<string | symbol, InterceptorProcessor>> {
  const interceptors = await createInterceptorHandlersAsync(provider, injector);
  applyInterceptors(interceptors, provider, injector);
  return interceptors;
}

