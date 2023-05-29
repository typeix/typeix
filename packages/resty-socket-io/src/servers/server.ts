import {ModuleInjector, SyncModuleInjector, Logger} from "@typeix/resty";
import {Server as HTTPServer} from "http";
import {Server as HTTPSServer} from "https";
import {Http2SecureServer} from "http2";
import {createSocketHandler, getSocketDefinitions} from "../helpers";
import {ServerOptions} from "socket.io";


/**
 * @since 8.4.0
 * @interface
 * @name ServerConfig
 * @description
 * Socket Server Config
 */
export interface ServerConfig {
  socketOptions?: Partial<ServerOptions>;
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
  server: HTTPServer | HTTPSServer | Http2SecureServer,
  Class: Function,
  config?: ServerConfig
): Promise<SyncModuleInjector | ModuleInjector> {
  const MODULE_INJECTOR = "@typeix:moduleInjector";
  if (!Reflect.has(Class, MODULE_INJECTOR)) {
    throw new Error("Rest application server must be initialized, please use await pipeServer(server, Application) first");
  }
  const moduleInjector = Reflect.get(Class, MODULE_INJECTOR);
  const injector = moduleInjector.getInjector(Class);
  const logger = injector.get(Logger);
  for (const def of getSocketDefinitions(moduleInjector)) {
    const socketInjector = moduleInjector.getInjector(def.module.provider);
    logger.info(`Create socket for controller ${def.controller.provider.provide.name}`);
    await createSocketHandler(server, socketInjector, def, config);
  }
  return moduleInjector;
}
