import {IAfterConstruct, Inject, Logger, pipeServer, RootModule} from "@typeix/resty";
import {createServer, IncomingMessage} from "http";
import {Event, Args, WebSocketController} from "../decorators";
import {pipeWebSocket} from "./server";
import {AddressInfo, RawData, WebSocket} from "ws";

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
    const moduleInjector = await pipeServer(server, WebSocketApplication);
    expect(moduleInjector).toBeTruthy();
    const injector = await pipeWebSocket(server, WebSocketApplication);
    expect(injector).toBeTruthy();
    expect(moduleInjector).toBe(injector);

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
        sockets.forEach(ws => ws.terminate());
        server.close();
      }, 500);
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(messages).toEqual([
      message, message,
      message, message,
      message, message,
      message, message,
      message, message,
      message, message,
      message, message,
      message, message,
      message, message,
      message, message
    ]);
  });
});
