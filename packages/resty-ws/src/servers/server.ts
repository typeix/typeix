import {
  RootModuleMetadata,
  ModuleInjector,
  SyncModuleInjector,
  getClassMetadata,
  isArray,
  verifyProviders,
  Logger,
  verifyLoggerInProviders
} from "@typeix/resty";
import {Server as HTTPServer} from "http";
import {Server as HTTPSServer} from "https";
import {createSocketHandler, getSocketDefinitions} from "../helpers";
import {Module} from "@typeix/modules";


/**
 * @since 8.4.0
 * @interface
 * @name ServerConfig
 * @description
 * Socket Server Config
 */
export interface ServerConfig {
  hartBeatTimeout?: number;
  useSyncInjector?: boolean;
}

/**
 * @since 8.4.0
 * @function
 * @name pipeWebSocket
 * @param {Server} server Server
 * @param {Function} Class module
 * @param {ServerConfig} config
 * @returns {ModuleInjector}
 *
 * @description
 * Use httpServer function to httpServer an Module.
 */
export async function pipeWebSocket(
  server: HTTPServer | HTTPSServer,
  Class: Function,
  config?: ServerConfig
): Promise<SyncModuleInjector | ModuleInjector> {
  let metadata: RootModuleMetadata = getClassMetadata(Module, Class)?.args;
  if (!isArray(metadata.shared_providers)) {
    throw new Error("Server must be initialized on @RootModule");
  }
  verifyLoggerInProviders(metadata.shared_providers);
  const MODULE_INJECTOR = "@typeix:moduleInjector";
  const sharedProviders = verifyProviders(metadata.shared_providers);
  const moduleInjector = Reflect.has(Class, MODULE_INJECTOR) ? Reflect.get(Class, MODULE_INJECTOR) : config?.useSyncInjector ?
    ModuleInjector.Sync.createAndResolve(Class, sharedProviders) : await ModuleInjector.createAndResolve(Class, sharedProviders);
  const socketDefinitions = getSocketDefinitions(moduleInjector);
  const injector = moduleInjector.getInjector(Class);
  const logger = injector.get(Logger);
  for (const def of socketDefinitions) {
    const socketInjector = moduleInjector.getInjector(def.module.provider);
    logger.info(`Create socket for controller ${def.controller.provider.provide.name}`);
    await createSocketHandler(server, socketInjector, def, config);
  }
  if (!Reflect.has(Class, MODULE_INJECTOR)) {
    Reflect.set(Class, MODULE_INJECTOR, moduleInjector);
    Object.seal(Class);
  }
  return moduleInjector;
}
