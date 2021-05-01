<% if (type == "method") { %>import {Injectable, Injector, Interceptor} from "@typeix/resty";
import { <%= classify(name) %>Interceptor } from "./<%= name %>.interceptor";

describe("<%= classify(name) %> interceptor", () => {
  it("should be defined on <%= classify(type) %>", () => {
    @Injectable()
    class TestService {
      @<%= classify(name) %>("value")
      testAction() {}
    }
    const injector = Injector.createAndResolve(TestService, [])
    const tService = injector.get(TestService);
    const interceptorSpy = jest.spyOn(<%= classify(name) %>Interceptor, "invoke");
    expect(tService.testAction()).toBeDefined();
    expect(interceptorSpy).toHaveBeenCalled();
  });
});
<% } else { %>import {
  Controller,
  addRequestInterceptor,
  GET,
  IRouteHandler,
  createRouteMock
} from "@typeix/resty";
import { <%= classify(name) %>Interceptor } from "./<%= name %>.interceptor";

describe("<%= classify(name) %> interceptor", () => {
  it("should be defined on <%= classify(type) %>", () => {
    @Controller({
      path: "/"
    })
    class TestController {
      @GET()
      @addRequestInterceptor(<%= classify(name) %>Interceptor, {})
      indexAction() {
        return "Hello World!";
      }
    }
    let handler: IRouteHandler = createRouteMock(
      {
        name: "indexAction",
        decorator: GET
      },
      TestController
    );
    const interceptorSpy = jest.spyOn(<%= classify(name) %>Interceptor, "invoke");
    expect(handler()).toEqual("Hello World!");
    expect(interceptorSpy).toHaveBeenCalled();
  });
});

<% }  %>
