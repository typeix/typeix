import {
  inArray,
  ModuleInjector,
  SyncModuleInjector,
  Injector,
  IProvider,
  SyncInjector,
  verifyProvider,
  verifyProviders,
  Logger,
  isFalsy,
  isTruthy,
  isObject
} from "@typeix/resty";
import {IModuleMetadata, SocketDefinition} from "../interfaces";
import {ISocketControllerOptions, SocketIOController, Subscribe} from "../decorators";
import {EVENT_ARG, EVENT_ARGS} from "../decorators/events";
import {IMetadata} from "@typeix/metadata";
import {ServerConfig} from "../servers/server";
import {IncomingMessage, Server as HTTPServer} from "http";
import {Server as HTTPSServer} from "https";
import {Http2SecureServer} from "http2";
import {Server, Socket, RemoteSocket} from "socket.io";

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
    verifyProviders(moduleMetadata.controllers)
      .filter((provider: IProvider) => Injector.Sync.getAllMetadataForTarget(provider).find(item => item.decorator === SocketIOController))
      .forEach((provider: IProvider) => {
        let allControllerMetadata = Injector.Sync.getAllMetadataForTarget(provider);
        let controllerMetadata: ISocketControllerOptions = allControllerMetadata.find(item => item.decorator === SocketIOController)?.args;
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
          events: allControllerMetadata.filter(item => inArray([Subscribe], item.decorator))
        });
      });
  });
  return routeDefinitions;
}

/**
 * @since 8.4.0
 * @function
 * @private
 * @name getSocketHandlerParams
 * @param {Injector | SyncInjector} injector Injector | SyncInjector
 * @param {SocketDefinition} socketDefinition SocketDefinition
 * @param {IMetadata} event IMetadata
 * @param {Array<any>} args Array<any>
 * @returns Array<any>
 *
 * @description
 * Returns socket handler parameters with correct injected values
 */
function getSocketHandlerParams(
  injector: Injector | SyncInjector,
  socketDefinition: SocketDefinition,
  event: IMetadata,
  args: any[]
): Array<any> {
  const actionParams = socketDefinition.allControllerMetadata.find(item =>
    item.propertyKey === event.propertyKey && item.metadataKey === "design:paramtypes"
  )?.args?.slice() ?? [];
  const actionArgs = [...args];
  socketDefinition.allControllerMetadata.filter(item => item.propertyKey === event.propertyKey && item.type === "parameter")
    .forEach(item => {
      const paramType = item.designParam[item.paramIndex];
      switch (item.args.token) {
        case EVENT_ARGS:
          if (actionParams.length > 0) {
            actionParams.splice(item.paramIndex, 1, [...args]);
          } else {
            actionParams.push([...args]);
          }
          break;
        case EVENT_ARG:
          const value = args.find(i => i.constructor === paramType) ?? actionArgs.shift();
          if (actionParams.length > 0) {
            actionParams.splice(item.paramIndex, 1, value);
          } else {
            actionParams.push(value);
          }
          break;
        case null:
        case undefined:
          if (actionParams.length > 0) {
            actionParams.splice(item.paramIndex, 1, injector.get(paramType));
          } else {
            actionParams.push(injector.get(paramType));
          }
          break;
        default:
          if (actionParams.length > 0) {
            actionParams.splice(item.paramIndex, 1, injector.get(item.args.token));
          } else {
            actionParams.push(injector.get(item.args.token));
          }
          break;
      }
    });
  return actionParams;
}
/**
 * @since 8.4.0
 * @function
 * @private
 * @name applySocketConnection
 * @param {Array<IMetadata>} events Array<IMetadata>
 * @param {Injector | SyncInjector} socketInjector Injector | SyncInjector
 * @param {SocketDefinition} socketDefinition SocketDefinition
 * @param {ServerConfig} config ServerConfig
 * @returns Promise<function>
 *
 * @description
 * Returns socket handler parameters with correct injected values
 */
function applySocketConnection(
  events: Array<IMetadata>,
  socketInjector: SyncInjector | Injector,
  socketDefinition: SocketDefinition,
  config: ServerConfig
) {
  const KEEP_ALIVE = "@typeix:isAlive";
  const SOCKET_KEY = "@typeix:sec-websocket-key";
  return async (socket: Socket) => {
    Reflect.set(socket, KEEP_ALIVE, true);
    Reflect.set(socket, SOCKET_KEY, socket.id);
    const providers = [
      {
        provide: IncomingMessage,
        useValue: socket.conn.request
      },
      {
        provide: Socket,
        useValue: socket
      },
      ...verifyProviders(socketDefinition.controller.metadata.providers)
    ];
    const injector = config?.useSyncInjector ?
      Injector.Sync.createAndResolveChild(<SyncInjector>socketInjector, socketDefinition.controller.provider, providers) :
      await Injector.createAndResolveChild(<Injector>socketInjector, socketDefinition.controller.provider, providers);
    const controllerRef = injector.get(socketDefinition.controller.provider.provide);
    const logger = injector.get(Logger);
    socket.on("error", err => logger.error({message: "websocket error occurred", error: err}));
    socket.on("pong", () => Reflect.set(socket, KEEP_ALIVE, true));
    socket.on("disconnect", () => {
      logger.debug({message: "close websocket", SOCKET_KEY: Reflect.get(socket, SOCKET_KEY)});
      socket.removeAllListeners();
      injector.destroy();
      Reflect.set(socket, KEEP_ALIVE, false);
    });
    for (const event of events) {
      socket.on(event.args.name, async (...args: any[]) => {
        const actionParams = getSocketHandlerParams(injector, socketDefinition, event, args);
        const result = await Reflect.get(controllerRef, event.propertyKey).apply(
          controllerRef,
          actionParams
        );
        if (isTruthy(result) && Buffer.isBuffer(result)) {
          socket.emit(event.args.name, result);
        } else if (isTruthy(result) && isObject(result)) {
          socket.emit(event.args.name, JSON.stringify(result));
        }
      });
    }
  };
}
/**
 * @since 8.4.0
 * @function
 * @private
 * @name groupByEventsByNamespace
 * @param {SocketDefinition} socketDefinition SocketDefinition
 * @returns Map<string, Array<IMetadata>>
 *
 * @description
 * Returns socket handler parameters with correct injected values
 */
function groupByEventsByNamespace(socketDefinition: SocketDefinition): Map<string, Array<IMetadata>> {
  const eventMap: Map<string, Array<IMetadata>> = new Map();
  socketDefinition.events.forEach(event => {
    const name = event.args.namespace;
    if (eventMap.has(name)) {
      eventMap.get(name).push(event);
    } else {
      eventMap.set(name, [event]);
    }
  });
  return eventMap;
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
  httpServer: HTTPServer | HTTPSServer | Http2SecureServer,
  socketInjector: SyncInjector | Injector,
  socketDefinition: SocketDefinition,
  config: ServerConfig
): Promise<Server> {
  const KEEP_ALIVE = "@typeix:isAlive";
  const SOCKET_KEY = "@typeix:sec-websocket-key";
  const server: Server = new Server(httpServer, {
    ...config?.socketOptions,
    ...socketDefinition?.controller?.metadata?.socketOptions
  });
  if (socketDefinition?.controller?.metadata?.middlewares) {
    for (const Middleware of socketDefinition?.controller?.metadata?.middlewares) {
      server.use(async (socket, next) => {
        const providers = [
          {
            provide: IncomingMessage,
            useValue: socket.conn.request
          },
          {
            provide: Socket,
            useValue: socket
          },
          ...verifyProviders(socketDefinition.controller.metadata.providers)
        ];
        const injector = config?.useSyncInjector ?
          Injector.Sync.createAndResolveChild(<SyncInjector>socketInjector, Middleware, providers) :
          await Injector.createAndResolveChild(<Injector>socketInjector, Middleware, providers);
        injector.get(Middleware).use(socket, next);
      });
    }
  }
  const connections = groupByEventsByNamespace(socketDefinition);
  connections.forEach((events, key) => {
    server.of(key).on("connection", applySocketConnection(events, socketInjector, socketDefinition, config));
  });
  const interval = setInterval(async function ping() {
    const sockets = await server.fetchSockets();
    sockets.forEach((socket: RemoteSocket<any, any>) => {
      if (isFalsy(Reflect.get(socket, KEEP_ALIVE))) {
        return socket.disconnect(true);
      }
      Reflect.set(socket, KEEP_ALIVE, false);
      socket.emit("ping", JSON.stringify({
        "sec-websocket-key": Reflect.get(socket, SOCKET_KEY),
        "time": Date.now()
      }));
    });
  }, config?.hartBeatTimeout ?? 30000);
  httpServer.on("close", async function close() {
    clearInterval(interval);
    server.disconnectSockets(true);
  });
  return server;
}
