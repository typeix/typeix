import {fakeHttpServer, FakeServerApi} from "@typeix/resty";
import {AppModule} from "../src/app.module";

describe('AppController (e2e)', () => {
  let app;

  beforeEach( () => {
    app = fakeHttpServer(AppModule);
  });

  it('/ (GET)', async () => {
    const response = await app.GET("/");
    expect(response.getBody()).toEqual('Hello World!')
    expect(response.getStatusCode()).toEqual(200);
  });
});
