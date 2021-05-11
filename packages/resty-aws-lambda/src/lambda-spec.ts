import {
  Controller,
  RootModule,
  GET,
  Module,
  OnError,
  Inject,
  Injectable,
  Router,
  RouterError,
  Logger,
  Produces
} from "@typeix/resty";
import {
  APIGatewayProxyEvent,
  APIGatewayEventDefaultAuthorizerContext, APIGatewayEventIdentity,
  APIGatewayEventRequestContextWithAuthorizer, Context
} from "aws-lambda";

import {isGatewayProxyAuthEvent, lambdaServer, LambdaServerConfig} from "./lambda";
import {LambdaContext, LambdaEvent} from "./decorators/lambda";



describe("fakeHttpServer", () => {


  let identity: APIGatewayEventIdentity = {
    cognitoIdentityPoolId: null,
    accountId: null,
    cognitoIdentityId: null,
    caller: null,
    sourceIp: "1.1.1.1",
    principalOrgId: null,
    accessKey: null,
    cognitoAuthenticationType: null,
    cognitoAuthenticationProvider: null,
    userArn: null,
    // eslint-disable-next-line max-len
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36 Edg/81.0.416.68",
    user: null,
    apiKey: null,
    apiKeyId: null
  };
  let requestContext: APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext> = {
    accountId: "111122223333",
    apiId: "ibpv70npw6",
    protocol: "HTTP/1.1",
    httpMethod: "GET",
    path: "/v1",
    stage: "v1",
    requestId: "b25e63dd-c0a8-4691-8b2a-5d152c9ec6aa",
    requestTimeEpoch: 1588437422229,
    resourceId: "tfcr3vy1c1",
    resourcePath: "/",
    identity: identity,
    authorizer: {}
  };
  let event: APIGatewayProxyEvent = {
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "GET",
    isBase64Encoded: false,
    path: "/",
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    resource: "/",
    requestContext: requestContext
  };

  @Injectable()
  class WhateverService {
    // eslint-disable-next-line no-shadow
    wrap(event) {
      return event;
    }
  }

  @Controller({
    path: "/",
    providers: [WhateverService]
  })
  class LambdaController {

    @LambdaEvent()
    private event: APIGatewayProxyEvent;

    @LambdaContext()
    private context: Context;

    @GET()
    @Produces("application/json")
    actionIndex() {
      return this.event;
    }

    @GET("/routing")
    @Produces("application/json")
    routingEvent() {
      return {
        type: "routing"
      };
    }


    @OnError("(.*)")
    throwError() {
      throw new RouterError("", 500);
    }

    @Produces("application/json")
    @GET("property")
    // eslint-disable-next-line no-shadow
    actionProperty(@LambdaEvent() event,
                   @Inject() service: WhateverService,
                   @Inject(WhateverService) serviceB
    ) {
      return serviceB.wrap(service.wrap(event));
    }
  }

  @Module({
    providers: []
  })
  class BModule {

  }


  @RootModule({
    imports: [BModule],
    shared_providers: [],
    providers: [
      {
        provide: Logger,
        useFactory: () => new Logger({
          options: {
            level: "error"
          }
        })
      },
      Router
    ],
    controllers: [LambdaController]
  })
  class LambdaModule {
  }


  it("isGatewayProxyAuthEvent", async () => {
    expect(isGatewayProxyAuthEvent({type: "str", methodArn: "str"})).toBeTruthy();
    expect(isGatewayProxyAuthEvent({type: "str"})).toBeFalsy();
  });


  it("Api Gateway Check /routing", async () => {
    let context = {awsRequestId: 1};
    let config = {path: "/routing", httpMethod: "GET"};
    let result = await doAction({}, context, config);
    expect(result).toEqual(JSON.stringify({
      type: "routing"
    }));
  });

  it("Api Gateway Check /", async () => {
    let context = {awsRequestId: 1};
    let result = await doAction(event, context);
    expect(result.body).toEqual(JSON.stringify(event));
    expect(result.statusCode).toBe(200);
  });


  it("Api Gateway Check /property", async () => {
    let context = {awsRequestId: 1};
    let cEvent = Object.assign(event, {
      path: "/property",
      queryStringParameters: {
        a: 1,
        b: 2
      }
    });
    expect(cEvent.path).toBe("/property");
    let result = await doAction(cEvent, context);
    expect(result.body).toEqual(JSON.stringify(cEvent));
    expect(result.statusCode).toBe(200);
  });


  it("Api Gateway Error Check",  async () => {
    let context = {awsRequestId: 1};
    let cEvent = Object.assign(event, {
      path: "/not-found",
      multiValueQueryStringParameters: {
        "names": [
          "igor"
        ],
        "keys": [
          "name",
          "value"
        ]
      }
    });
    try {
      await doAction(cEvent, context);
    } catch (e) {
      expect(e.message).toContain("Router.parseRequest: /not-found?names=igor&keys=name&keys=value no route found, method: GET");
    }

  });


  async function doAction(lambdaEvent, context, config?: LambdaServerConfig): Promise<any> {
    let handler = await lambdaServer(LambdaModule, config);
    return new Promise((resolve, reject) => {
      handler(lambdaEvent, context, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }
});
