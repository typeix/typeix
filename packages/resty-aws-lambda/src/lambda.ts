import {LambdaContext, LambdaEvent} from "./decorators/lambda";
import {
  Logger,
  RouterError,
  isObject,
  isString,
  fakeHttpServer,
  FakeServerApi,
  FakeServerResponse,
  getRequest,
  Injector
} from "@typeix/resty";

export interface LambdaServerConfig {
  path?: string;
  httpMethod?: string;
  fakeHttpServer?: FakeServerApi;
}

/**
 * @since 2.1.0
 * @function
 * @name isGatewayProxyAuthEvent
 * @param {Function} event
 */
export function isGatewayProxyAuthEvent(event: any): boolean {
  return isString(event.type) && isString(event.methodArn);
}

/**
 * @since 4.0.6
 * @function
 * @name isRoutingEvent
 * @param {Function} event
 */
function isRoutingEvent(event: any): boolean {
  return isString(event.path) && isString(event.httpMethod);
}

/**
 * @since 2.1.0
 * @function
 * @name isGatewayProxyEvent
 * @param {Function} event
 */
export function isGatewayProxyEvent(event: any): boolean {
  return isRoutingEvent(event) &&
    isObject(event.requestContext) &&
    isString(event.requestContext.resourceId) &&
    isString(event.requestContext.requestId) &&
    isString(event.requestContext.apiId);
}

/**
 * RequestInterceptor headers
 * @param headers
 * @param multi
 */
function filterHeaders(headers: Object, multi = false) {
  return Reflect.ownKeys(headers)
    .filter(key => !!multi ? Array.isArray(headers[key]) : isString(headers[key]))
    .map(key => {
      return {
        key,
        value: headers[key]
      };
    })
    .reduce((acc, entry) => {
      acc[entry.key] = entry.value;
      return acc;
    }, {});
}

const LAMBDA_EVENT = "@typeix:LAMBDA_EVENT";
const LAMBDA_CONTEXT = "@typeix:LAMBDA_CONTEXT";
/**
 * @since 2.1.0
 * @function
 * @name lambdaServer
 * @param {Function} Class httpsServer class
 * @param {LambdaServerConfig} config lambda server config
 *
 * @description
 * Use httpsServer function to https an Module.
 */
export async function lambdaServer(Class: Function, config: LambdaServerConfig = {}) {
  let fakeServerApi: FakeServerApi = config?.fakeHttpServer ?? await fakeHttpServer(Class, {
    mockProviders: [
      {
        provide: LambdaEvent,
        useFactory: lambdaInjector => {
          const request = getRequest(lambdaInjector);
          return Reflect.get(request.headers, LAMBDA_EVENT);
        },
        providers: [Injector]
      },

      {
        provide: LambdaContext,
        useFactory: lambdaInjector => {
          const request = getRequest(lambdaInjector);
          return Reflect.get(request.headers, LAMBDA_CONTEXT);
        },
        providers: [Injector]
      }
    ],
    isMockServer: true
  });
  let injector = await fakeServerApi.getModuleInjector().getInjector(Class);
  let logger: Logger = injector.get(Logger);
  logger.info("Module.info: Lambda Server started");
  return async (event: any, context: any, callback: any) => {
    let url = "/", method = "GET", headers = {
      [LAMBDA_CONTEXT]: context,
      [LAMBDA_EVENT]: event
    };
    logger.debug("LAMBDA_EVENT_" + context.awsRequestId, event);
    logger.debug("LAMBDA_CONTEXT_" + context.awsRequestId, context);
    if (isGatewayProxyEvent(event)) {
      url = event.path;
      method = event.httpMethod.toUpperCase();
      headers = Object.assign(headers, event.input?.headers ?? event.headers);
      if (event.multiValueQueryStringParameters && Object.keys(event.multiValueQueryStringParameters).length > 0) {
        url += "?" + Reflect
          .ownKeys(event.multiValueQueryStringParameters)
          .map(k => event.multiValueQueryStringParameters[k].map(v => k.toString() + "=" + v).join("&"))
          .join("&");
      } else if (event.queryStringParameters && Object.keys(event.queryStringParameters).length > 0) {
        url += "?" + Reflect
          .ownKeys(event.queryStringParameters)
          .map(k => k.toString() + "=" + event.queryStringParameters[k])
          .join("&");
      }
    } else if (isRoutingEvent(config)) {
      url = config.path;
      method = config.httpMethod.toUpperCase();
    }

    let response: FakeServerResponse = await Reflect.get(fakeServerApi, method).call(fakeServerApi, url, headers, event.body);
    if (response.statusCode >= 400) {
      logger.error("LAMBDA_EVENT_RESPONSE_" + context.awsRequestId, response.getBody().toString());
      let body = JSON.parse(response.getBody().toString());
      return callback(new RouterError(body.message, response.statusCode));
    } else {
      let responseBody = response.getBody().toString();
      logger.debug("LAMBDA_EVENT_RESPONSE_" + context.awsRequestId, responseBody);
      if (isGatewayProxyEvent(event) && !isGatewayProxyAuthEvent(event)) {
        return callback(null, {
          body: responseBody,
          headers: filterHeaders(response.getHeaders()),
          statusCode: response.getStatusCode(),
          isBase64Encoded: event.isBase64Encoded,
          multiValueHeaders: filterHeaders(response.getHeaders(), true)
        });
      } else {
        return callback(null, responseBody);
      }
    }
  };
}
