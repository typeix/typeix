import {
  CONNECT, Controller,
  DELETE,
  GET,
  HEAD,
  IControllerMetadata,
  IModuleMetadata,
  OnError,
  OPTIONS,
  PATCH,
  POST,
  PUT,
  TRACE
} from "../decorators";
import {Injector, IProvider, shiftLeft, SyncInjector, verifyProvider, verifyProviders} from "@typeix/di";
import {inArray, isArray, isDefined, isFalsy, isTruthy, isUndefined} from "@typeix/utils";
import {Module, ModuleInjector} from "@typeix/modules";
import {getClassMetadata, IMetadata} from "@typeix/metadata";
import {
  InterceptedRequest,
  INTERCEPTOR_METHOD,
  ResolvedInterceptor,
  RouteDefinition,
  RouteMethodDefinition
} from "../interfaces";
import {IncomingMessage, ServerResponse} from "http";
import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {IResolvedRoute, IRouteHandler, RouterError} from "@typeix/router";
import {FakeIncomingMessage, FakeServerResponse} from "./mocks";
import {ServerConfig} from "../servers/server";
import {PATH_PARAM} from "../decorators/path-param";
import {REQUEST_INTERCEPTORS} from "../interceptors/request";

const REST_DECORATORS = [GET, HEAD, POST, PUT, DELETE, CONNECT, OPTIONS, TRACE, PATCH, OnError];

/**
 * Return method decorator
 * @param method
 */
export function getMethodDecorator(method: string) {
  return REST_DECORATORS.find(item => item.name.toLowerCase() === method.toLowerCase());
}

/**
 * @since 7.0.0
 * @function
 * @name getMethodParams
 * @param allMetadata
 * @param methodName
 */
export function getMethodParams(allMetadata: Array<IMetadata>, methodName: string | symbol): Array<any> {
  let actionParams = allMetadata.find(item =>
    item.propertyKey === methodName && item.metadataKey === "design:paramtypes"
  )?.args ?? [];
  allMetadata.filter(item => item.propertyKey === methodName && item.type === "parameter").forEach(item => {
    if (isDefined(item.args.token)) {
      if (actionParams.length > 0) {
        actionParams.splice(item.paramIndex, 1, item.args.token);
      } else {
        actionParams.push(item.args.token);
      }
    }
  });
  return actionParams;
}


/**
 * @since 7.0.0
 * @function
 * @name createRouteDefinition
 * @param {string} method
 * @param {Function | IProvider} controller
 * @param {Function | IProvider} module
 * @returns {RouteDefinition}
 *
 * @description
 * Creates IRouteDefinition which is used by createRouteHandler in dynamic router
 */
export function createRouteDefinition(
  method: RouteMethodDefinition,
  controller: Function | IProvider,
  module?: Function | IProvider
): RouteDefinition {
  const controllerProvider = verifyProvider(controller);
  const allControllerMetadata = Injector.Sync.getAllMetadataForTarget(controllerProvider);
  const controllerMetadata: IControllerMetadata = allControllerMetadata.find(item => item.decorator === Controller)?.args;
  const methodDecorator: IMetadata = allControllerMetadata.find(item =>
    item.propertyKey === method.name && item.type === "method" && item.decorator === method.decorator
  );
  if (isUndefined(methodDecorator)) {
    throw new RouterError(
      `${method.name.toUpperCase()} decorator must be defined on controller ${controllerProvider.provide.name}`,
      500
    );
  }
  return {
    module: isFalsy(module) ? null : {
      provider: verifyProvider(module),
      metadata: getClassMetadata(Module, verifyProvider(module).provide)?.args
    },
    controller: {
      provider: controllerProvider,
      metadata: controllerMetadata
    },
    allControllerMetadata,
    method: methodDecorator
  };
}

/**
 * @since 7.0.0
 * @function
 * @name getRouteDefinitions
 * @param {ModuleInjector} moduleInjector ModuleInjector
 * @returns {ModuleInjector}
 *
 * @description
 * Use httpServer function to httpServer an Module.
 */
export function getRouteDefinitions(moduleInjector: ModuleInjector): Array<RouteDefinition> {
  let routeDefinitions: Array<RouteDefinition> = [];
  moduleInjector.getAllMetadata().forEach((moduleMetadata: IModuleMetadata, module: Function) => {
    verifyProviders(moduleMetadata.controllers).forEach((provider: IProvider) => {
      let allControllerMetadata = Injector.Sync.getAllMetadataForTarget(provider);
      let controllerMetadata: IControllerMetadata = allControllerMetadata.find(item => item.decorator === Controller)?.args;
      allControllerMetadata
        .filter(item => inArray(REST_DECORATORS, item.decorator))
        .forEach(method => {
          routeDefinitions.push({
            module: {
              provider: verifyProvider(module),
              metadata: moduleMetadata
            },
            controller: {
              provider,
              metadata: controllerMetadata
            },
            allControllerMetadata,
            method
          });
        });
    });
  });
  return routeDefinitions;
}

/**
 * Get Route Path
 * @param definition
 * @param modulePath
 */
export function getRoutePath(definition: RouteDefinition, modulePath = "/"): string {
  return `/${[].concat(modulePath?.split("/"))
    .concat(definition.controller.metadata.path?.split("/"))
    .concat(definition.method.args.path?.split("/"))
    .filter(isTruthy)
    .join("/")}`;
}

/**
 * Get Request from injector
 * @param injector
 */
export function getRequest(injector: Injector | SyncInjector): IncomingMessage | Http2ServerRequest | FakeIncomingMessage {
  return injector.has(Http2ServerRequest) ? injector.get(Http2ServerRequest) : injector.has(FakeIncomingMessage) ?
    injector.get(FakeIncomingMessage) : injector.get(IncomingMessage);
}

/**
 * Get Response from injector
 * @param injector
 */
export function getResponse(injector: Injector | SyncInjector): ServerResponse | Http2ServerResponse | FakeServerResponse {
  return injector.has(Http2ServerResponse) ? injector.get(Http2ServerResponse) : injector.has(FakeServerResponse) ?
    injector.get(FakeServerResponse) : injector.get(ServerResponse);
}

/**
 * Get Body
 * @param request
 */
export function getRequestBody(request: IncomingMessage | Http2ServerRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    let body: Array<Buffer> = [];
    request.on("data", item => body.push(<Buffer>item));
    request.on("error", reject);
    request.on("end", () => resolve(Buffer.concat(body)));
  });
}


/**
 * @since 7.0.0
 * @decorator
 * @function
 * @name Executor
 * @private
 *
 * @description
 * Responsible for async execution
 *
 */
class Executor {
  private result: any;
  private steps: Array<() => Promise<any>> = [];

  constructor(private handler: () => Promise<any>) {
  }

  /**
   * Add interceptor
   * @param handler
   */
  addInterceptor(handler: () => Promise<any>) {
    this.steps.push(handler);
  }

  /**
   * Execute steps
   */
  async execute(response: ServerResponse | Http2ServerResponse): Promise<any> {
    for (const step of this.steps) {
      let result = await step();
      if (isDefined(result) && !response.writableEnded) {
        return result;
      } else if (isDefined(result) && response.writableEnded) {
        this.result = result;
        break;
      } else if (isUndefined(result) && response.writableEnded) {
        throw new RouterError(
          [
            "On response.end() invoke, interceptor must return value to preserve async behavior!",
            "It's required to return value only if response was ended via node response (ServerResponse | Http2ServerResponse) api!",
            "",
            "Invalid:",
            "async invoke(method: InterceptedRequest): Promise<any> {",
            "\tlet result = await method.handler();",
            "\tmethod.response.end(result);",
            "}",
            "",
            "Valid:",
            "async invoke(method: InterceptedRequest): Promise<any> {",
            "\tlet result = await method.handler();",
            "\tmethod.response.end(result);",
            "\treturn result;",
            "}",
            "",
            "@Inject() service: MyService",
            "async invoke(method: InterceptedRequest): Promise<any> {",
            "\tlet result = await method.handler();",
            "\tthis.service.fire(result);",
            "}",
            "",
            "@Inject() service: MyService",
            "async invoke(method: InterceptedRequest): Promise<any> {",
            "\tlet result = await method.handler();",
            "\treturn this.service.transform(result);",
            "}"
          ].join("\n"),
          500
        );
      }
    }
    return await this.invoke();
  }

  /**
   * Invoke
   */
  async invoke(): Promise<any> {
    if (isUndefined(this.result)) {
      this.result = await this.handler();
    }
    return await this.result;
  }
}

/**
 * Apply server injectables
 * @since 7.0.0
 * @function
 * @param handlerInjector
 * @param route
 * @param config
 * @private
 */
async function applyServerInjectables(
  handlerInjector: Injector | SyncInjector,
  route: IResolvedRoute, config?: ServerConfig
): Promise<Array<IProvider>> {
  let providers: Array<IProvider> = [];
  const request = getRequest(handlerInjector);
  const response = getResponse(handlerInjector);
  if (!handlerInjector.hasName()) {
    const requestName = "Request: " + route.url + ":" + route.method;
    handlerInjector.setName({provide: requestName, useValue: requestName});
  }
  // add route params to injector
  for (const key of Reflect.ownKeys(route.params)) {
    handlerInjector.set(PATH_PARAM + key.toString(), Reflect.get(route.params, key));
  }
  // if its mock server attach correct Request & Response classes
  if (config?.isMockServer) {
    [IncomingMessage, Http2ServerRequest].forEach(item => providers.push({
      provide: item,
      useValue: request
    }));
    [ServerResponse, Http2ServerResponse].forEach(item => providers.push({
      provide: item,
      useValue: response
    }));
    if (isArray(config.mockProviders)) {
      providers = providers.concat(config.mockProviders);
    }
  }
  return providers;
}

/**
 * Apply interceptor
 * @since 7.0.0
 * @function
 * @name applyHandler
 * @param provider
 * @param lazyParams
 * @param propertyKey
 * @param handlerInjector
 * @param providers
 * @param controllerProviders
 * @private
 *
 */
async function applyHandler(
  provider: IProvider,
  lazyParams: () => Array<any>,
  propertyKey: string | symbol,
  handlerInjector: Injector | SyncInjector,
  providers: Array<IProvider>,
  controllerProviders: Array<IProvider>
): Promise<any> {
  const instance = await handlerInjector.createAndResolve(
    provider,
    shiftLeft(providers, controllerProviders)
  );
  return await Reflect.get(instance, propertyKey).apply(
    instance,
    lazyParams()
  );
}

/**
 * Create Route Handler
 * @param routeDefinition
 * @param config
 */
export function createRouteHandler(routeDefinition: RouteDefinition, config?: ServerConfig): IRouteHandler {
  const actionParams = getMethodParams(routeDefinition.allControllerMetadata, routeDefinition.method.propertyKey);
  const controllerProviders = verifyProviders(routeDefinition.controller.metadata.providers);
  let interceptors: Array<ResolvedInterceptor> = verifyProviders(
    routeDefinition.controller.metadata.interceptors ?? []
  ).map(item => ({provider: item, args: {}}));
  routeDefinition.allControllerMetadata.filter(item =>
    REQUEST_INTERCEPTORS.has(item.decorator) && item.propertyKey === routeDefinition.method.propertyKey
  ).forEach(item => interceptors.push({
    provider: verifyProvider(item.args.Class),
    args: item.args.args
  }));
  return async (handlerInjector: Injector, route: IResolvedRoute) => {
    let providers: Array<IProvider> = await applyServerInjectables(handlerInjector, route, config);
    const request = getRequest(handlerInjector);
    const response = getResponse(handlerInjector);
    const executor = new Executor(() => applyHandler(
      routeDefinition.controller.provider,
      () => actionParams.map(token => handlerInjector.get(token)),
      routeDefinition.method.propertyKey,
      handlerInjector,
      providers,
      controllerProviders
    ));
    for (const item of interceptors) {
      executor.addInterceptor(() => {
        const method: InterceptedRequest = {
          handler: () => executor.invoke(),
          route,
          request,
          response,
          injector: handlerInjector,
          args: item.args
        };
        return applyHandler(
          item.provider,
          () => Array.of(method),
          INTERCEPTOR_METHOD,
          handlerInjector,
          providers,
          controllerProviders
        );
      });
    }
    return await executor.execute(response);
  };
}

/**
 * @since 7.0.0
 * @function
 * @name createRoute
 * @param {RouteMethodDefinition} method
 * @param {Function | IProvider} controller
 * @param {Function | IProvider} module
 * @param {ServerConfig} config
 */
export function createRoute(
  method: RouteMethodDefinition,
  controller: Function | IProvider,
  module?: Function | IProvider,
  config?: ServerConfig): IRouteHandler {
  return createRouteHandler(createRouteDefinition(method, controller, module), config);
}
