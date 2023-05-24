<p align="center">
  <a href="https://typeix.com" target="blank">
    <img src="https://avatars.githubusercontent.com/u/38910665?s=200&v=4" width="120" alt="Typeix Logo" />
  </a>
</p>
<p align="center">
A progressive <a href="https://nodejs.org" target="_blank">Node.js</a>
tools for building efficient and scalable applications.
</p>

# @typeix/resty-ws

[![Build Status][travis-img]][travis-url]
[![Coverage Status][coverage-img]][coverage-url]
![npm][npm-version-img]

Typeix websocket package for resty framework, each connection has dedicated controller instance and it's destroyed once connection is closed or staled.

## Usage
In example below you can find basic application server starter:
```ts
@WebSocketController({
  socketOptions: {
    path: "/ws"
  }
})
class ChatController implements IAfterConstruct {

  @Inject() logger: Logger;
  @Inject() socket: WebSocket;
  @Inject() request: IncomingMessage;

  @Subscribe("message")
  onMessage(@Arg() buffer: Buffer, @Arg() isBinary: boolean, @Args() args: [RawData, boolean]) {
    this.logger.info(data.toString(), isBinary);
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
class Application {

}

// START SERVER
async function bootstrap() {
  const server = createServer();
  const injector = await pipeServer(server, Application);
  await pipeWebSocket(server, Application);
  server.on("error", e => console.error(e));
  server.listen(8080);
  return injector;
}

export default bootstrap();
```

[travis-url]: https://circleci.com/gh/typeix/typeix
[travis-img]: https://img.shields.io/circleci/build/github/typeix/typeix/main
[npm-version-img]: https://img.shields.io/npm/v/@typeix/resty
[coverage-img]: https://coveralls.io/repos/github/typeix/typeix/badge.svg?branch=main
[coverage-url]: https://coveralls.io/github/typeix/typeix?branch=main
