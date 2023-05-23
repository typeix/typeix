import {
  inArray,
  ModuleInjector,
  SyncModuleInjector,
  Injector,
  IProvider,
  SyncInjector,
  verifyProvider,
  verifyProviders, getMethodParams
} from "@typeix/resty";
import {IModuleMetadata, SocketDefinition} from "../interfaces";
import {ISocketControllerOptions, WebSocketController, Event} from "../decorators";
import {ServerConfig} from "../servers/server";
import {WebSocket, Server} from "ws";
import {IncomingMessage, Server as HTTPServer} from "http";
import {Server as HTTPSServer} from "https";
import {EVENT_ARGS} from "../decorators/events";


/**
 * @since 8.4.0
 * @function
 * @name getSocketDefinitions
 * @param {ModuleInjector} moduleInjector ModuleInjector
 * @returns {ModuleInjector}
 *
 * @description
 * Use httpServer function to httpServer an Module.
 */
export function getSocketDefinitions(moduleInjector: SyncModuleInjector | ModuleInjector): Array<SocketDefinition> {
  let routeDefinitions: Array<SocketDefinition> = [];
  moduleInjector.getAllMetadata().forEach((moduleMetadata: IModuleMetadata, module: Function) => {
    verifyProviders(moduleMetadata.controllers).forEach((provider: IProvider) => {
      let allControllerMetadata = Injector.Sync.getAllMetadataForTarget(provider);
      let controllerMetadata: ISocketControllerOptions = allControllerMetadata.find(item => item.decorator === WebSocketController)?.args;
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
        events: allControllerMetadata.filter(item => inArray([Event], item.decorator))
      });
    });
  });
  return routeDefinitions;
}

/**
 * @since 8.4.0
 * @function
 * @name createSocketHandler
 * @param {HTTPServer | HTTPSServer} httpOrHttpsServer HTTPServer | HTTPSServer
 * @param {Injector} socketInjector Injector
 * @param {SocketDefinition} socketDefinition SocketDefinition
 * @param {ServerConfig} config ServerConfig
 * @returns {ModuleInjector}
 *
 * @description
 * Use httpServer function to httpServer an Module.
 */
export async function createSocketHandler(
  httpOrHttpsServer: HTTPServer | HTTPSServer,
  socketInjector: SyncInjector | Injector,
  socketDefinition: SocketDefinition,
  config: ServerConfig
): Promise<Server> {
  const server: Server = new Server({
    ...socketDefinition?.controller?.metadata?.socketOptions,
    server: httpOrHttpsServer
  });
  server.on("connection", async (socket: WebSocket, request: IncomingMessage) => {
    const providers = [
      {
        provide: IncomingMessage,
        useValue: request
      },
      {
        provide: WebSocket,
        useValue: socket
      }
    ];
    const injector = config?.useSyncInjector ?
      Injector.Sync.createAndResolveChild(<SyncInjector>socketInjector, socketDefinition.controller.provider, providers) :
      await Injector.createAndResolveChild(<Injector>socketInjector, socketDefinition.controller.provider, providers);
    const controllerRef = injector.get(socketDefinition.controller.provider.provide);
    socket.on("close", () => {
      socket.removeAllListeners();
      injector.destroy();
    });
    for (const event of socketDefinition.events) {
      socket.on(event.args.name, async (...args: any[]) => {
        const actionParams = getMethodParams(socketDefinition.allControllerMetadata, event.propertyKey);
        await Reflect.get(controllerRef, event.propertyKey).apply(
          controllerRef,
          actionParams.map(token => token === EVENT_ARGS ? args : injector.get(token))
        );
      });
    }
  });
  return server;
}
