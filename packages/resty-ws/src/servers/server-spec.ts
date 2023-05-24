import {IAfterConstruct, Inject, Logger, pipeServer, RootModule} from "@typeix/resty";
import {createServer, IncomingMessage} from "http";
import {Args, Event, WebSocketController} from "../decorators";
import {pipeWebSocket} from "./server";
import {AddressInfo, RawData, WebSocket} from "ws";
import {Arg} from "../decorators/events";

describe("WebSocket", () => {
  it("Create server and multiple connections and transfer data", async () => {

    const message = JSON.stringify({name: "message"});
    const messages = [];

    @WebSocketController({
      socketOptions: {
        path: "/ws"
      }
    })
    class ChatController implements IAfterConstruct {

      @Inject() logger: Logger;
      @Inject() socket: WebSocket;
      @Inject() request: IncomingMessage;

      @Event("message")
      onMessage(@Args() [data, isBinary]: [RawData, boolean]) {
        this.logger.info(data.toString(), isBinary);
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
    const injector = await pipeWebSocket(server, WebSocketApplication);
    const moduleInjector = await pipeServer(server, WebSocketApplication);
    expect(injector).toBeTruthy();
    expect(moduleInjector).toBeTruthy();
    expect(moduleInjector).toBe(injector);
    return await new Promise((resolve) => {
      server.listen(0, () => {
        const address: AddressInfo = <AddressInfo>server.address();
        const sockets = [];
        for (let i = 0; i < 10; i++) {
          const ws = new WebSocket("ws://localhost:" + address.port + "/ws", {
            headers: {
              Authorization: "Basic " + Buffer.from("admin:admin").toString("base64")
            }
          });
          ws.on("open", () => ws.send(message));
          ws.on("message", data => messages.push(data.toString()));
          sockets.push(ws);
        }
        setTimeout(() => {
          expect(messages).toContain(message);
          sockets.forEach(ws => ws.terminate());
          server.close();
          resolve(true);
        }, 5000);
      });
    });
  });

  it("Create server and should close connections", async () => {

    const message = JSON.stringify({name: "message"});
    const messages = [];

    @WebSocketController({})
    class ChatController implements IAfterConstruct {

      @Inject() logger: Logger;
      @Inject() socket: WebSocket;
      @Inject() request: IncomingMessage;

      @Event("message")
      onMessage(@Args() [data, isBinary]: [RawData, boolean]) {
        this.logger.info(data.toString(), isBinary);
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
    const moduleInjector = await pipeServer(server, WebSocketApplication, {useSyncInjector: true});
    const injector = await pipeWebSocket(server, WebSocketApplication, {useSyncInjector: true});
    expect(injector).toBeTruthy();
    expect(moduleInjector).toBeTruthy();
    expect(moduleInjector).toBe(injector);
    return await new Promise((resolve) => {
      server.listen(0, () => {
        const address: AddressInfo = <AddressInfo>server.address();
        const sockets = [];
        for (let i = 0; i < 10; i++) {
          const ws = new WebSocket("ws://localhost:" + address.port, {
            headers: {
              Authorization: "Basic " + Buffer.from("admin:admin").toString("base64")
            }
          });
          ws.on("open", () => ws.send(message));
          ws.on("message", data => messages.push(data.toString()));
          sockets.push(ws);
        }
        setTimeout(() => {
          expect(messages).toContain(message);
          server.close();
          resolve(true);
        }, 5000);
      });
    });
  });


  it("Create server and verify hartbeat", async () => {

    const message = JSON.stringify({name: "message"});
    const messages = [];
    const pings = [];

    @WebSocketController({
      socketOptions: {
        path: "/ws"
      }
    })
    class ChatController implements IAfterConstruct {

      @Inject() logger: Logger;
      @Inject() socket: WebSocket;
      @Inject() request: IncomingMessage;

      @Event("message")
      onMessage(@Args() [data, isBinary]: [RawData, boolean]) {
        this.logger.info(data.toString(), isBinary);
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
        const sockets = [];
        for (let i = 0; i < 10; i++) {
          const ws = new WebSocket("ws://localhost:" + address.port + "/ws", {
            headers: {
              Authorization: "Basic " + Buffer.from("admin:admin").toString("base64")
            }
          });
          ws.on("open", () => ws.send(message));
          ws.on("ping", data => pings.push(data.toString()));
          ws.on("message", data => messages.push(data.toString()));
          sockets.push(ws);
        }
        setTimeout(() => sockets.forEach(ws => ws.pause()), 150);
        setTimeout(() => {
          server.close();
          expect(messages).toContain(message);
          expect(pings.length).toBeGreaterThanOrEqual(10);
          resolve(true);
        }, 5000);
      });
    });
  });


  it("Create server and should terminate", async () => {

    const message = JSON.stringify({name: "message"});
    const messages = [];
    const pings = [];

    @WebSocketController({
      socketOptions: {
        path: "/ws"
      }
    })
    class ChatController implements IAfterConstruct {

      @Inject() logger: Logger;
      @Inject() socket: WebSocket;
      @Inject() request: IncomingMessage;

      @Event("message")
      onMessage(@Args() [data, isBinary]: [RawData, boolean]) {
        this.logger.info(data.toString(), isBinary);
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
    return await new Promise(resolve => {
      server.listen(0, () => {
        const address: AddressInfo = <AddressInfo>server.address();
        const sockets = [];
        for (let i = 0; i < 10; i++) {
          const ws = new WebSocket("ws://localhost:" + address.port + "/ws", {
            headers: {
              Authorization: "Basic " + Buffer.from("admin:admin").toString("base64")
            }
          });
          ws.on("open", () => ws.send(message));
          ws.on("ping", data => pings.push(data.toString()));
          ws.on("message", data => messages.push(data.toString()));
          sockets.push(ws);
        }
        setTimeout(() => {
          server.close();
          expect(messages).toContain(message);
          expect(pings.length).toBeGreaterThanOrEqual(80);
          resolve(true);
        }, 5000);
      });
    });
  });


  it("Create server and verify request body", async () => {

    const message = JSON.stringify({name: "message"});
    const messages = [];
    const pings = [];

    @WebSocketController({
      socketOptions: {
        path: "/ws"
      }
    })
    class ChatController implements IAfterConstruct {

      @Inject() logger: Logger;
      @Inject() socket: WebSocket;
      @Inject() request: IncomingMessage;

      @Event("message")
      onMessage(@Arg() buffer: Buffer, @Arg() isBinary: boolean, @Args() args: [RawData, boolean]) {
        this.logger.info(buffer.toString(), isBinary);
        messages.push(buffer.toString());
        this.socket.send(buffer.toString());
        expect(args).toEqual([buffer, isBinary]);
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
        const sockets = [];
        for (let i = 0; i < 10; i++) {
          const ws = new WebSocket("ws://localhost:" + address.port + "/ws", {
            headers: {
              Authorization: "Basic " + Buffer.from("admin:admin").toString("base64")
            }
          });
          ws.on("open", () => ws.send(message));
          ws.on("ping", data => pings.push(data.toString()));
          ws.on("message", data => messages.push(data.toString()));
          sockets.push(ws);
        }
        setTimeout(() => sockets.forEach(ws => ws.pause()), 150);
        setTimeout(() => {
          server.close();
          expect(messages).toContain(message);
          expect(pings.length).toBeGreaterThanOrEqual(10);
          resolve(true);
        }, 5000);
      });
    });
  });
});