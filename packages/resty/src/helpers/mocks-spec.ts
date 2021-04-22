import {fakeHttpServer, FakeServerApi} from "./mocks";
import {
  CONNECT,
  Controller,
  DELETE,
  GET,
  HEAD,
  OnError,
  OPTIONS,
  PATCH,
  PathParam,
  POST, Produces,
  PUT,
  RootModule,
  TRACE
} from "../index";
import {Inject} from "@typeix/di";
import {Logger} from "@typeix/logger";
import {IResolvedRoute, ResolvedRoute} from "@typeix/router";
import {IncomingMessage, ServerResponse} from "http";
import {addRequestInterceptor, BodyAsBufferInterceptor} from "../interceptors/request";


describe("fakeHttpServer", () => {

  let server: FakeServerApi;

  beforeEach(() => {

    @Controller({
      path: "/"
    })
    class MyController {

      @Inject()
      private request: IncomingMessage;

      @Inject()
      private response: ServerResponse;

      @ResolvedRoute()
      private route: IResolvedRoute;

      @GET()
      @HEAD()
      @POST()
      @PUT()
      @DELETE()
      @OPTIONS()
      @CONNECT()
      @TRACE()
      @PATCH()
      actionGet() {
        return this.route.method.toUpperCase() + " ACTION";
      }

      @GET("write")
      doWrite() {
        this.response.setHeader("Content-Type", "text/plain");
        this.response.write(this.route.method.toUpperCase() + " WRITE");
      }

      @GET("/path/<id:(\\d+)>/<name>")
      @Produces("text/plain")
      actionPath(@PathParam("id") number: string, @PathParam("name") name: string) {
        return this.route.method.toUpperCase() + ` ${number}:${name}`;
      }

      @OnError("/fire-error")
      errorCase() {
        return "FIRE ERROR CASE";
      }

      @POST("/call")
      @PUT("/call")
      @PATCH("/call")
      @addRequestInterceptor(BodyAsBufferInterceptor)
      async actionAjax(@Inject() body: Buffer) {
        return "CALL=" + body.toString();
      }

      @GET("redirect")
      actionRedirect() {
        this.response.setHeader("Location", "/mypage");
        this.response.writeHead(307);
      }
    }

    @RootModule({
      shared_providers: [],
      providers: [{
        provide: Logger,
        useFactory: () => new Logger({
          options: {
            level: "error"
          }
        })
      }],
      controllers: [MyController]
    })
    class MyModule {
    }

    server = fakeHttpServer(MyModule);
  });


  it("Should do GET redirect", async () => {
    let api = await server.GET("/redirect");
    expect(api.getStatusCode()).toBe(307);
    expect(api.getHeaders()).toEqual({"Location": "/mypage"});
  });

  it("Should do GET found error", async () => {
    let api = await server.GET("/fire-error");
    expect(api.getBody().toString()).toContain("FIRE ERROR CASE");
    expect(api.getStatusCode()).toBe(404);
  });

  it("Should do GET write", async () => {
    let api = await server.GET("/write");
    expect(api.getStatusCode()).toBe(200);
    expect(api.getBody().toString()).toBe("GET WRITE");
  });

  it("Shoud do GET write and check headers", async () => {
    let api = await server.GET("/write");
    expect(api.hasHeader("Content-Type")).toBeTruthy();
    expect(api.getHeaderNames()).toEqual(["Content-Type"]);
    api.removeHeader("Content-Type");
    expect(api.hasHeader("Content-Type")).toBeFalsy();
  });

  it("Should do GET not found", async () => {
    let api = await server.GET("/abc");
    expect(api.getBody().toString()).toContain("Router.parseRequest: /abc no route found, method: GET");
    expect(api.getStatusCode()).toBe(404);
  });

  it("Should do GET index", async () => {
    let api = await server.GET("/");
    expect(api.getBody().toString()).toBe("GET ACTION");
    expect(api.getStatusCode()).toBe(200);
  });

  it("Should do GET path /path/<id:(\\d+)>/<name", async () => {
    let api = await server.GET("/path/111/igor");
    expect(api.getBody().toString()).toBe("GET 111:igor");
    expect(api.getHeader("Content-Type")).toBe("text/plain");
    expect(api.getStatusCode()).toBe(200);
  });

  it("Should do OPTIONS index", async () => {
    let api = await server.OPTIONS("/");
    expect(api.getBody().toString()).toBe("OPTIONS ACTION");
    expect(api.getStatusCode()).toBe(200);
  });

  it("Should do CONNECT index", async () => {
    let api = await server.CONNECT("/");
    expect(api.getBody().toString()).toBe("CONNECT ACTION");
  });

  it("Should do DELETE index", async () => {
    let api = await server.DELETE("/");
    expect(api.getBody().toString()).toBe("DELETE ACTION");
  });

  it("Should do HEAD index", async () => {
    let api = await server.HEAD("/");
    expect(api.getBody().toString()).toBe("HEAD ACTION");
  });

  it("Should do TRACE index", async () => {
    let api = await server.TRACE("/");
    expect(api.getBody().toString()).toBe("TRACE ACTION");
  });

  it("Should do POST index", async () => {
    let api = await server.POST("/");
    expect(api.getBody().toString()).toBe("POST ACTION");
  });

  it("Should do PATCH index", async () => {
    let api = await server.PATCH("/");
    expect(api.getBody().toString()).toBe("PATCH ACTION");
  });

  it("Should do PUT index", async () => {
    let api = await server.PUT("/");
    expect(api.getBody().toString()).toBe("PUT ACTION");
  });

  it("Should do POST /call", async () => {
    let api = await server.POST("/call", {}, Buffer.from("SENT_FROM_CLIENT"));
    expect(api.getBody().toString()).toBe("CALL=SENT_FROM_CLIENT");
  });

  it("Should do PUT /call", async () => {
    let api = await server.PUT("/call", {}, Buffer.from("SENT_FROM_CLIENT"));
    expect(api.getBody().toString()).toBe("CALL=SENT_FROM_CLIENT");
  });

  it("Should do PATCH /call", async () => {
    let api = await server.PATCH("/call", {}, Buffer.from("SENT_FROM_CLIENT"));
    expect(api.getBody().toString()).toBe("CALL=SENT_FROM_CLIENT");
  });


});
