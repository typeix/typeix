import {ModuleInjector, Module} from "@typeix/modules";
import {isArray} from "@typeix/utils";
import {Router, RouterError} from "@typeix/router";
import {getClassMetadata} from "@typeix/metadata";
import {Logger} from "@typeix/logger";
import {RootModuleMetadata} from "../decorators/module";
import {OnError} from "../decorators";
import {Server} from "net";
import {IProvider, verifyProvider, verifyProviders} from "@typeix/di";
import {getRouteDefinitions, getRoutePath, createRouteHandler} from "../helpers";

export interface ServerConfig {
  mockProviders?: Array<IProvider>;
  isMockServer?: boolean;
}

/**
 * @since 1.0.0
 * @function
 * @name pipeServer
 * @param {Server} server Server
 * @param {Function} Class module
 * @param {ServerConfig} config
 * @returns {ModuleInjector}
 *
 * @description
 * Use httpServer function to httpServer an Module.
 */
export async function pipeServer(server: Server, Class: Function, config?: ServerConfig): Promise<ModuleInjector> {
  let metadata: RootModuleMetadata = getClassMetadata(Module, Class)?.args;
  if (!isArray(metadata.shared_providers)) {
    throw new RouterError("Server must be initialized on @RootModule", 500);
  }
  if (!verifyProviders(metadata.shared_providers).find(item => item.provide === Router)) {
    metadata.shared_providers.push(verifyProvider(Router));
  }
  if (!verifyProviders(metadata.shared_providers).find(item => item.provide === Logger)) {
    metadata.shared_providers.push(verifyProvider({
      provide: Logger,
      useFactory: () => new Logger({
        options: {
          level: "info"
        }
      })
    }));
  }
  const moduleInjector = await ModuleInjector.createAndResolve(Class, verifyProviders(metadata.shared_providers));
  const routeDefinitions = getRouteDefinitions(moduleInjector);
  const injector = moduleInjector.getInjector(Class);
  const router = injector.get(Router);
  const logger = injector.get(Logger);
  for (const def of routeDefinitions) {
    const routeInjector = moduleInjector.getInjector(def.module.provider);
    const path = getRoutePath(def, def.module.metadata.path);
    const method = def.method.decorator === OnError ? Router.ERROR : def.method.decorator.name;
    logger.info(`Router.add ${path} for controller ${def.controller.provider.provide.name} on method ${method}`);
    Reflect.get(
      router,
      method === Router.ERROR ? "onError" : method.toLowerCase()
    ).apply(router, [path, createRouteHandler(def, config), routeInjector]);
  }
  router.pipe(server);
  return moduleInjector;
}


