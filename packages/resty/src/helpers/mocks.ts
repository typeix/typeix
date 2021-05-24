import {Server, Socket} from "net";
import {IncomingMessage, ServerResponse} from "http";
import {isDefined, isObject} from "@typeix/utils";
import {Inject, Injector, IProvider} from "@typeix/di";
import {ModuleInjector} from "@typeix/modules";
import {pipeServer} from "../servers";
import {ServerConfig} from "../servers/server";


function asBuffer(chunk: any, buffer: Buffer): Buffer {
  return Buffer.concat([
    buffer,
    chunk instanceof Buffer ? chunk : isObject(chunk) ? Buffer.from(JSON.stringify(chunk)) : Buffer.from(chunk)
  ]);
}

/**
 * @since 1.0.0
 * @class
 * @name FakeIncomingMessage
 * @constructor
 * @description
 * FakeIncomingMessage is used by FakeServerApi
 * Simulates socket api
 *
 * @private
 */
export class FakeIncomingMessage extends IncomingMessage {
  httpVersion = "1.1";
  httpVersionMajor = 1;
  httpVersionMinor = 1;
  connection: Socket;
  headers: any = {};
  rawHeaders: string[] = [];
  trailers: any = {};
  rawTrailers: any = {};
  method?: string;
  url?: string;
  statusCode?: number = 200;
  statusMessage?: string = "OK";
  socket: Socket;
  aborted = false;
  complete = false;
}

/**
 * @since 1.0.0
 * @class
 * @name FakeServerResponse
 * @constructor
 * @description
 * FakeServerResponse is used by FakeServerApi
 * Simulates socket api
 *
 * @private
 */
export class FakeServerResponse extends ServerResponse {
  headers: any = {};
  message = Buffer.alloc(0);

  /**
   * @since 1.0.0
   * @function
   * @name FakeServerResponse#end
   * @private
   * @description
   * End request.ts
   */
  end(chunk?: any) {
    if (chunk) {
      this.message = asBuffer(chunk, this.message);
      this.emit("finish", chunk);
    } else {
      this.emit("finish");
    }
    this.finished = true;
    super.end();
  }

  /**
   * @since 1.0.0
   * @function
   * @name FakeServerResponse#writeHead
   * @private
   * @description
   * Write head
   */
  writeHead(statusCode: number, headers?: any): this {
    this.statusCode = statusCode;
    if (isObject(headers)) {
      Object.assign(this.headers, headers);
    }
    return this;
  }

  /**
   * @since 1.0.0
   * @function
   * @name FakeServerResponse#setHeader
   * @private
   * @description
   * Set response header
   */
  setHeader(name: string, value: string | number | readonly string[]) {
    Reflect.set(this.headers, name, value);
    return this;
  }

  /**
   * @since 1.0.0
   * @function
   * @name FakeServerResponse#getHeader
   * @private
   * @description
   * Get response header
   */
  getHeader(name: string): string {
    return Reflect.get(this.headers, name);
  }


  /**
   * @since 1.0.0
   * @function
   * @name FakeServerResponse#hasHeader
   * @private
   * @description
   * Has header
   */
  hasHeader(name: string): boolean {
    return this.headers.hasOwnProperty(name);
  }


  /**
   * @since 1.0.0
   * @function
   * @name FakeServerResponse#getHeaderNames
   * @private
   * @description
   * Get header names
   */
  getHeaderNames(): string[] {
    return Object.keys(this.headers);
  }

  /**
   * @since 1.0.0
   * @function
   * @name FakeServerResponse#removeHeader
   * @private
   * @description
   * Remove response header
   */
  removeHeader(name: string) {
    Reflect.deleteProperty(this.headers, name);
  }

  /**
   * @since 1.0.0
   * @function
   * @name FakeServerResponse#getHeaders
   * @private
   * @description
   * Get headers
   */
  getHeaders(): { [key: string]: string | string[] } {
    return this.headers;
  }

  /**
   * @since 1.0.0
   * @function
   * @name FakeServerResponse#getBody
   * @private
   * @description
   * Get writed body
   */
  getBody(): Buffer {
    return this.message;
  }

  /**
   * @since 1.0.0
   * @function
   * @name FakeServerResponse#getBody
   * @private
   * @description
   * Get writed body
   */
  getStatusCode(): number {
    return this.statusCode;
  }

  /**
   * @since 1.0.0
   * @function
   * @name FakeServerResponse#write
   * @private
   * @description
   * Write data
   */
  write(chunk: any, encoding: any, cb?: (error: Error | null | undefined) => void): boolean {
    this.message = asBuffer(chunk, this.message);
    return true;
  }
}

/**
 * @since 1.0.0
 * @class
 * @name FakeServerApi
 * @constructor
 * @description
 * Get a FakeServerApi to do serverside requests
 *
 * @private
 */
export class FakeServerApi {

  @Inject() private moduleInjector: ModuleInjector;
  @Inject() private server: Server;

  getModuleInjector(): ModuleInjector {
    return this.moduleInjector;
  }

  /**
   * @since 1.0.0
   * @function
   * @name FakeServerApi#GET
   * @description
   * Fire GET Method
   */
  GET(url: string, headers?: Object): Promise<FakeServerResponse> {
    return this.request("GET", url, headers);
  }

  /**
   * @since 1.0.0
   * @function
   * @name FakeServerApi#OPTIONS
   * @description
   * Fire OPTIONS Method
   */
  OPTIONS(url: string, headers?: Object): Promise<FakeServerResponse> {
    return this.request("OPTIONS", url, headers);
  }

  /**
   * @since 1.0.0
   * @function
   * @name FakeServerApi#HEAD
   * @description
   * Fire HEAD Method
   */
  HEAD(url: string, headers?: Object): Promise<FakeServerResponse> {
    return this.request("HEAD", url, headers);
  }

  /**
   * @since 1.0.0
   * @function
   * @name FakeServerApi#DELETE
   * @description
   * Fire DELETE Method
   */
  DELETE(url: string, headers?: Object): Promise<FakeServerResponse> {
    return this.request("DELETE", url, headers);
  }

  /**
   * @since 1.0.0
   * @function
   * @name FakeServerApi#TRACE
   * @description
   * Fire TRACE Method
   */
  TRACE(url: string, headers?: Object): Promise<FakeServerResponse> {
    return this.request("TRACE", url, headers);
  }

  /**
   * @since 1.0.0
   * @function
   * @name FakeServerApi#CONNECT
   * @description
   * Fire CONNECT Method
   */
  CONNECT(url: string, headers?: Object): Promise<FakeServerResponse> {
    return this.request("CONNECT", url, headers);
  }

  /**
   * @since 1.0.0
   * @function
   * @name FakeServerApi#POST
   * @description
   * Fire POST Method
   */
  POST(url: string, headers?: Object, data?: string | Buffer): Promise<FakeServerResponse> {
    return this.request("POST", url, headers, data);
  }

  /**
   * @since 1.0.0
   * @function
   * @name FakeServerApi#PUT
   * @description
   * Fire PUT Method
   */
  PUT(url: string, headers?: Object, data?: string | Buffer): Promise<FakeServerResponse> {
    return this.request("PUT", url, headers, data);
  }

  /**
   * @since 1.0.0
   * @function
   * @name FakeServerApi#PATCH
   * @description
   * Fire PATCH Method
   */
  PATCH(url: string, headers?: Object, data?: string | Buffer): Promise<FakeServerResponse> {
    return this.request("PATCH", url, headers, data);
  }

  /**
   * @since 1.0.0
   * @function
   * @name FakeServerApi#request
   * @private
   * @description
   * Fire request.ts
   */
  private request(method: string, url: string, headers?: Object, data?: any): Promise<FakeServerResponse> {
    let request = new FakeIncomingMessage(new Socket());
    let response = new FakeServerResponse(request);
    request.method = method;
    request.url = url;
    request.headers = headers ?? {};
    this.server.emit("request", request, response);
    process.nextTick(() => {
      if (data) {
        request.emit("data", data);
      }
      request.emit("end");
    });
    return new Promise(resolve => {
      response.on("finish", () => resolve(response));
    });
  }
}

/**
 * @since 7.0.0
 * @function
 * @name fakeHttpServer
 * @private
 * @description
 * Fire request.ts
 */
export async function fakeHttpServer(Class: Function, config?: ServerConfig): Promise<FakeServerApi> {
  const server = new Server();
  let providers: Array<IProvider> = [
    {
      provide: Server,
      useValue: server
    },
    {
      provide: ModuleInjector,
      useValue: await pipeServer(server, Class, Object.assign(isDefined(config) ? config : {}, {isMockServer: true}))
    }
  ];
  return (await Injector.createAndResolve(FakeServerApi, providers)).get(FakeServerApi);
}
