import {
  inArray,
  ModuleInjector,
  SyncModuleInjector,
  Injector,
  IProvider,
  SyncInjector,
  verifyProvider,
  verifyProviders, getMethodParams, Logger, isFalsy, isTruthy
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
 * @param {HTTPServer | HTTPSServer} httpServer HTTPServer | HTTPSServer
 * @param {Injector} socketInjector Injector
 * @param {SocketDefinition} socketDefinition SocketDefinition
 * @param {ServerConfig} config ServerConfig
 * @returns {ModuleInjector}
 *
 * @description
 * Use httpServer function to httpServer an Module.
 */
export async function createSocketHandler(
  httpServer: HTTPServer | HTTPSServer,
  socketInjector: SyncInjector | Injector,
  socketDefinition: SocketDefinition,
  config: ServerConfig
): Promise<Server> {
  const KEEP_ALIVE = "@typeix:isAlive";
  const SOCKET_KEY = "@typeix:sec-websocket-key";
  const server: Server = new Server({
    ...socketDefinition?.controller?.metadata?.socketOptions,
    server: httpServer
  });
  server.on("connection", async (socket: WebSocket, request: IncomingMessage) => {
    Reflect.set(socket, KEEP_ALIVE, true);
    Reflect.set(socket, SOCKET_KEY, request.headers["sec-websocket-key"]);
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
    const logger = injector.get(Logger);
    socket.on("error", err => logger.error({message: "websocket error occurred", error: err}));
    socket.on("pong", () => Reflect.set(socket, KEEP_ALIVE, true));
    socket.on("close", () => {
      logger.debug({message: "close websocket", SOCKET_KEY: Reflect.get(socket, SOCKET_KEY)});
      socket.removeAllListeners();
      injector.destroy();
      Reflect.set(socket, KEEP_ALIVE, false);
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
  const interval = setInterval(function ping() {
    server.clients.forEach((socket: WebSocket) => {
      if (isFalsy(Reflect.get(socket, KEEP_ALIVE))) {
        return socket.terminate();
      }
      Reflect.set(socket, KEEP_ALIVE, false);
      socket.ping(JSON.stringify({
        "sec-websocket-key": Reflect.get(socket, SOCKET_KEY)
      }));
    });
  }, config?.hartBeatTimeout ?? 30000);
  httpServer.on("close", () => {
    server.clients.forEach(
      (socket: WebSocket) => isTruthy(Reflect.get(socket, KEEP_ALIVE)) ? socket.terminate() : false
    );
    clearInterval(interval);
  });
  return server;
}
