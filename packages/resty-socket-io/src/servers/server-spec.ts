import {Controller, IAfterConstruct, Inject, Injectable, Logger, pipeServer, RootModule} from "@typeix/resty";
import {createServer, IncomingMessage} from "http";
import {Args, Subscribe, SocketIOController, Arg, Middleware} from "../decorators";
import {pipeWebSocket} from "./server";
import {Socket as ClientSocket, Manager} from "socket.io-client";
import {Socket} from "socket.io";
import {AddressInfo} from "net";

const envTimeout = parseInt(process.env.TEST_TIMEOUT, 10);
const asyncTimeout = envTimeout || 3000;
describe("WebSocket", () => {

  it("Create server and apply middleware", async () => {

    const message = JSON.stringify({name: "message"});
    const messages = [];
    const middlewares = [];

    @Injectable()
    class MyMiddleware implements Middleware {

      @Inject() socket: Socket;
      @Inject() request: IncomingMessage;
      use(socket: Socket, next: (err?: Error) => void) {
        middlewares.push(socket.conn.request.headers);
        expect(socket).toBe(this.socket);
        expect(socket.conn.request).toBe(this.request);
        next();
      }
    }

    @SocketIOController({
      middlewares: [MyMiddleware]
    })
    class ChatController implements IAfterConstruct {

      @Inject() logger: Logger;
      @Inject() socket: Socket;
      @Inject() request: IncomingMessage;

      @Subscribe("message")
      onMessage(@Args() data: Array<any>) {
        this.logger.info(data.toString());
        messages.push(data.toString());
        this.socket.send(data.toString());
      }

      afterConstruct(): void {
        this.logger.info({
          headers: this.request.headers
        });
      }
    }

    @Controller({
      path: "/other"
    })
    class OtherController {
    }

    @RootModule({
      shared_providers: [],
      controllers: [ChatController, OtherController]
    })
    class WebSocketApplication {

    }

    const server = createServer();
    const moduleInjector = await pipeServer(server, WebSocketApplication);
    const injector = await pipeWebSocket(server, WebSocketApplication);
    expect(injector).toBeTruthy();
    expect(moduleInjector).toBeTruthy();
    expect(moduleInjector).toBe(injector);
    return await new Promise((resolve) => {
      server.listen(0, () => {
        const address: AddressInfo = <AddressInfo>server.address();
        const sockets: Array<ClientSocket> = [];
        for (let i = 0; i < 1; i++) {
          const manager = new Manager("ws://localhost:" + address.port);
          manager.on("error", err => console.error(err));
          const ws = manager.socket("/");
          ws.on("connect", () => ws.send(message));
          ws.on("message", data => messages.push(data.toString()));
          sockets.push(ws);
        }
        setTimeout(() => {
          sockets.forEach(ws => {
            ws.disconnect();
            ws.close();
          });
          server.closeAllConnections();
          resolve(true);
          expect(messages).toContain(message);
          expect(middlewares.length).toBeGreaterThanOrEqual(1);
        }, asyncTimeout);
      });
    });
  });

  it("Create server and apply namespaces", async () => {

    const message = JSON.stringify({name: "message"});
    const messages = [];
    const messagesAdmin = [];
    const middlewares = [];

    @Injectable()
    class MyMiddleware implements Middleware {

      @Inject() socket: Socket;
      @Inject() request: IncomingMessage;
      use(socket: Socket, next: (err?: Error) => void) {
        middlewares.push(socket.conn.request.headers);
        expect(socket).toBe(this.socket);
        expect(socket.conn.request).toBe(this.request);
        next();
      }
    }

    @SocketIOController({
      middlewares: [MyMiddleware]
    })
    class ChatController implements IAfterConstruct {

      @Inject() logger: Logger;
      @Inject() socket: Socket;
      @Inject() request: IncomingMessage;

      @Subscribe("message")
      onMessage(@Args() data: Array<any>) {
        this.logger.info(data.toString());
        messages.push(data.toString());
        this.socket.send(data.toString());
      }

      @Subscribe("message", "/admin")
      onMessageNamespaced(@Args() data: Array<any>) {
        this.logger.info(data.toString());
        messagesAdmin.push(data.toString());
        this.socket.send(data.toString());
      }

      afterConstruct(): void {
        this.logger.info({
          headers: this.request.headers
        });
      }
    }

    @Controller({
      path: "/other"
    })
    class OtherController {
    }

    @RootModule({
      shared_providers: [],
      controllers: [ChatController, OtherController]
    })
    class WebSocketApplication {

    }

    const server = createServer();
    const moduleInjector = await pipeServer(server, WebSocketApplication);
    const injector = await pipeWebSocket(server, WebSocketApplication);
    expect(injector).toBeTruthy();
    expect(moduleInjector).toBeTruthy();
    expect(moduleInjector).toBe(injector);
    return await new Promise((resolve) => {
      server.listen(0, () => {
        const address: AddressInfo = <AddressInfo>server.address();
        const sockets: Array<ClientSocket> = [];
        const manager = new Manager("ws://localhost:" + address.port);
        manager.on("error", err => console.error(err));
        const ws = manager.socket("/");
        ws.on("connect", () => ws.send(message));
        ws.on("message", data => messages.push(data.toString()));
        sockets.push(ws);
        const ws1 = manager.socket("/admin");
        ws1.on("connect", () => ws1.send(message));
        ws1.on("message", data => messagesAdmin.push(data.toString()));
        sockets.push(ws1);
        setTimeout(() => {
          sockets.push(ws1);
          sockets.forEach(wss => {
            wss.disconnect();
            wss.close();
          });
          server.closeAllConnections();
          resolve(true);
          expect(messages).toContain(message);
          expect(messagesAdmin).toContain(message);
          expect(messages).toEqual(messagesAdmin);
          expect(middlewares.length).toBeGreaterThanOrEqual(1);
        }, asyncTimeout);
      });
    });
  });


  it("Create server and multiple connections and transfer data", async () => {

    const message = JSON.stringify({name: "message"});
    const messages = [];

    @SocketIOController()
    class ChatController implements IAfterConstruct {

      @Inject() logger: Logger;
      @Inject() socket: Socket;
      @Inject() request: IncomingMessage;

      @Subscribe("message")
      onMessage(@Args() data: Array<any>) {
        this.logger.info(data.toString());
        messages.push(data.toString());
        this.socket.send(data.toString());
      }

      afterConstruct(): void {
        this.logger.info({
          headers: this.request.headers
        });
      }
    }

    @Controller({
      path: "/other"
    })
    class OtherController {
    }

    @RootModule({
      shared_providers: [],
      controllers: [ChatController, OtherController]
    })
    class WebSocketApplication {

    }

    const server = createServer();
    const moduleInjector = await pipeServer(server, WebSocketApplication);
    const injector = await pipeWebSocket(server, WebSocketApplication);
    expect(injector).toBeTruthy();
    expect(moduleInjector).toBeTruthy();
    expect(moduleInjector).toBe(injector);
    return await new Promise((resolve) => {
      server.listen(0, () => {
        const address: AddressInfo = <AddressInfo>server.address();
        const sockets: Array<ClientSocket> = [];
        for (let i = 0; i < 1; i++) {
          const manager = new Manager("ws://localhost:" + address.port);
          manager.on("error", err => console.error(err));
          const ws = manager.socket("/");
          ws.on("connect", () => ws.send(message));
          ws.on("message", data => messages.push(data.toString()));
          sockets.push(ws);
        }
        setTimeout(() => {
          sockets.forEach(ws => {
            ws.disconnect();
            ws.close();
          });
          server.closeAllConnections();
          resolve(true);
          expect(messages).toContain(message);

        }, asyncTimeout);
      });
    });
  });

  it("Create server and should close connections", async () => {

    const message = JSON.stringify({name: "message"});
    const messages = [];

    @SocketIOController({
      socketOptions: {
        path: "/ws"
      }
    })
    class ChatController implements IAfterConstruct {

      @Inject() logger: Logger;
      @Inject() socket: Socket;
      @Inject() request: IncomingMessage;

      @Subscribe("message")
      onMessage(@Args() data: Array<any>) {
        this.logger.info(data.toString());
        messages.push(data.toString());
        this.socket.send(data.toString());
      }

      afterConstruct(): void {
        this.logger.info({
          headers: this.request.headers
        });
      }
    }

    @RootModule({
      shared_providers: [],
      controllers: [ChatController]
    })
    class WebSocketApplication {

    }

    const server = createServer();
    const moduleInjector = await pipeServer(server, WebSocketApplication);
    const injector = await pipeWebSocket(server, WebSocketApplication);
    expect(injector).toBeTruthy();
    expect(moduleInjector).toBeTruthy();
    expect(moduleInjector).toBe(injector);
    return await new Promise((resolve) => {
      server.listen(0, () => {
        const address: AddressInfo = <AddressInfo>server.address();
        const sockets: Array<ClientSocket> = [];
        for (let i = 0; i < 2; i++) {
          const manager = new Manager("ws://localhost:" + address.port, {path: "/ws"});
          manager.on("error", err => console.error(err));
          const ws = manager.socket("/");
          ws.on("connect", () => ws.send(message));
          ws.on("message", data => messages.push(data.toString()));
          sockets.push(ws);
        }
        setTimeout(() => {
          sockets.forEach(ws => {
            ws.disconnect();
            ws.close();
          });
          server.closeAllConnections();
          expect(messages).toContain(message);
          resolve(true);
        }, asyncTimeout);
      });
    });
  });


  it("Create server and verify hartbeat", async () => {

    const message = JSON.stringify({name: "message"});
    const messages = [];
    const pings = [];

    @SocketIOController({
      socketOptions: {
        path: "/ws"
      }
    })
    class ChatController implements IAfterConstruct {

      @Inject() logger: Logger;
      @Inject() socket: Socket;
      @Inject() request: IncomingMessage;

      @Subscribe("message")
      onMessage(@Args() data: Array<any>) {
        this.logger.info(data.toString());
        messages.push(data.toString());
        this.socket.send(data.toString());
      }

      afterConstruct(): void {
        this.logger.info({
          headers: this.request.headers
        });
      }
    }

    @RootModule({
      shared_providers: [],
      controllers: [ChatController]
    })
    class WebSocketApplication {

    }

    const server = createServer();
    const moduleInjector = await pipeServer(server, WebSocketApplication);
    expect(moduleInjector).toBeTruthy();
    const injector = await pipeWebSocket(server, WebSocketApplication, {hartBeatTimeout: 100});
    expect(injector).toBeTruthy();
    expect(moduleInjector).toBe(injector);
    return await new Promise((resolve) => {
      server.listen(0, () => {
        const address: AddressInfo = <AddressInfo>server.address();
        const sockets: Array<ClientSocket> = [];
        for (let i = 0; i < 2; i++) {
          const manager = new Manager("ws://localhost:" + address.port, {path: "/ws"});
          manager.on("error", err => console.error(err));
          const ws = manager.socket("/");
          ws.on("ping", () => pings.push(Date.now()));
          ws.on("connect", () => ws.send(message));
          ws.on("message", data => messages.push(data.toString()));
          sockets.push(ws);
        }
        setTimeout(() => {
          sockets.forEach(ws => ws.disconnect());
          server.closeAllConnections();
          expect(messages).toContain(message);
          expect(pings.length).toBeGreaterThanOrEqual(2);
          resolve(true);
        }, asyncTimeout);
      });
    });
  });


  it("Create server and should terminate", async () => {

    const message = JSON.stringify({name: "message"});
    const messages = [];
    const pings = [];

    @SocketIOController({
      socketOptions: {
        path: "/ws"
      }
    })
    class ChatController implements IAfterConstruct {

      @Inject() logger: Logger;
      @Inject() socket: Socket;
      @Inject() request: IncomingMessage;

      @Subscribe("message")
      onMessage(@Args() data: Array<any>) {
        this.logger.info(data.toString());
        messages.push(data.toString());
        this.socket.send(data.toString());
      }

      afterConstruct(): void {
        this.logger.info({
          headers: this.request.headers
        });
      }
    }

    @RootModule({
      shared_providers: [],
      controllers: [ChatController]
    })
    class WebSocketApplication {

    }

    const server = createServer();
    const moduleInjector = await pipeServer(server, WebSocketApplication);
    expect(moduleInjector).toBeTruthy();
    const injector = await pipeWebSocket(server, WebSocketApplication, {hartBeatTimeout: 200});
    expect(injector).toBeTruthy();
    expect(moduleInjector).toBe(injector);
    return await new Promise(resolve => {
      server.listen(0, () => {
        const address: AddressInfo = <AddressInfo>server.address();
        const sockets: Array<ClientSocket> = [];
        for (let i = 0; i < 2; i++) {
          const manager = new Manager("ws://localhost:" + address.port, {path: "/ws"});
          manager.on("error", err => console.error(err));
          const ws = manager.socket("/");
          ws.on("ping", () => {
            pings.push(Date.now());
            ws.emit("pong", Date.now());
          });
          ws.on("connect", () => ws.send(message));
          ws.on("message", data => messages.push(data.toString()));
          sockets.push(ws);
        }
        setTimeout(() => {
          expect(messages).toContain(message);
          expect(pings.length).toBeGreaterThanOrEqual(1);
          sockets.forEach(ws => ws.disconnect());
          server.closeAllConnections();
          resolve(true);
        }, asyncTimeout);
      });
    });
  });


  it("Create server and verify request body", async () => {

    const message = JSON.stringify({name: "message"});
    const messages = [];
    const pings = [];

    @SocketIOController({
      socketOptions: {
        path: "/ws"
      }
    })
    class ChatController implements IAfterConstruct {

      @Inject() logger: Logger;
      @Inject() socket: Socket;
      @Inject() request: IncomingMessage;

      @Subscribe("message")
      onMessage(
        @Inject() logger: Logger,
        @Arg() buffer: Buffer,
        @Args() args: Array<any>,
        @Inject() logger2: Logger
      ) {
        logger.info(buffer.toString());
        messages.push(buffer.toString());
        this.socket.send(buffer.toString());
        expect(args).toEqual([buffer]);
        expect(logger).toEqual(logger2);
      }

      afterConstruct(): void {
        this.logger.info({
          headers: this.request.headers
        });
      }
    }

    @RootModule({
      shared_providers: [],
      controllers: [ChatController]
    })
    class WebSocketApplication {

    }

    const server = createServer();
    const moduleInjector = await pipeServer(server, WebSocketApplication);
    expect(moduleInjector).toBeTruthy();
    const injector = await pipeWebSocket(server, WebSocketApplication, {hartBeatTimeout: 100});
    expect(injector).toBeTruthy();
    expect(moduleInjector).toBe(injector);
    return await new Promise((resolve) => {
      server.listen(0, () => {
        const address: AddressInfo = <AddressInfo>server.address();
        const sockets: Array<ClientSocket> = [];
        for (let i = 0; i < 2; i++) {
          const manager = new Manager("ws://localhost:" + address.port, {path: "/ws"});
          manager.on("error", err => console.error(err));
          const ws = manager.socket("/");
          ws.on("ping", () => pings.push(Date.now()));
          ws.on("connect", () => ws.send(message));
          ws.on("message", data => messages.push(data.toString()));
          sockets.push(ws);
        }
        setTimeout(() => {
          sockets.forEach(ws => ws.disconnect());
          server.closeAllConnections();
          expect(messages).toContain(message);
          expect(pings.length).toBeGreaterThanOrEqual(1);
          resolve(true);
        }, asyncTimeout);
      });
    });
  });
});
